# OAuth Setup Guide

## Issues Found

The OAuth login failures are caused by **incorrect URL/domain configuration**. Here's what needs to be fixed:

### 1. Environment Variables in Vercel

The `.env-pro` file is just a reference template. **You must set these environment variables in your Vercel dashboard:**

Go to: `Vercel Dashboard → Your Project → Settings → Environment Variables`

**Required Variables for Production:**

```
NEXTAUTH_URL=https://connectsphere-eight.vercel.app
NEXT_PUBLIC_APP_URL=https://connectsphere-eight.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here
NEXTAUTH_SECRET=your-nextauth-secret-here
```

⚠️ **Note**: Get your actual OAuth credentials from:

- Google: [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
- GitHub: [GitHub Developer Settings](https://github.com/settings/developers)

⚠️ **Important**: Make sure to:

- Select **Production** environment when adding these
- Optionally also add to **Preview** and **Development** if needed

### 2. OAuth App Redirect URIs

You must configure the redirect URIs in both Google and GitHub OAuth apps:

#### Google OAuth (Google Cloud Console)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services → Credentials**
3. Click on your OAuth 2.0 Client ID (or create one if missing)
4. Add these **Authorized redirect URIs**:
   ```
   https://connectsphere-eight.vercel.app/api/auth/callback/google
   ```
5. Add your custom domain if you have one:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

#### GitHub OAuth (GitHub Developer Settings)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on your OAuth App (or create a new one)
3. Set **Authorization callback URL** to:
   ```
   https://connectsphere-eight.vercel.app/api/auth/callback/github
   ```
4. If you have a custom domain:
   ```
   https://yourdomain.com/api/auth/callback/github
   ```

### 3. After Making Changes

1. **Redeploy** your Vercel application to pick up the new environment variables
2. **Test** OAuth login on both Google and GitHub
3. **Check logs** - the warnings should stop appearing

### 4. Testing Locally

For local development, your `.env.local` should have:

```
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

And add to Google/GitHub OAuth apps:

- Google: `http://localhost:3000/api/auth/callback/google`
- GitHub: `http://localhost:3000/api/auth/callback/github`

## Verification Checklist

- [ ] Environment variables set in Vercel dashboard (Production)
- [ ] NEXTAUTH_URL points to production domain
- [ ] Google OAuth redirect URI configured
- [ ] GitHub OAuth redirect URI configured
- [ ] Application redeployed on Vercel
- [ ] OAuth login tested successfully
- [ ] No more warnings in logs

## Troubleshooting

If OAuth still doesn't work after these changes:

1. **Check Vercel logs** for any errors
2. **Verify** environment variables are actually set (check Vercel dashboard)
3. **Confirm** redirect URIs match exactly (no trailing slashes, correct protocol https://)
4. **Wait a few minutes** - OAuth changes can take time to propagate
