# Frequently Asked Questions

---

## General

### What is VEKTR STUDIO?

VEKTR STUDIO is a music production workspace that helps you create professional content with built-in copyright protection. Upload tracks, generate visualizers, create lyric videos, and prove ownership - all in one place.

### Is VEKTR STUDIO free?

Yes! VEKTR STUDIO is completely free to use. All features are available at no cost.

### Do I need to install anything?

No. VEKTR STUDIO runs entirely in your browser. Just visit the website and start creating.

### What browsers are supported?

VEKTR STUDIO works best on:
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

**Note:** Some features (like Mobile Studio recording) require Chrome or Edge.

---

## Identity & Authentication

### What is a "Sovereign Identity"?

Your sovereign identity is your permanent digital identity in VEKTR STUDIO. It's tied to your email and includes:
- A unique Identity ID (e.g., `VEKTR-A7F3C2E9D4B1`)
- Your artist name
- Your bio
- All your creations

### What is a Recovery Key?

A recovery key is a 32-character code that lets you recover your account if you lose access to your email or password. **Save it somewhere safe!**

### Can I change my email or password?

Yes. Go to Settings → Account → Change Password. You'll need your current password to make changes.

### What if I lose my recovery key?

If you lose your recovery key AND your password, you won't be able to recover your account. **Always save your recovery key in a safe place.**

### Can I use VEKTR on multiple devices?

Yes! Log in with your email and password on any device. Your identity will sync, but your tracks are stored locally on each device.

### How do I transfer my tracks to another device?

Use the **Export Identity** feature (coming soon) to create a backup file. Import it on your new device to restore everything.

---

## Copyright Protection

### How does copyright protection work?

Every visual you create is generated using **deterministic mathematics**. This means:
- Same inputs = same outputs, always
- Your visual is derived from YOUR identity + track data + session timestamp
- No one else can reproduce your exact visual without your session data

### What is a "determinism proof"?

A determinism proof is a cryptographic record that proves you created a specific visual at a specific time. It includes:
- SHA-256 hash of your session
- Input/output hashes
- PRNG state snapshot
- Timestamp

**This proof can be used in court to prove ownership.**

### Can someone steal my visual?

They can copy the video file, but they can't reproduce the **mathematical signature**. If they claim they created it, you can prove they didn't by regenerating it from your session data.

### Is this better than watermarks?

Yes. Watermarks can be removed. Mathematical signatures cannot. The visual IS the proof.

### Is this better than blockchain?

Yes, for this use case:
- **Blockchain:** Requires network, costs money, slow
- **VEKTR:** Works offline, free, instant

---

## Features

### What audio formats are supported?

- MP3
- WAV
- M4A
- OGG
- FLAC
- AAC

### How accurate is the auto-transcription?

Very accurate for clear vocals. The transcription uses OpenAI's Whisper model, which is state-of-the-art. You can always edit the transcription manually.

### Can I upload instrumentals?

Yes! VEKTR will still analyze BPM, key, and energy. You just won't get lyrics transcribed.

### How long does processing take?

- **BPM/Key Analysis:** 5-10 seconds
- **Transcription:** 10-30 seconds (depending on track length)
- **Total:** Usually under 1 minute

### Can I use my own lyrics?

Yes! You can manually enter or edit lyrics in Lyric Book.

### What visualizer modes are available?

- **Matrix:** Wireframe geometry (digital aesthetic)
- **Cosmic:** Smooth organic shapes (space vibes)
- **Glitch:** Sharp angular forms (cyberpunk)
- **Metabolic:** Identity-forged 3D (unique to you)

### What lyric animation modes are available?

- **Explode:** Words materialize from center explosion
- **Spiral:** Words spiral in from infinity
- **Quantum:** Superposition collapse on beat
- **Fractal:** Recursive subdivision (4 levels deep)
- **Wave:** Sine wave flow

### Can I customize the visuals?

Yes! You can adjust:
- Color palettes
- Geometry complexity
- Animation speed
- Audio reactivity levels

---

## Technical

### Where is my data stored?

All your data is stored **locally in your browser** using IndexedDB. Nothing is stored on our servers except:
- Temporary transcription requests (deleted after processing)
- Temporary analysis requests (deleted after processing)

### What happens if I clear my browser data?

If you clear your browser data, you'll lose:
- Your uploaded tracks
- Your generated visuals
- Your local settings

**But you can log back in with your email/password to restore your identity.**

### Can I export my data?

Yes! Use the **Export Identity** feature to create a backup file. This includes:
- Your identity
- Your tracks
- Your lyrics
- Your settings

### Is my password secure?

Yes. Your password is hashed using SHA-256 with a random salt. We never see your actual password.

### Do you use AI?

We use AI for:
- **Transcription:** OpenAI Whisper API
- **Analysis:** BPM/key detection

We **DO NOT** use AI for:
- Visual generation (pure mathematics)
- Copyright proofs (deterministic algorithms)
- Identity management (cryptographic hashing)

---

## Performance

### Why is my visualizer laggy?

VEKTR automatically adjusts quality based on your device's performance. If you're experiencing lag:
- Close other browser tabs
- Reduce visualizer complexity
- Switch to a simpler mode (Matrix or Cosmic)

### Can I use VEKTR on mobile?

Yes! VEKTR works on mobile browsers, but some features (like 3D visualizers) work best on desktop.

### What are the system requirements?

**Minimum:**
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- 4GB RAM
- Integrated graphics

**Recommended:**
- Chrome or Edge (latest)
- 8GB RAM
- Dedicated GPU

---

## Troubleshooting

### My track won't upload

- Check file format (MP3, WAV, M4A, etc.)
- Check file size (max 100MB)
- Try a different browser
- Clear browser cache

### Transcription failed

- Check that your track has vocals
- Check your internet connection (transcription requires API call)
- Try again in a few minutes

### Visualizer won't load

- Check that WebGL is enabled in your browser
- Update your graphics drivers
- Try a different browser
- Reduce complexity setting

### I forgot my password

Use your **recovery key** to restore your account:
1. Go to onboarding
2. Click "Forgot Password?"
3. Enter your email + recovery key
4. Set a new password

---

## Contact

- **Email:** support@axiometric.tech
- **GitLab Issues:** [Report a bug](https://gitlab.com/AXIOM RECURSE TECH./00_vektr_studio/-/issues)
- **Feature Requests:** [Request a feature](https://gitlab.com/AXIOM RECURSE TECH./00_vektr_studio/-/issues)

---

**Still have questions? Check our [full documentation](./DOCUMENTATION_MANIFEST.md) or reach out to support.**
