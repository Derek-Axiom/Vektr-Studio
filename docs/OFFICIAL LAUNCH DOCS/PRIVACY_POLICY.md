# Privacy Policy

**Last Updated:** April 2, 2026

---

## Overview

VEKTR STUDIO ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information.

---

## Information We Collect

### Information You Provide:
- **Email address** (for authentication)
- **Artist name** (display name)
- **Bio** (optional)
- **Password** (hashed, never stored in plain text)

### Information We Generate:
- **Identity ID** (deterministic hash)
- **Recovery key** (deterministic hash)
- **Session timestamps**

### Information We Analyze:
- **Audio files** (BPM, key, energy detection)
- **Lyrics** (transcription via OpenAI Whisper API)

---

## How We Use Your Information

### Authentication:
- Verify your identity when you log in
- Generate recovery keys
- Maintain session state

### Content Processing:
- Analyze audio files (BPM, key, energy)
- Transcribe vocals (sent to OpenAI Whisper API)
- Generate deterministic visuals

### Copyright Protection:
- Generate determinism proofs
- Create session fingerprints
- Verify ownership

---

## Data Storage

### Local Storage (Your Browser):
- **Identity data** (IndexedDB)
- **Audio files** (IndexedDB)
- **Analysis data** (IndexedDB)
- **Settings** (localStorage)

**We do NOT store your data on our servers.**

### Third-Party Services:

**OpenAI Whisper API:**
- We send audio files for transcription
- OpenAI processes the audio and returns text
- Audio is deleted after processing
- See [OpenAI Privacy Policy](https://openai.com/privacy)

**No other third-party services are used.**

---

## Data Sharing

### We DO NOT:
- ❌ Sell your data
- ❌ Share your data with advertisers
- ❌ Track your usage
- ❌ Collect analytics
- ❌ Use cookies for tracking

### We DO:
- ✅ Send audio to OpenAI for transcription (with your consent)
- ✅ Store data locally in your browser
- ✅ Generate deterministic proofs for copyright protection

---

## Your Rights

### You Have the Right To:
- **Access** your data (it's in your browser)
- **Export** your data (identity backup feature)
- **Delete** your data (clear browser data)
- **Opt-out** of transcription (don't use the feature)

### How to Exercise Your Rights:
- **Access:** Open browser DevTools → Application → IndexedDB
- **Export:** Settings → Export Identity
- **Delete:** Settings → Delete Account (or clear browser data)

---

## Data Retention

### How Long We Keep Your Data:

**In Your Browser:**
- Forever (until you clear browser data or delete your account)

**On Our Servers:**
- We don't store your data on our servers

**Third-Party Services:**
- OpenAI: Audio deleted after transcription (per their policy)

---

## Security

### How We Protect Your Data:

- **Password hashing:** SHA-256 with random salt
- **Local storage:** IndexedDB (encrypted at rest by browser)
- **No server storage:** Your data never leaves your device (except transcription)
- **HTTPS:** All connections are encrypted

### What You Should Do:
- Use a strong password (8+ characters)
- Save your recovery key securely
- Don't share your password
- Log out on shared devices

---

## Children's Privacy

VEKTR STUDIO is not intended for children under 13. We do not knowingly collect information from children under 13.

If you believe a child under 13 has created an account, please contact us at privacy@axiometric.tech.

---

## GDPR Compliance (EU Users)

### Legal Basis for Processing:
- **Consent:** You consent to transcription when you use the feature
- **Contract:** Processing is necessary to provide the service
- **Legitimate Interest:** Copyright protection

### Your GDPR Rights:
- Right to access
- Right to rectification
- Right to erasure
- Right to data portability
- Right to object

**To exercise your rights:** Email privacy@axiometric.tech

---

## CCPA Compliance (California Users)

### Your CCPA Rights:
- Right to know what data we collect
- Right to delete your data
- Right to opt-out of sale (we don't sell data)
- Right to non-discrimination

**To exercise your rights:** Email privacy@axiometric.tech

---

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of changes by:
- Updating the "Last Updated" date
- Posting a notice in the app
- Emailing you (if we have your email)

**Continued use of VEKTR STUDIO after changes means you accept the new policy.**

---

## Contact Us

**Privacy Questions:**
- Email: privacy@axiometric.tech
- Address: [Your Address]

**Data Protection Officer:**
- Email: dpo@axiometric.tech

---

## Summary (TL;DR)

- ✅ Your data is stored locally in your browser
- ✅ We don't sell or share your data
- ✅ We don't track you
- ✅ Audio is sent to OpenAI for transcription (with consent)
- ✅ You can export/delete your data anytime
- ✅ We use SHA-256 for security
- ✅ GDPR and CCPA compliant

**Your music. Your data. Your control.**
