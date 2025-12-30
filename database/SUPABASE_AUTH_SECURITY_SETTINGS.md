# Supabase Auth Security Settings

## Overview
These security issues cannot be fixed via SQL migrations. They must be configured in the Supabase Dashboard under **Authentication Settings**.

---

## 1. Leaked Password Protection

**Issue:** Leaked password protection is currently disabled.

**Risk Level:** WARN

**What it does:**
- Checks user passwords against the HaveIBeenPwned.org database
- Prevents users from using passwords that have been compromised in data breaches

**How to Fix:**
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Click on **Email** provider
4. Scroll to **Password Security** section
5. Enable **"Check for leaked passwords"**
6. Save changes

**Reference:** https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

---

## 2. Insufficient MFA Options

**Issue:** This project has too few multi-factor authentication (MFA) options enabled.

**Risk Level:** WARN

**What it does:**
- Provides additional authentication factors beyond passwords
- Significantly improves account security
- Protects against credential theft

**Available MFA Options:**
- **TOTP (Time-based One-Time Password)** - Apps like Google Authenticator, Authy
- **SMS** - Text message verification codes
- **Phone Call** - Voice call verification

**How to Fix:**
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Multi-factor authentication**
3. Enable at least one or more MFA methods:
   - **TOTP (Recommended):** Toggle on "Enable TOTP"
   - **Phone:** Configure phone provider (Twilio, MessageBird, etc.)
4. Configure your preferred provider credentials
5. Save changes

**Recommendation:**
- Start with **TOTP** (most secure and easiest to implement)
- Add SMS/Phone if you need broader user accessibility

**Reference:** https://supabase.com/docs/guides/auth/auth-mfa

---

## Implementation Checklist

- [ ] Enable leaked password protection
- [ ] Enable at least one MFA method (TOTP recommended)
- [ ] Test MFA enrollment flow with a test user
- [ ] Update user documentation about MFA requirements
- [ ] Consider making MFA mandatory for admin/super_admin roles

---

## Notes

These are **warnings** (not errors), but implementing them significantly improves your application's security posture. They are especially important if your application handles sensitive data or has administrative functions.
