# Email Domain Setup Guide - Resend

This guide explains how to set up email verification with Resend using your own verified domain for production.

---

## Table of Contents

1. [Overview](#overview)
2. [Resend Basics](#resend-basics)
3. [Domain Verification Process](#domain-verification-process)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Resend?

Resend is a modern email API for developers. It provides:

- **Simple API** - Easy integration with Next.js
- **High deliverability** - Emails reach inboxes, not spam
- **Domain verification** - Send from your own domain (production)
- **Test domain** - `onboarding@resend.dev` works in development

### Why Domain Verification?

**Development (No Domain Needed):**

- ✅ Use Resend's test domain: `onboarding@resend.dev`
- ✅ Works immediately with just an API key
- ✅ Perfect for local development and testing

**Production (Domain Required):**

- ✅ Send from your own domain: `noreply@yourdomain.com`
- ✅ Better deliverability (emails less likely to go to spam)
- ✅ Professional branding
- ✅ Requires DNS verification

### ⚠️ Important: Personal Emails Cannot Be Used

**You cannot use personal emails** (Gmail, Yahoo, Outlook, university emails, etc.) as `EMAIL_FROM` in Resend. Resend requires **domain verification** for production email sending.

**Why Personal Emails Don't Work:**

- Resend will reject them with "Invalid from field" error
- Email providers prevent third-party sending from their domains
- This is a security measure to prevent email spoofing

**Solution:** Use `onboarding@resend.dev` for development, or verify your own domain for production.

---

## Resend Basics

### How It Works

1. **Sign up** at [resend.com](https://resend.com)
2. **Get API key** - Use this in `RESEND_API_KEY` environment variable
3. **Add domain** (for production) - Verify ownership via DNS records
4. **Send emails** - Use Resend API in your code

### Current Setup

Your code already uses Resend:

- ✅ `src/lib/email/service.ts` - Email service with Resend
- ✅ `src/lib/config/env.ts` - Email configuration
- ✅ Verification emails already implemented

**Current Configuration:**

```typescript
// src/lib/config/env.ts
export const EMAIL_CONFIG = {
  apiKey: process.env.RESEND_API_KEY!,
  from: process.env.EMAIL_FROM || 'onboarding@resend.dev', // Fallback to test domain
};
```

---

## Domain Verification Process

### What Happens When You Verify a Domain?

1. **Resend generates DNS records** you need to add
2. **You add these records** to your domain's DNS settings
3. **Resend verifies** the records (usually takes 5-60 minutes)
4. **Once verified**, you can send from `anything@yourdomain.com`

### DNS Records Required

Resend requires 3 types of DNS records:

1. **SPF Record** - Authorizes Resend to send emails from your domain
2. **DKIM Record** - Cryptographic signature to prevent email spoofing
3. **DMARC Record** (optional but recommended) - Email authentication policy

### Example DNS Records

After adding your domain in Resend dashboard, you'll see something like:

```
Type    Name                    Value
TXT     @                       v=spf1 include:resend.com ~all
TXT     resend._domainkey       [long-dkim-key]
TXT     _dmarc                  v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

---

## Step-by-Step Setup

### Step 1: Sign Up for Resend

1. Go to [resend.com](https://resend.com)
2. Click **"Sign Up"** (free tier available)
3. Create your account
4. Verify your email address

### Step 2: Get Your API Key

1. In Resend dashboard, go to **"API Keys"**
2. Click **"Create API Key"**
3. Give it a name (e.g., "ConnectSphere Production")
4. Copy the key (starts with `re_...`)
5. **Save it securely** - you can only see it once!

### Step 3: Add API Key to Your Environment

**Local Development (`.env.local`):**

```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=onboarding@resend.dev  # Test domain (no verification needed)
```

**Vercel Production:**

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add `RESEND_API_KEY` with your key
4. Add `EMAIL_FROM` (we'll set this after domain verification)

### Step 4: Purchase a Domain (If Needed)

If you don't have a domain yet:

**Recommended Domain Registrars:**

- **Namecheap** - Affordable, easy to use
- **Google Domains** - Simple interface
- **Cloudflare** - Free privacy protection
- **GoDaddy** - Popular but more expensive

**Domain Suggestions:**

- `connectsphere.app`
- `connectsphere.io`
- `connectsphere.com`
- `yourname-connectsphere.com`

**Cost:** Usually $10-15/year for `.com`, less for `.app` or `.io`

### Step 5: Add Domain to Resend

1. In Resend dashboard, go to **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `connectsphere.app`)
4. Click **"Add Domain"**

### Step 6: Get DNS Records from Resend

After adding the domain, Resend will show you the DNS records you need to add:

```
✅ SPF Record
✅ DKIM Record
✅ DMARC Record (optional)
```

**Copy all these records** - you'll add them to your domain's DNS settings.

### Step 7: Add DNS Records to Your Domain

The process varies by domain registrar. Here's the general process:

**Example: Namecheap**

1. Log in to Namecheap
2. Go to **Domain List** → Select your domain
3. Click **"Advanced DNS"**
4. Add each record:
   - Click **"Add New Record"**
   - Select record type (TXT)
   - Enter the name (e.g., `@` or `resend._domainkey`)
   - Enter the value from Resend
   - Click save

**Example: Cloudflare**

1. Log in to Cloudflare
2. Select your domain
3. Go to **DNS** tab
4. Click **"Add record"**
5. Add each TXT record from Resend

**Example: Google Domains**

1. Log in to Google Domains
2. Select your domain
3. Go to **DNS** section
4. Scroll to **"Custom resource records"**
5. Add each TXT record

### Step 8: Wait for Verification

1. After adding DNS records, go back to Resend dashboard
2. Click **"Verify"** or wait for automatic verification
3. **Wait 5-60 minutes** for DNS propagation
4. Status will change from "Pending" to "Verified" ✅

**Note:** DNS changes can take up to 48 hours, but usually complete within an hour.

### Step 9: Update Environment Variables

Once your domain is verified:

**Vercel Production Environment Variables:**

```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yourdomain.com  # Use your verified domain!
```

**Or use different addresses for different purposes:**

```env
EMAIL_FROM=noreply@connectsphere.app
EMAIL_SUPPORT=support@connectsphere.app
EMAIL_VERIFY=verify@connectsphere.app
```

---

## Configuration

### Environment Variables

**Development (`.env.local`):**

```env
# Resend API Key (get from resend.com)
RESEND_API_KEY=re_your_api_key_here

# Use test domain in development (no verification needed)
EMAIL_FROM=onboarding@resend.dev

# Or use your verified domain if you want to test with real domain
# EMAIL_FROM=noreply@yourdomain.com
```

**Production (Vercel):**

```env
# Resend API Key
RESEND_API_KEY=re_your_production_key

# Your verified domain
EMAIL_FROM=noreply@yourdomain.com
```

### Code Configuration

Your code is already set up! The email service uses:

```typescript
// src/lib/config/env.ts
export const EMAIL_CONFIG = {
  apiKey: process.env.RESEND_API_KEY!,
  from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
};
```

**No code changes needed!** Just update environment variables.

### Email Templates

Your email templates are already implemented:

- ✅ `sendVerificationEmail()` - Email verification
- ✅ `sendPasswordResetEmail()` - Password reset
- ✅ `sendWelcomeEmail()` - Welcome message

All emails will automatically use your verified domain once `EMAIL_FROM` is set.

---

## Testing

### Test Email Sending

**Option 1: Test Script**

```bash
npm run test:email
```

**Option 2: Manual Test**

1. Register a new user
2. Check email inbox (or Resend dashboard → Logs)
3. Verify email link works

### Check Resend Dashboard

1. Go to Resend dashboard → **"Logs"**
2. See all sent emails
3. Check delivery status
4. View any errors

### Test Domain Verification

**Before verification:**

- ❌ Sending from `noreply@yourdomain.com` will fail
- ✅ Sending from `onboarding@resend.dev` works

**After verification:**

- ✅ Sending from `noreply@yourdomain.com` works
- ✅ Sending from `onboarding@resend.dev` still works

### Verify DNS Records

Use online tools to check your DNS records:

1. **MXToolbox** - [mxtoolbox.com/spf.aspx](https://mxtoolbox.com/spf.aspx)
   - Enter your domain
   - Check SPF, DKIM, DMARC records

2. **DNS Checker** - [dnschecker.org](https://dnschecker.org)
   - Enter your domain
   - Check TXT records

---

## Troubleshooting

### Common Issues

**1. "Domain not verified" error**

**Problem:** Trying to send from unverified domain

**Solution:**

- Use `onboarding@resend.dev` in development
- Verify domain in Resend dashboard before using custom domain
- Wait for DNS propagation (can take up to 48 hours)

**2. DNS records not found**

**Problem:** DNS records not propagating

**Solution:**

- Wait 5-60 minutes (DNS can be slow)
- Check DNS records with online tools (MXToolbox)
- Verify you added records to correct domain registrar
- Check for typos in DNS record values

**3. "Invalid API key" error**

**Problem:** API key is incorrect or missing

**Solution:**

- Check `RESEND_API_KEY` in environment variables
- Verify key starts with `re_`
- Regenerate key in Resend dashboard if needed
- Make sure key is set in Vercel environment variables

**4. Emails going to spam**

**Problem:** Poor deliverability

**Solution:**

- Use verified domain (not test domain)
- Add DMARC record (recommended)
- Keep email content clean (avoid spam trigger words)
- Warm up domain gradually (start with low volume)

**5. "Rate limit exceeded"**

**Problem:** Sending too many emails too quickly

**Solution:**

- Resend free tier: 100 emails/day
- Upgrade to paid plan for higher limits
- Implement rate limiting in your code
- Use email queue for bulk sends

### Getting Help

1. **Resend Documentation** - [resend.com/docs](https://resend.com/docs)
2. **Resend Support** - Email support@resend.com
3. **Resend Discord** - [discord.gg/resend](https://discord.gg/resend)

---

## 🚀 Quick Start

### Development Setup (No Domain Needed)

**Steps:**

1. Sign up at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   EMAIL_FROM=onboarding@resend.dev
   ```

✅ **Works immediately!** No verification needed.

**Note:** Test domain (`onboarding@resend.dev`) only works with your Resend account email address.

### Production Setup (With Domain)

**Steps:**

1. Get API key (same as above)
2. Purchase domain (if needed) - $10-15/year
3. Add domain in Resend dashboard
4. Add DNS records to domain registrar
5. Wait for verification (5-60 minutes)
6. Update environment:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   ```

**See:** [Step-by-Step Setup](#step-by-step-setup) for detailed instructions.

---

## Quick Reference

| Scenario   | EMAIL_FROM               | Verification Required |
| ---------- | ------------------------ | --------------------- |
| Local Dev  | `onboarding@resend.dev`  | ❌ No                 |
| Testing    | `onboarding@resend.dev`  | ❌ No                 |
| Production | `noreply@yourdomain.com` | ✅ Yes                |

### Environment Variables Checklist

**Local Development:**

- [ ] `RESEND_API_KEY` in `.env.local`
- [ ] `EMAIL_FROM=onboarding@resend.dev` (or your verified domain)

**Vercel Production:**

- [ ] `RESEND_API_KEY` in Vercel environment variables
- [ ] `EMAIL_FROM=noreply@yourdomain.com` (verified domain)
- [ ] `NEXTAUTH_URL` matches your Vercel URL
- [ ] `NEXT_PUBLIC_APP_URL` matches your Vercel URL

---

## ❓ FAQ

**Q: Can I use my university email?**

- ❌ No. University emails are also personal emails and won't work.

**Q: Do I need to buy a domain right away?**

- ❌ No. Use `onboarding@resend.dev` for development. Buy domain when ready for production.

**Q: Can I test emails without a domain?**

- ✅ Yes. Use `onboarding@resend.dev` for testing.
- ⚠️ **Important**: Test domain only sends to your Resend account email (the one you signed up with)

**Q: Can I send to any email with `onboarding@resend.dev`?**

- ❌ No. Test domain only works with your Resend account email. To send to other emails, verify a domain.

**Q: Will emails from `onboarding@resend.dev` be delivered?**

- ✅ Yes, to your account email. For sending to other users, verify a domain for better deliverability.

---

## Next Steps

1. ✅ **Get Resend API key** - Sign up and create API key
2. ✅ **Add to environment** - Set `RESEND_API_KEY` in `.env.local` and Vercel
3. ✅ **Test in development** - Use `onboarding@resend.dev` (works immediately)
4. 🔄 **Purchase domain** (if needed) - Get a domain for production
5. 🔄 **Verify domain** - Add DNS records and verify in Resend
6. 🔄 **Update production** - Set `EMAIL_FROM` to your verified domain

---

_Last Updated: Nov. 2025_  
_Email Setup Guide Version: 1.0.0_
