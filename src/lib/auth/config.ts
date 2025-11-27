import { prisma } from '@/lib/db/edge-connection';
import { logger } from '@/lib/utils/logger';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

// Get OAuth credentials from environment variables
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

// Track if warnings have been logged to avoid spam
let warningsLogged = false;

// Validate OAuth credentials and log status
const hasGoogle = !!(googleClientId && googleClientSecret);
const hasGitHub = !!(githubClientId && githubClientSecret);

// Log OAuth provider status (once per instance)
if (!warningsLogged) {
  if (!hasGoogle) {
    logger.warn(
      'Google OAuth credentials not found. Google login will not work.',
      {
        hasClientId: !!googleClientId,
        hasClientSecret: !!googleClientSecret,
      }
    );
  } else {
    logger.info('Google OAuth provider configured successfully');
  }

  if (!hasGitHub) {
    logger.warn(
      'GitHub OAuth credentials not found. GitHub login will not work.',
      {
        hasClientId: !!githubClientId,
        hasClientSecret: !!githubClientSecret,
      }
    );
  } else {
    logger.info('GitHub OAuth provider configured successfully');
  }
  warningsLogged = true;
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
    ...(hasGoogle
      ? [
          Google({
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    // Only add GitHub provider if credentials are available
    ...(hasGitHub
      ? [
          GitHub({
            clientId: githubClientId!,
            clientSecret: githubClientSecret!,
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
          logger.error('Authentication error', error);
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
          if (!email) {
            logger.warn('OAuth sign-in failed: no email provided', {
              provider: account.provider,
            });
            return false;
          }

          // Extract user information from OAuth profile
          let firstName = 'User';
          let lastName = '';
          let profileImageUrl = user.image || null;

          if (account.provider === 'google' && profile) {
            // Google profile structure
            const googleProfile = profile as any;
            firstName =
              googleProfile.given_name ||
              googleProfile.name?.split(' ')[0] ||
              firstName;
            lastName =
              googleProfile.family_name ||
              googleProfile.name?.split(' ').slice(1).join(' ') ||
              '';
            profileImageUrl = googleProfile.picture || profileImageUrl;
            logger.debug('Google OAuth profile', {
              email,
              given_name: googleProfile.given_name,
              family_name: googleProfile.family_name,
              picture: googleProfile.picture,
            });
          } else if (account.provider === 'github' && profile) {
            // GitHub profile structure
            const githubProfile = profile as any;
            const nameParts =
              (githubProfile.name || user.name || '').split(' ') || [];
            firstName = nameParts[0] || githubProfile.login || firstName;
            lastName = nameParts.slice(1).join(' ') || '';
            profileImageUrl = githubProfile.avatar_url || profileImageUrl;
            logger.debug('GitHub OAuth profile', {
              email,
              name: githubProfile.name,
              login: githubProfile.login,
              avatar_url: githubProfile.avatar_url,
            });
          } else {
            // Fallback to user.name if profile is not available
            const nameParts = user.name?.split(' ') || ['User', ''];
            firstName = nameParts[0] || firstName;
            lastName = nameParts.slice(1).join(' ') || '';
          }

          // Check if user exists - use select to avoid querying non-existent columns
          let dbUser: any;
          try {
            dbUser = await prisma.user.findUnique({
              where: { email },
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                university: true,
                profileImageUrl: true,
                isVerified: true,
                emailVerifiedAt: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                // Explicitly exclude major and settings to avoid errors if columns don't exist
              },
            });
          } catch (error: any) {
            // Handle column not found errors gracefully
            if (error?.message?.includes('does not exist')) {
              logger.warn(
                'Database column missing, retrying with minimal select',
                {
                  error: error.message,
                }
              );
              // Retry with minimal fields only
              try {
                dbUser = await prisma.user.findUnique({
                  where: { email },
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    university: true,
                    profileImageUrl: true,
                    isVerified: true,
                    emailVerifiedAt: true,
                    isActive: true,
                  },
                });
              } catch (retryError: any) {
                const isConnectionError =
                  retryError?.message?.includes('Closed') ||
                  retryError?.message?.includes('connection') ||
                  retryError?.code === 'P1001' ||
                  retryError?.code === 'P1008';
                if (isConnectionError) {
                  await new Promise(resolve => setTimeout(resolve, 500));
                  dbUser = await prisma.user.findUnique({
                    where: { email },
                    select: {
                      id: true,
                      email: true,
                      firstName: true,
                      lastName: true,
                      university: true,
                      profileImageUrl: true,
                      isVerified: true,
                      emailVerifiedAt: true,
                      isActive: true,
                    },
                  });
                } else {
                  throw retryError;
                }
              }
            } else {
              const isConnectionError =
                error?.message?.includes('Closed') ||
                error?.message?.includes('connection') ||
                error?.code === 'P1001' ||
                error?.code === 'P1008';
              if (isConnectionError) {
                await new Promise(resolve => setTimeout(resolve, 500));
                dbUser = await prisma.user.findUnique({
                  where: { email },
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    university: true,
                    profileImageUrl: true,
                    isVerified: true,
                    emailVerifiedAt: true,
                    isActive: true,
                  },
                });
              } else {
                throw error;
              }
            }
          }

          if (!dbUser) {
            // Create new user from OAuth
            const emailDomain = email.split('@')[1] || 'Unknown University';

            try {
              dbUser = await prisma.user.create({
                data: {
                  email,
                  firstName,
                  lastName,
                  university: emailDomain,
                  passwordHash: '', // OAuth users don't need password
                  profileImageUrl,
                  isVerified: true, // OAuth emails are pre-verified
                  emailVerifiedAt: new Date(),
                  isActive: true,
                  // major and settings are optional, will be null by default
                },
              });
              logger.info('Created new user from OAuth', {
                email,
                provider: account.provider,
                userId: dbUser.id,
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
                    university: emailDomain,
                    passwordHash: '',
                    profileImageUrl,
                    isVerified: true,
                    emailVerifiedAt: new Date(),
                    isActive: true,
                  },
                });
              } else {
                logger.error('Failed to create user from OAuth', error);
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
                  profileImageUrl: profileImageUrl || dbUser.profileImageUrl,
                  isVerified: true, // Ensure OAuth users are verified
                  emailVerifiedAt: dbUser.emailVerifiedAt || new Date(),
                  lastLoginAt: new Date(), // Update last login time
                },
              });
              logger.debug('Updated existing user from OAuth', {
                email,
                provider: account.provider,
                userId: dbUser.id,
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
                    profileImageUrl: profileImageUrl || dbUser.profileImageUrl,
                    isVerified: true,
                    emailVerifiedAt: dbUser.emailVerifiedAt || new Date(),
                    lastLoginAt: new Date(),
                  },
                });
              } else {
                logger.error('Failed to update user from OAuth', error);
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
                refreshToken: (account.refreshToken as string | null) || null,
                accessToken: (account.accessToken as string | null) || null,
                expiresAt: (account.expiresAt as number | null) || null,
                tokenType: (account.tokenType as string | null) || null,
                scope: (account.scope as string | null) || null,
              },
              create: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refreshToken: (account.refreshToken as string | null) || null,
                accessToken: (account.accessToken as string | null) || null,
                expiresAt: (account.expiresAt as number | null) || null,
                tokenType: (account.tokenType as string | null) || null,
                scope: (account.scope as string | null) || null,
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
                  refreshToken: (account.refreshToken as string | null) || null,
                  accessToken: (account.accessToken as string | null) || null,
                  expiresAt: (account.expiresAt as number | null) || null,
                  tokenType: (account.tokenType as string | null) || null,
                  scope: (account.scope as string | null) || null,
                },
                create: {
                  userId: dbUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refreshToken: (account.refreshToken as string | null) || null,
                  accessToken: (account.accessToken as string | null) || null,
                  expiresAt: (account.expiresAt as number | null) || null,
                  tokenType: (account.tokenType as string | null) || null,
                  scope: (account.scope as string | null) || null,
                },
              });
            } else {
              throw error;
            }
          }

          // Update user object for JWT
          user.id = dbUser.id;
          user.name = `${dbUser.firstName} ${dbUser.lastName}`;
          (user as any).role = 'student';
        } catch (error) {
          logger.error('OAuth sign-in error', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }: any) {
      logger.debug('JWT callback', {
        userEmail: user?.email,
        tokenEmail: token?.email,
        accountProvider: account?.provider,
        hasToken: !!token,
      });

      if (user) {
        logger.debug('Setting token from user', { email: user.email });
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = (user as any).role || 'student';
      }

      logger.debug('JWT token result', { id: token.id, email: token.email });
      return token;
    },
    async session({ session, token }: any) {
      logger.debug('Session callback', {
        tokenEmail: token?.email,
        sessionEmail: session?.user?.email,
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
        logger.debug('Session updated', {
          userId: session.user.id,
          email: session.user.email,
        });
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
