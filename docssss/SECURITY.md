# Security Guidelines

## Environment Variables

### ⚠️ CRITICAL: Never Commit Secrets

**Never commit files containing real secrets, API keys, passwords, or credentials to git.**

### Environment File Management

1. **`.env.local`** - Local development secrets (already in `.gitignore`)
2. **`.env-pro`** - Production secrets (already in `.gitignore`)
3. **`.env.example`** - Template file with placeholder values (safe to commit)

### Required Environment Variables

See the repository for environment variable templates. Copy the template and fill in your actual values locally.

### If Secrets Have Been Exposed

If you've accidentally committed secrets to git:

1. **Remove the file from git tracking immediately:**

   ```bash
   git rm --cached .env-pro
   git commit -m "security: remove secrets from tracking"
   ```

2. **Rotate all exposed credentials:**
   - Database passwords
   - OAuth client secrets
   - API keys (Resend, Cloudinary, Pusher, Sentry)
   - JWT and authentication secrets
   - Any other sensitive credentials

3. **Update secrets in production environments** (Vercel, etc.)

4. **Consider using git history rewriting** if secrets were pushed to a public repository (contact repository admin)

### Best Practices

- Always use environment variables for secrets
- Never hardcode credentials in source code
- Use `.env.example` to document required variables
- Verify `.gitignore` rules before committing
- Regularly rotate secrets
- Use different credentials for development and production
