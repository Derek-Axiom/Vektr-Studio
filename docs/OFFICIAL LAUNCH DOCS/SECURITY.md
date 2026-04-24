# Security Model

**How VEKTR STUDIO protects your data and identity.**

---

## Threat Model

### What We Protect Against:

✅ **Password theft** - SHA-256 hashing with salt
✅ **Session hijacking** - Local-only storage
✅ **Data breaches** - No server storage
✅ **Visual theft** - Deterministic proofs
✅ **Identity theft** - Recovery key system

### What We DON'T Protect Against:

❌ **Physical device theft** - Encrypt your device
❌ **Browser vulnerabilities** - Keep browser updated
❌ **Malware** - Use antivirus software
❌ **Social engineering** - Don't share your password

---

## Authentication Security

### Password Storage:

```typescript
// NEVER stored:
password: "mypassword123"

// ALWAYS stored:
passwordHash: "4d7e2a1f8c9b3e6d..." // SHA-256(password + salt)
salt: "9f3b1c2e8d7a6f5e..."         // Random 16-byte salt
```

**Why this is secure:**
- SHA-256 is cryptographically strong (used by Bitcoin)
- Salt prevents rainbow table attacks
- Hash is one-way (cannot reverse to get password)

### Identity ID Generation:

```typescript
// Deterministic (same email = same ID)
email + timestamp → SHA-256 → Identity ID

// Example:
"artist@example.com:1743589408000" → "VEKTR-A7F3C2E9D4B1"
```

**Why this is secure:**
- Deterministic (recoverable from email)
- Unique (timestamp ensures uniqueness)
- Unpredictable (SHA-256 is cryptographically random)

### Recovery Key Generation:

```typescript
// Deterministic (same email + password = same key)
email + passwordHash → SHA-256 → Recovery Key

// Example:
"artist@example.com:4d7e2a..." → "E8F2A1D5C3B4A6F7..."
```

**Why this is secure:**
- Requires both email AND password hash
- Cannot be guessed
- Deterministic (can be regenerated for verification)

---

## Data Storage Security

### IndexedDB:

**What's stored:**
- Identity data (email, passwordHash, salt)
- Audio files (Blob storage)
- Analysis data (BPM, key, energy)
- Proofs (SHA-256 hashes)

**Security features:**
- Encrypted at rest (by browser)
- Same-origin policy (only VEKTR can access)
- No network access (local-only)

**Limitations:**
- Not encrypted in transit (local-only, no transit)
- Accessible if device is compromised
- Can be cleared by user

### localStorage:

**What's stored:**
- Current user ID (for quick access)
- UI settings (theme, preferences)

**Security features:**
- Same-origin policy
- Cleared on logout

**Limitations:**
- Not encrypted
- Limited to 5-10MB
- Can be accessed via DevTools

---

## Network Security

### HTTPS:

All connections use HTTPS (TLS 1.3):
- Encrypted in transit
- Certificate validation
- Man-in-the-middle protection

### API Calls:

**OpenAI Whisper API:**
- HTTPS only
- API key in Authorization header
- Audio deleted after processing

**No other external APIs.**

---

## Copyright Proof Security

### Proof Generation:

```typescript
// Input Hash
SHA-256(userId + trackId + timestamp + dspParams)

// Output Hash
SHA-256(colors + geometry + motion + particles)

// PRNG State
[seed1, seed2, state1, state2, state3, state4]

// Root Hash
SHA-256(inputHash + outputHash + prngState + logicalTick)
```

**Security properties:**
- **Collision-resistant:** SHA-256 has 2^256 possible outputs
- **Deterministic:** Same inputs = same hash
- **Verifiable:** Anyone can verify by regenerating
- **Unforgeable:** Cannot create same hash without exact inputs

### Proof Verification:

```typescript
// Regenerate proof from same inputs
const regenerated = generateProof(context, logicalTick);

// Compare hashes
if (regenerated.rootHash === original.rootHash) {
  // VALID: Proof is authentic
} else {
  // INVALID: Proof is forged or inputs changed
}
```

---

## Attack Vectors & Mitigations

### 1. Password Brute Force

**Attack:** Try millions of passwords to guess yours

**Mitigation:**
- SHA-256 is computationally expensive
- Salt prevents pre-computed attacks
- No rate limiting needed (local-only)

