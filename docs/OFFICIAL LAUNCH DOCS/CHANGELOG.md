# Changelog

All notable changes to VEKTR STUDIO will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Sovereign authentication system (email/password with recovery keys)
- Identity-forged 3D visualizer (Metabolic mode)
- Kinetic lyric syncopation (5 animation modes)
- Deterministic proof system (SHA-256 copyright proofs)
- Enhanced proof system (NFOD + REV integration)
- UnifiedVisualizer (3D + lyrics combined)
- Auto-transcription (OpenAI Whisper API)
- BPM/key/energy detection
- 29-parameter DSP rack (OmniRack)
- Mobile Studio (vocal recording with effects)
- Sampler Studio (loop/stem detection)
- Lyric Book (SRT export with onset sync)
- Content Kit (quote cards, promotional content)
- Link Vault (artist bio page builder)
- Crash recovery system (session restoration)
- Hardware safety checks (headphone detection)
- Sample rate monitoring (device change detection)

### Changed
- Replaced old onboarding with SovereignOnboarding
- Migrated from localStorage to IndexedDB for audio storage
- Unified visualizer modes (Metabolic, Matrix, Cosmic, Glitch, Quantum)
- Improved audio analysis pipeline (onset detection)

### Fixed
- Processing death loop (tracks stuck in "processing" state)
- Blob URL expiration (re-hydrate from IndexedDB)
- Sample rate mismatch (hardware device changes)
- Analysis data erasure on refresh

### Removed
- Old Onboarding.tsx (replaced by SovereignOnboarding)
- engine-core/ folder (duplicates)
- Random ID generation (replaced with deterministic)

---

## [0.1.0] - 2026-04-02

### Added
- Initial release
- Basic audio upload and playback
- Simple visualizer canvas
- Profile management
- Theme system

---

## Future Releases

### [0.2.0] - Planned
- Cloud sync (optional Firebase/Supabase integration)
- Multi-device session management
- Export identity backup/restore
- Email verification
- Password reset via recovery key

### [0.3.0] - Planned
- Collaboration features (multi-user editing)
- Plugin system (custom visualizers)
- API for external integrations
- Batch processing (multiple tracks)
- Advanced export formats (ProRes, DNxHD)

### [1.0.0] - Planned
- Full production release
- Mobile app (Capacitor build)
- Desktop app (Electron build)
- Cloud rendering (server-side exports)
- Premium features (advanced DSP, AI mastering)

---

## Version History

- **0.1.0** - Initial prototype (basic features)
- **Unreleased** - Current development (sovereign auth + 3D engine)
