import { prisma } from '@/lib/db/edge-connection'
import bcrypt from 'bcryptjs'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            authorize: async (credentials) => {
                console.log('🔐 NextAuth authorize called with:', { email: credentials?.email })

                if (!credentials?.email || !credentials?.password) {
                    console.log('❌ Missing credentials')
                    return null
                }

                const { email, password } = credentials
                console.log('🔍 Looking up user:', email)

                try {
                    const user = await prisma.user.findUnique({ where: { email } })
                    if (!user) {
                        console.log('❌ User not found:', email)
                        return null
                    }

                    if (!user.isVerified) {
                        console.log('❌ User not verified:', email)
                        return null
                    }

                    console.log('✅ User found and verified:', email)
                    console.log('🔐 Comparing password...')

                    const ok = await bcrypt.compare(password, user.passwordHash)
                    if (!ok) {
                        console.log('❌ Password comparison failed for:', email)
                        return null
                    }

                    console.log('✅ Authentication successful for:', email)
                    return {
                        id: user.id,
                        email: user.email,
                        name: `${user.firstName} ${user.lastName}`,
                        image: user.profileImageUrl ?? undefined,
                        role: 'student'
                    }
                } catch (error) {
                    console.error('❌ Database error during auth:', error)
                    return null
                }
            }
        })
    ],
    session: {
        strategy: 'jwt' as const,
        maxAge: 30 * 24 * 60 * 60 // 30 days
    },
    callbacks: {
        async jwt({ token, user }: any) {
            console.log('🔄 JWT callback called with:', { user: user?.email, token: token?.email })

            if (user) {
                console.log('✅ Setting token from user:', user.email)
                token.id = user.id
                token.email = user.email
                token.name = user.name
                token.image = user.image
                token.role = user.role
            }

            console.log('🔄 JWT token updated:', { id: token.id, email: token.email })
            return token
        },
        async session({ session, token }: any) {
            console.log('📋 Session callback called with:', { token: token?.email, session: session?.user?.email })

            if (token) {
                session.user = {
                    ...session.user,
                    id: token.id as string,
                    email: token.email as string,
                    name: token.name as string,
                    image: token.image as string,
                    role: token.role as string
                }
                console.log('✅ Session updated:', session.user)
            }

            return session
        }
    },
    pages: {
        signIn: '/login',
        error: '/auth/error'
    }
})

// Export handlers for API routes
export const { GET, POST } = handlers