# Email Domain Setup Guide

Complete guide for purchasing a domain and configuring Resend for email sending.

## 📋 Overview

To send emails from ConnectSphere (password resets, notifications, etc.), you need to:

1. **Purchase a domain** (e.g., `connectsphere.com`)
2. **Add DNS records** in your domain registrar (Namecheap)
3. **Verify the domain** in Resend
4. **Configure `.env`** with your verified email address

---

## Step 1: Purchase Domain on Namecheap

### 1.1 Search for Available Domains

1. Go to [Namecheap.com](https://www.namecheap.com)
2. Search for your desired domain:
   - **Preferred**: `connectsphere.com`
   - **Alternative**: `connectsphere.app` (often cheaper)
   - **Other options**: `.io`, `.co`, `.net`

3. **Recommendation**: Use `.com` for professional credibility, but `.app` is cheaper if budget is a concern.

### 1.2 Purchase the Domain

1. Add the domain to cart
2. Select registration period (1 year minimum recommended)
3. Complete checkout
4. **Wait 24-48 hours** for DNS propagation (after DNS setup in Step 2)

---

## Step 2: Configure DNS Records in Namecheap

### 2.1 Access Namecheap DNS Settings

1. Log into Namecheap account
2. Go to **Domain List** → Select your domain (`connectsphere.com`)
3. Click **Manage** → **Advanced DNS** tab

### 2.2 Add Resend DNS Records

Resend requires **3 DNS records** for domain verification:

#### **Record 1: SPF (TXT)**

```
Type: TXT
Host: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: Automatic (or 3600)
```

#### **Record 2: DKIM (TXT)**

You'll get this from Resend after adding the domain (Step 3.1):

```
Type: TXT
Host: resend._domainkey (or resend._domainkey.connectsphere.com)
Value: [Copied from Resend dashboard]
TTL: Automatic (or 3600)
```

#### **Record 3: DMARC (TXT)** - Optional but recommended

```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:your-email@connectsphere.com
TTL: Automatic (or 3600)
```

### 2.3 Save DNS Records

- Click **Save All Changes** (green checkmark)
- **Wait 24-48 hours** for DNS propagation (can check with `dig` or DNS checker tools)

---

## Step 3: Verify Domain in Resend

### 3.1 Add Domain to Resend

1. Log into [Resend Dashboard](https://resend.com/domains)
2. Click **Add Domain**
3. Enter your domain: `connectsphere.com`
4. Click **Add Domain**

### 3.2 Copy DKIM Record

1. Resend will show you a **DKIM record** (looks like a long string)
2. **Copy this value** → Go back to Namecheap
3. Add it as a **TXT record** with host `resend._domainkey` (see Step 2.2)

### 3.3 Wait for Verification

- Resend will verify your domain automatically
- **Status**: Shows "Pending" → "Verified" (usually 24-48 hours)
- You'll receive an email when verified

---

## Step 4: Configure `.env` File

### 4.1 Update Email Configuration

Once domain is verified, update your `.env`:

```env
# Resend API Key (from Resend Dashboard → API Keys)
RESEND_API_KEY=re_your_api_key_here

# Email sender address (MUST match your verified domain)
EMAIL_FROM=noreply@connectsphere.com
```

**Important**:

- ✅ `EMAIL_FROM` **must** be on your verified domain (`@connectsphere.com`)
- ❌ Cannot use Gmail or other unverified domains in production
- ✅ You can use any subdomain: `noreply@`, `hello@`, `support@`, etc.

### 4.2 Alternative Email Addresses

You can use different "from" addresses on the same domain:

```env
# Password reset emails
EMAIL_FROM=noreply@connectsphere.com

# Welcome emails (if you add this feature later)
EMAIL_FROM=hello@connectsphere.com

# Support emails
EMAIL_FROM=support@connectsphere.com
```

---

## Step 5: Test Email Sending

### 5.1 Run Test Script

```bash
# Test email service
npm run test:email

# Or use the comprehensive test
npm run test:email:comprehensive
```

### 5.2 Verify in Resend Dashboard

1. Go to [Resend Dashboard → Logs](https://resend.com/emails)
2. Check **Sent** tab for test emails
3. Verify **Delivery Status**: "Delivered"

---

## 🔧 Troubleshooting

### Domain Not Verifying

**Problem**: Resend shows "Pending" after 48 hours

**Solutions**:

1. Check DNS propagation: Use [dnschecker.org](https://dnschecker.org) to verify records globally
2. Verify TXT records in Namecheap match Resend exactly (no extra spaces)
3. Wait longer (DNS can take up to 72 hours)
4. Contact Namecheap support if DNS records not appearing

### Emails Going to Spam

**Solutions**:

1. Add **DMARC record** (Step 2.2, Record 3)
2. Use a **professional email address** (`noreply@connectsphere.com` not `test@connectsphere.com`)
3. Avoid spam trigger words in subject lines
4. Gradually warm up your domain (start with low volume)

### "Invalid from field" Error

**Problem**: Resend returns "Invalid from field"

**Solutions**:

1. Check `EMAIL_FROM` in `.env` matches verified domain exactly
2. Ensure domain status in Resend is **"Verified"** (not "Pending")
3. Use lowercase email address (no uppercase)
4. Format: `name@domain.com` (not `name@subdomain.domain.com` unless subdomain is verified)

---

## 📝 Quick Checklist

- [ ] Domain purchased on Namecheap (`connectsphere.com`)
- [ ] DNS records added in Namecheap (SPF, DKIM, DMARC)
- [ ] Domain added in Resend dashboard
- [ ] DKIM record from Resend added to Namecheap DNS
- [ ] Domain verified in Resend (status: "Verified")
- [ ] `RESEND_API_KEY` added to `.env`
- [ ] `EMAIL_FROM=noreply@connectsphere.com` in `.env`
- [ ] Test email sent successfully
- [ ] Email received in inbox (not spam)

---

## 💰 Cost Estimate

- **Domain**: `connectsphere.com` ~$10-15/year (Namecheap)
- **Resend**: Free tier = 3,000 emails/month, then $20/month for 50k emails
- **Total First Year**: ~$10-15 (domain only, free Resend tier)

---

## 🚀 Next Steps

After domain setup:

1. ✅ Update `.env` with verified `EMAIL_FROM`
2. ✅ Test password reset emails
3. ✅ Monitor Resend logs for delivery rates
4. 📧 Consider adding welcome emails, verification emails, etc.

---

## 📚 Additional Resources

- [Resend Domain Verification Guide](https://resend.com/docs/dashboard/domains/introduction)
- [Namecheap DNS Management](https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-manage-dns-for-your-domain/)
- [DNS Checker Tool](https://dnschecker.org)
