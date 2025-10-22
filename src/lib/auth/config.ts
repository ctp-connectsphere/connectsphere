import { prisma } from '@/lib/db/edge-connection'
import { SessionService } from '@/lib/redis/session'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
})

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            name: 'Email and Password',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            authorize: async (credentials) => {
                const parsed = credentialsSchema.safeParse(credentials)
                if (!parsed.success) return null

                const { email, password } = parsed.data
                const user = await prisma.user.findUnique({ where: { email } })
                if (!user || !user.isVerified) return null

                const ok = await bcrypt.compare(password, user.passwordHash)
                if (!ok) return null

                return {
                    id: user.id,
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    image: user.profileImageUrl ?? undefined
                }
            }
        })
    ],
    session: {
        strategy: 'jwt' as const,
        maxAge: 30 * 24 * 60 * 60 // 30 days
    },
    callbacks: {
        async jwt({ token, user, trigger }: any) {
            if (user?.id) {
                token.userId = user.id
                token.email = user.email
            }

            // Store session in Redis for additional security
            if (token && trigger === 'signIn') {
                await SessionService.createSession(
                    token.sub || '',
                    {
                        userId: token.userId,
                        email: token.email,
                        name: token.name,
                        image: token.picture,
                        iat: token.iat,
                        exp: token.exp
                    }
                )
            }

            return token
        },
        async session({ session, token }: any) {
            if (token?.userId) {
                ; (session as any).user = (session as any).user || {}
                    ; (session as any).user.id = token.userId
            }

            // Validate session exists in Redis
            if (token?.sub) {
                const redisSession = await SessionService.getSession(token.sub)
                if (!redisSession) {
                    throw new Error('Session expired')
                }
            }

            return session
        },
        async signOut({ token }: any) {
            // Clean up Redis session on sign out
            if (token?.sub) {
                await SessionService.deleteSession(token.sub)
            }
        }
    },
    pages: {
        signIn: '/login',
        error: '/auth/error'
    },
    events: {
        async signOut(message: any) {
            // Clean up Redis session on sign out
            if (message.token?.sub) {
                await SessionService.deleteSession(message.token.sub)
            }
        }
    }
}

export const { auth, signIn, signOut } = NextAuth(authOptions)


