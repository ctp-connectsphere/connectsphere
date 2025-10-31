# Email Setup Options for Resend

## ❌ Personal Emails Cannot Be Used

**Important**: You **cannot** use personal emails (Gmail, Yahoo, Outlook, etc.) as `EMAIL_FROM` in Resend. Resend requires **domain verification** for production email sending.

### Why Personal Emails Don't Work:

- Resend will reject them with "Invalid from field" error
- Email providers (Gmail, etc.) prevent third-party sending from their domains
- This is a security measure to prevent email spoofing

---

## ✅ Option 1: Development/Testing (No Domain Required)

For **local development and testing**, you can use Resend's test domain:

```env
# .env (development)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=onboarding@resend.dev
```

**Limitations**:

- ✅ Works immediately (no verification needed)
- ✅ Good for development and testing
- ⚠️ **Only sends to your Resend account email** (the email you signed up with)
- ❌ **Not for production** - Emails may go to spam
- ❌ Cannot send to other email addresses (requires verified domain)

**When to use**: Local development, initial testing, before domain purchase

---

## ✅ Option 2: Production (Verified Domain Required)

For **production**, you need to purchase and verify a domain:

```env
# .env (production)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@connectsphere.com
```

**Requirements**:

1. Purchase domain (e.g., `connectsphere.com` on Namecheap)
2. Add DNS records (SPF, DKIM, DMARC)
3. Verify domain in Resend dashboard
4. Use email address from verified domain

**Benefits**:

- ✅ Professional appearance
- ✅ Better deliverability (less spam)
- ✅ Brand credibility
- ✅ Required for production

**See**: [Complete domain setup guide](./EMAIL_DOMAIN_SETUP.md) for detailed instructions

---

## 🔄 Environment-Based Configuration

You can use different `EMAIL_FROM` values per environment:

### Development (.env.local)

```env
EMAIL_FROM=onboarding@resend.dev
```

### Staging (.env.staging)

```env
EMAIL_FROM=noreply@staging.connectsphere.com
```

### Production (.env.production)

```env
EMAIL_FROM=noreply@connectsphere.com
```

---

## 📝 Quick Reference

| Scenario   | EMAIL_FROM                  | Verification Required |
| ---------- | --------------------------- | --------------------- |
| Local Dev  | `onboarding@resend.dev`     | ❌ No                 |
| Testing    | `onboarding@resend.dev`     | ❌ No                 |
| Production | `noreply@connectsphere.com` | ✅ Yes                |

---

## 🚨 Current Configuration

**Current setup** in your code:

```typescript
// src/lib/config/env.ts
from: process.env.EMAIL_FROM || 'g1097420948@gmail.com';
```

**⚠️ Problem**: The fallback `g1097420948@gmail.com` will **NOT work** with Resend.

**✅ Recommended**: Change to:

```typescript
from: process.env.EMAIL_FROM || 'onboarding@resend.dev';
```

This way, if `EMAIL_FROM` is not set, it defaults to a working test address instead of a personal email that will fail.

---

## 🔧 How to Update

1. **For Development** (now):

   ```bash
   # Add to .env
   EMAIL_FROM=onboarding@resend.dev
   ```

2. **For Production** (after domain purchase):
   ```bash
   # Update .env
   EMAIL_FROM=noreply@connectsphere.com
   ```

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