**Recommendation:** Use strong passwords (8+ characters, mixed case, numbers, symbols)

### 2. Session Hijacking

**Attack:** Steal your session to impersonate you

**Mitigation:**
- No session tokens (local-only)
- No cookies
- No server-side sessions

**Recommendation:** Log out on shared devices

### 3. Visual Theft

**Attack:** Copy your visual and claim it's theirs

**Mitigation:**
- Deterministic proof (cannot be forged)
- Root hash verification
- Chain of custody

**Recommendation:** Save your proofs, export backups

### 4. Recovery Key Theft

**Attack:** Steal your recovery key to access your account

**Mitigation:**
- Recovery key requires email (2-factor)
- Recovery key is deterministic (can be regenerated)

**Recommendation:** Store recovery key securely (password manager, safe)

### 5. IndexedDB Corruption

**Attack:** Corrupt your IndexedDB to cause data loss

**Mitigation:**
- Regular backups (export identity)
- Crash recovery system
- Orphaned track cleanup

**Recommendation:** Export your identity regularly

---

## Privacy Protections

### No Tracking:
- ❌ No Google Analytics
- ❌ No Facebook Pixel
- ❌ No cookies
- ❌ No fingerprinting

### No Data Collection:
- ❌ No usage statistics
- ❌ No error reporting (unless you report bugs)
- ❌ No telemetry

### Minimal External Requests:
- ✅ OpenAI Whisper (transcription only)
- ✅ HTTPS for security
- ❌ No CDNs (all assets self-hosted)

---

## Compliance

### GDPR (EU):
- ✅ Right to access (DevTools → IndexedDB)
- ✅ Right to erasure (delete account)
- ✅ Right to portability (export identity)
- ✅ Data minimization (only collect what's needed)
- ✅ Consent (explicit for transcription)

### CCPA (California):
- ✅ Right to know (this document)
- ✅ Right to delete (delete account)
- ✅ Right to opt-out (we don't sell data)
- ✅ Non-discrimination (no penalties for opting out)

---

## Incident Response

### If You Suspect a Security Issue:

1. **Email:** security@axiometric.tech
2. **Include:**
   - Description of the issue
   - Steps to reproduce
   - Potential impact
3. **We will:**
   - Acknowledge within 24 hours
   - Investigate immediately
   - Patch within 7 days (if valid)
   - Credit you (if desired)

### Responsible Disclosure:

We follow responsible disclosure practices:
- 90-day disclosure window
- Credit to researchers
- Bug bounty program (coming soon)

---

## Security Roadmap

### Current:
- ✅ SHA-256 password hashing
- ✅ Deterministic ID generation
- ✅ Recovery key system
- ✅ Local-only storage

### Planned:
- [ ] End-to-end encryption for cloud sync
- [ ] Two-factor authentication (2FA)
- [ ] Hardware security key support (WebAuthn)
- [ ] Encrypted backups
- [ ] Security audit (third-party)

---

## Best Practices for Users

### 1. Use a Strong Password
- At least 8 characters
- Mix uppercase, lowercase, numbers, symbols
- Don't reuse passwords from other sites

### 2. Save Your Recovery Key
- Write it down
- Store in password manager
- Keep multiple copies in safe places

### 3. Log Out on Shared Devices
- Always log out when using public computers
- Don't save passwords in shared browsers

### 4. Export Regular Backups
- Export your identity weekly
- Store backups securely
- Test restoration process

### 5. Keep Browser Updated
- Update to latest version
- Enable automatic updates
- Use Chrome or Edge for best security

---

## Security Audits

### Internal Audits:
- Code review before every release
- Dependency vulnerability scanning
- Manual penetration testing

### External Audits:
- Third-party security audit (planned)
- Bug bounty program (planned)
- Community security reviews (open source)

---

## Reporting Vulnerabilities

**Found a security issue?**

**DO:**
- ✅ Email security@axiometric.tech
- ✅ Provide detailed reproduction steps
- ✅ Wait for our response before public disclosure

**DON'T:**
- ❌ Post publicly on GitLab
- ❌ Exploit the vulnerability
- ❌ Demand payment (we have a bug bounty program)

---

**Security is our top priority. Your music, your data, your identity - protected by mathematics.**
