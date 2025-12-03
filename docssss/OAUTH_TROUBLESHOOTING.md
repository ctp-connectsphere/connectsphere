# OAuth Troubleshooting Guide

## Current Issue: OAuth Login Still Not Working

If OAuth login buttons appear but clicking them doesn't work (redirects back to login), follow these steps:

### Step 1: Check if Environment Variables are Loaded

I've created a debug endpoint to check if your environment variables are being loaded:

1. **Visit this URL in your browser:**

   ```
   https://connectsphere-eight.vercel.app/api/auth/debug
   ```

2. **Check the response:**
   - `google.configured` should be `true`
   - `github.configured` should be `true`
   - `nextAuth.url` should show your production URL

**If any of these are false or missing:**

- The environment variables aren't being loaded
- See Step 2 below

### Step 2: Verify Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. **Verify these variables exist:**
   - ✅ `GOOGLE_CLIENT_ID`
   - ✅ `GOOGLE_CLIENT_SECRET`
   - ✅ `GITHUB_CLIENT_ID`
   - ✅ `GITHUB_CLIENT_SECRET`
   - ✅ `NEXTAUTH_URL` (should be `https://connectsphere-eight.vercel.app`)

3. **Check the environment scope:**
   - The variables should be set for **Production** environment
   - OR set for **All Environments** (which includes Production)

4. **Important:** If you just added these variables:
   - **You MUST redeploy your application** for the changes to take effect
   - Environment variables are loaded when Lambda functions start
   - Existing deployments don't automatically pick up new env vars

### Step 3: Redeploy Your Application

**Option A: Redeploy via Vercel Dashboard**

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **"⋯"** (three dots) menu
4. Click **"Redeploy"**
5. Wait for deployment to complete

**Option B: Trigger via Git**

```bash
# Make a small change and push
git commit --allow-empty -m "Trigger redeploy for OAuth env vars"
git push
```

### Step 4: Check Provider Availability

After redeploying, check if providers are available:

1. **Visit the providers endpoint:**

   ```
   https://connectsphere-eight.vercel.app/api/auth/providers
   ```

2. **Expected response:**

   ```json
   {
     "google": { ... },
     "github": { ... },
     "credentials": { ... }
   }
   ```

3. **If `google` or `github` are missing:**
   - The credentials aren't being loaded
   - Check Step 2 again

### Step 5: Verify OAuth App Configuration

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. **Authorized redirect URIs** must include:
   ```
   https://connectsphere-eight.vercel.app/api/auth/callback/google
   ```
5. **Authorized JavaScript origins** should include:
   ```
   https://connectsphere-eight.vercel.app
   ```

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click your OAuth App
3. **Authorization callback URL** must be exactly:
   ```
   https://connectsphere-eight.vercel.app/api/auth/callback/github
   ```
4. **Homepage URL** should be:
   ```
   https://connectsphere-eight.vercel.app
   ```

### Step 6: Wait for Changes to Propagate

- **OAuth changes:** Can take 5 minutes to a few hours
- **Vercel deployment:** Usually takes 1-2 minutes
- **Environment variables:** Available immediately after redeploy

### Step 7: Check Logs

1. Go to **Vercel Dashboard** → **Deployments** → Latest deployment
2. Click **"View Function Logs"** or **"Logs"** tab
3. Look for:
   - ✅ `Google OAuth provider configured successfully`
   - ✅ `GitHub OAuth provider configured successfully`
   - ❌ `Google OAuth credentials not found` (means env vars not loaded)

### Common Issues

#### Issue: Environment variables show in Vercel but not loaded at runtime

**Solution:**

- Make sure variables are set for **Production** environment
- Redeploy the application
- Check that variable names match exactly (case-sensitive)

#### Issue: OAuth redirect fails with "redirect_uri_mismatch"

**Solution:**

- Verify redirect URI in OAuth app matches exactly
- No trailing slashes
- Use `https://` not `http://`
- Wait for changes to propagate (can take time)

#### Issue: Providers endpoint shows empty object

**Solution:**

- Environment variables aren't loaded
- Redeploy application
- Check debug endpoint (`/api/auth/debug`)

### Testing Checklist

After following all steps:

- [ ] Debug endpoint shows providers configured: `/api/auth/debug`
- [ ] Providers endpoint returns Google & GitHub: `/api/auth/providers`
- [ ] OAuth buttons appear on login page
- [ ] Clicking Google redirects to Google login
- [ ] Clicking GitHub redirects to GitHub login
- [ ] After OAuth login, user is redirected back and logged in
- [ ] No errors in Vercel function logs

### Quick Test Commands

```bash
# Check if providers are available (should show google & github)
curl https://connectsphere-eight.vercel.app/api/auth/providers

# Check environment variable status
curl https://connectsphere-eight.vercel.app/api/auth/debug
```

### Still Not Working?

If after all these steps it's still not working:

1. **Check Vercel function logs** for specific error messages
2. **Test locally** first with `.env.local` to verify OAuth flow works
3. **Verify** you're testing on the production domain, not a preview deployment
4. **Double-check** all URLs match exactly (no typos, correct protocol)
