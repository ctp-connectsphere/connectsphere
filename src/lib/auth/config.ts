import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db/connection'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

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
    maxAge: 30 * 24 * 60 * 60
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user?.id) token.userId = user.id
      return token
    },
    async session({ session, token }: any) {
      if (token?.userId) {
        ;(session as any).user = (session as any).user || {}
        ;(session as any).user.id = token.userId
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  }
}

export const { auth, signIn, signOut } = NextAuth(authOptions)


