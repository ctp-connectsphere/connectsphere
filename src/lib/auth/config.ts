import { prisma } from '@/lib/db/edge-connection';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

// Get OAuth credentials from environment variables
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

// Validate OAuth credentials
if (!googleClientId || !googleClientSecret) {
  console.warn('⚠️ Google OAuth credentials not found. Google login will not work.');
}
if (!githubClientId || !githubClientSecret) {
  console.warn('⚠️ GitHub OAuth credentials not found. GitHub login will not work.');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    // Only add Google provider if credentials are available
    ...(googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    // Only add GitHub provider if credentials are available
    ...(githubClientId && githubClientSecret
      ? [
          GitHub({
            clientId: githubClientId,
            clientSecret: githubClientSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials): Promise<any> => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email);
        const password = String(credentials.password);

        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            return null;
          }

          // Temporarily allow unverified sign-in for demo if explicitly enabled
          const allowUnverified =
            process.env.ALLOW_UNVERIFIED_SIGNIN === 'true';
          if (!user.isVerified && !allowUnverified) {
            return null;
          }

          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            image: user.profileImageUrl ?? undefined,
            role: 'student',
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in - create or link user account
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          const email = user.email;
          if (!email) return false;

          // Check if user exists (with retry for connection errors)
          let dbUser: any;
          try {
            dbUser = await prisma.user.findUnique({ where: { email } });
          } catch (error: any) {
            const isConnectionError = 
              error?.message?.includes('Closed') ||
              error?.message?.includes('connection') ||
              error?.code === 'P1001' ||
              error?.code === 'P1008';
            if (isConnectionError) {
              await new Promise(resolve => setTimeout(resolve, 500));
              dbUser = await prisma.user.findUnique({ where: { email } });
            } else {
              throw error;
            }
          }

          if (!dbUser) {
            // Create new user from OAuth
            const nameParts = user.name?.split(' ') || ['User', ''];
            const firstName = nameParts[0] || 'User';
            const lastName = nameParts.slice(1).join(' ') || '';

            try {
              dbUser = await prisma.user.create({
                data: {
                  email,
                  firstName,
                  lastName,
                  university: email.split('@')[1] || 'Unknown University',
                  passwordHash: '',
                  profileImageUrl: user.image || null,
                  isVerified: true,
                  emailVerifiedAt: new Date(),
                  isActive: true,
                },
              });
            } catch (error: any) {
              const isConnectionError = 
                error?.message?.includes('Closed') ||
                error?.message?.includes('connection') ||
                error?.code === 'P1001' ||
                error?.code === 'P1008';
              if (isConnectionError) {
                await new Promise(resolve => setTimeout(resolve, 500));
                dbUser = await prisma.user.create({
                  data: {
                    email,
                    firstName,
                    lastName,
                    university: email.split('@')[1] || 'Unknown University',
                    passwordHash: '',
                    profileImageUrl: user.image || null,
                    isVerified: true,
                    emailVerifiedAt: new Date(),
                    isActive: true,
                  },
                });
              } else {
                throw error;
              }
            }

            // Create user profile
            try {
              await prisma.userProfile.create({
                data: {
                  userId: dbUser.id,
                  onboardingCompleted: false,
                },
              });
            } catch (error: any) {
              const isConnectionError = 
                error?.message?.includes('Closed') ||
                error?.message?.includes('connection') ||
                error?.code === 'P1001' ||
                error?.code === 'P1008';
              if (isConnectionError) {
                await new Promise(resolve => setTimeout(resolve, 500));
                await prisma.userProfile.create({
                  data: {
                    userId: dbUser.id,
                    onboardingCompleted: false,
                  },
                });
              } else {
                throw error;
              }
            }
          } else {
            // Update existing user with OAuth info if needed
            try {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                  profileImageUrl: user.image || dbUser.profileImageUrl,
                  isVerified: true,
                  emailVerifiedAt: dbUser.emailVerifiedAt || new Date(),
                },
              });
            } catch (error: any) {
              const isConnectionError = 
                error?.message?.includes('Closed') ||
                error?.message?.includes('connection') ||
                error?.code === 'P1001' ||
                error?.code === 'P1008';
              if (isConnectionError) {
                await new Promise(resolve => setTimeout(resolve, 500));
                await prisma.user.update({
                  where: { id: dbUser.id },
                  data: {
                    profileImageUrl: user.image || dbUser.profileImageUrl,
                    isVerified: true,
                    emailVerifiedAt: dbUser.emailVerifiedAt || new Date(),
                  },
                });
              } else {
                throw error;
              }
            }
          }

          // Link OAuth account
          try {
            await prisma.account.upsert({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
              update: {
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at || null,
                token_type: account.token_type,
                scope: account.scope,
              },
              create: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at || null,
                token_type: account.token_type,
                scope: account.scope,
              },
            });
          } catch (error: any) {
            const isConnectionError = 
              error?.message?.includes('Closed') ||
              error?.message?.includes('connection') ||
              error?.code === 'P1001' ||
              error?.code === 'P1008';
            if (isConnectionError) {
              await new Promise(resolve => setTimeout(resolve, 500));
              await prisma.account.upsert({
                where: {
                  provider_providerAccountId: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                  },
                },
                update: {
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at || null,
                  token_type: account.token_type,
                  scope: account.scope,
                },
                create: {
                  userId: dbUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at || null,
                  token_type: account.token_type,
                  scope: account.scope,
                },
              });
            } else {
              throw error;
            }
          }

          // Update user object for JWT
          user.id = dbUser.id;
          user.name = `${dbUser.firstName} ${dbUser.lastName}`;
          user.role = 'student';
        } catch (error) {
          console.error('OAuth sign-in error:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }: any) {
      console.log('🔄 JWT callback:', {
        user: user?.email,
        token: token?.email,
        account: account?.provider,
        hasToken: !!token,
      });

      if (user) {
        console.log('✅ Setting token from user:', user.email);
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role || 'student';
      }

      console.log('🔄 JWT token result:', { id: token.id, email: token.email });
      return token;
    },
    async session({ session, token }: any) {
      console.log('📋 Session callback:', {
        token: token?.email,
        session: session?.user?.email,
      });

      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          image: token.image as string,
          role: token.role as string,
        };
        console.log('✅ Session updated:', session.user);
      }

      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
});

// Export handlers for API routes
export const { GET, POST } = handlers;
