import { prisma } from '@/lib/db/edge-connection'
import bcrypt from 'bcryptjs'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
})

export const authOptions = {
    // Temporarily disable adapter to fix session issues
    // adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
    providers: [
        Credentials({
            name: 'Email and Password',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            authorize: async (credentials) => {
                console.log('🔐 NextAuth authorize called with:', { email: credentials?.email })
                
                const parsed = credentialsSchema.safeParse(credentials)
                if (!parsed.success) {
                    console.log('❌ Credentials validation failed:', parsed.error)
                    return null
                }

                const { email, password } = parsed.data
                console.log('🔍 Looking up user:', email)
                
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
            
            if (user?.id) {
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
        },
        async signOut() {
            // Session cleanup can be added here if needed
        }
    },
    pages: {
        signIn: '/login',
        error: '/auth/error'
    },
    events: {
        async signOut() {
            // Session cleanup can be added here if needed
        }
    }
}

export const { auth, signIn, signOut } = NextAuth(authOptions)


