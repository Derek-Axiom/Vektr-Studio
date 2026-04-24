# VEKTR STUDIO - Architecture Overview

**System architecture for the sovereign music production workspace.**

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VEKTR STUDIO (Browser)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Identity   │  │    Media     │  │   Content    │    │
│  │    Layer     │  │   Vault      │  │  Generation  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                 │                  │             │
│         ▼                 ▼                  ▼             │
│  ┌──────────────────────────────────────────────────┐    │
│  │         Sovereign Auth System                    │    │
│  │  - Email/password authentication                 │    │
│  │  - Deterministic ID generation                   │    │
│  │  - Recovery key system                           │    │
│  └──────────────────────────────────────────────────┘    │
│         │                                                  │
│         ▼                                                  │
│  ┌──────────────────────────────────────────────────┐    │
│  │         Proof-of-Determinism Layer               │    │
│  │  - SHA-256 hashing                               │    │
│  │  - PRNG state snapshots                          │    │
│  │  - Input/output verification                     │    │
│  └──────────────────────────────────────────────────┘    │
│         │                                                  │
│         ▼                                                  │
│  ┌──────────────────────────────────────────────────┐    │
│  │         Processing Engines                       │    │
│  │  - Audio Analysis (BPM, key, energy)             │    │
│  │  - DSP Pipeline (29-param OmniRack)              │    │
│  │  - Visual Generation (3D + 2D)                   │    │
│  │  - Lyric Syncopation (rhythm-locked)             │    │
│  └──────────────────────────────────────────────────┘    │
│         │                                                  │
│         ▼                                                  │
│  ┌──────────────────────────────────────────────────┐    │
│  │         Storage Layer (IndexedDB)                │    │
│  │  - Audio files (Blob storage)                    │    │
│  │  - Analysis data (JSON)                          │    │
│  │  - Identity data (encrypted)                     │    │
│  │  - Proofs (SHA-256 hashes)                       │    │
│  └──────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌──────────────────┐              ┌──────────────────┐
│  OpenAI Whisper  │              │   Web Audio API  │
│  (Transcription) │              │   (Playback)     │
└──────────────────┘              └──────────────────┘
```

---

## Core Systems

### 1. Identity Layer

**Purpose:** Sovereign user authentication and identity management

**Components:**
- `SovereignAuth.ts` - Email/password authentication
- `SovereignOnboarding.tsx` - Onboarding UI
- `AuthGuard.tsx` - Route protection

**Key Features:**
- Deterministic ID generation (SHA-256)
- Password hashing (SHA-256 + salt)
- Recovery key system
- IndexedDB persistence

**Data Flow:**
```
Email + Password → SHA-256 → Identity ID
Email + Password Hash → SHA-256 → Recovery Key
```

---

### 2. Media Vault

**Purpose:** Local-first audio file storage and management

**Components:**
- `ProfileContext.tsx` - State management
- `storage.ts` - IndexedDB interface
- `IngestEngine.ts` - Audio analysis

**Key Features:**
- IndexedDB blob storage (unlimited size)
- Auto-categorization (Loop, Stem, Track)
- BPM/key/energy detection
- Onset detection (beat markers)

**Data Flow:**
```
Audio File → IndexedDB (blob)
Audio File → Analysis Engine → BPM/Key/Energy
Audio File → Whisper API → Transcription
```

---

### 3. Proof-of-Determinism Layer

**Purpose:** Copyright protection via mathematical proofs

**Components:**
- `ProofOfDeterminism.ts` - Proof generation/verification
- `DeterministicPRNG.ts` - xoshiro256** PRNG
- `EnhancedProofSystem.ts` - NFOD + REV integration

**Key Features:**
- SHA-256 session hashing
- PRNG state snapshots
- Input/output verification
- Chain of custody

**Data Flow:**
```
User ID + Track ID + Timestamp → SHA-256 → Seeds
Seeds → PRNG → Visual Parameters
Visual Parameters → SHA-256 → Output Hash
Input Hash + Output Hash + PRNG State → Root Hash (Proof)
```

---

### 4. Visual Generation

**Purpose:** Deterministic 3D visualizer and lyric animation

**Components:**
- `UnifiedVisualizer.ts` - Main visualizer engine
- `MetabolicVisualizer.ts` - 3D geometry engine
- `KineticLyricSyncopator.ts` - Lyric animation engine
- `VektrAudioCanvas.ts` - Audio-reactive canvas

**Key Features:**
- THREE.js 3D rendering
- Custom GLSL shaders
- Audio-reactive geometry
- 5 lyric animation modes
- Post-processing (bloom, film grain)

**Data Flow:**
```
Identity + Track DNA → PRNG → Visual Parameters
Visual Parameters → THREE.js → 3D Scene
Audio Data → FFT → Bass/Mid/Treble
Bass/Mid/Treble → Shader Uniforms → Animated Geometry
```

---

### 5. DSP Pipeline

**Purpose:** Professional audio processing and effects

**Components:**
- `useOmniRack.ts` - 29-parameter DSP rack
- `audioContextSingleton.ts` - Shared audio context
- `useAudioSafety.ts` - Hardware safety checks

**Key Features:**
- Reverb, Delay, Chorus
- EQ, Compression, Limiting
- Pitch correction
- Sample rate monitoring
- Headphone safety

**Data Flow:**
```
Audio Input → Web Audio API → DSP Chain → Output
DSP Chain: EQ → Compressor → Reverb → Delay → Limiter
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER UPLOADS TRACK                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   STORAGE (IndexedDB)                       │
│  - Save audio blob                                          │
│  - Generate media ID: media-1743589408000                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   ANALYSIS PIPELINE                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ BPM/Key     │  │ Transcribe  │  │ Categorize  │        │
│  │ Detection   │  │ (Whisper)   │  │ (Loop/Stem) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   PROOF GENERATION                          │
│  - User ID + Track ID + Timestamp → Seeds                   │
│  - Seeds → PRNG → Visual Parameters                         │
│  - Parameters → SHA-256 → Proof                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   VISUAL GENERATION                         │
│  - PRNG → Colors, Geometry, Motion                          │
│  - THREE.js → 3D Scene                                      │
│  - Audio → FFT → Reactivity                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   RENDER & EXPORT                           │
│  - Canvas → Video frames                                    │
│  - MediaRecorder → MP4 export                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend:
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Motion** - Animations

### 3D Graphics:
- **THREE.js** - 3D rendering
- **WebGL** - GPU acceleration
- **GLSL** - Custom shaders

### Audio:
- **Web Audio API** - Audio processing
- **MediaRecorder API** - Recording
- **FFT Analysis** - Frequency detection

### Storage:
- **IndexedDB** - Local database
- **localStorage** - Settings cache
- **Blob Storage** - Audio files

### APIs:
- **OpenAI Whisper** - Transcription
- **Essentia.js** - Audio analysis (optional)

---

## Security Model

### Authentication:
```
Password → SHA-256(password + salt) → Password Hash
Email + Timestamp → SHA-256 → Identity ID
Email + Password Hash → SHA-256 → Recovery Key
```

### Proof Generation:
```
User ID + Track ID + Timestamp → SHA-256 → Input Hash
Visual Parameters → SHA-256 → Output Hash
Input Hash + Output Hash + PRNG State → SHA-256 → Root Hash
```

### Verification:
```
Regenerate visual with same inputs
Compare Root Hash
Match = Valid Proof
Mismatch = Invalid Proof
```

---

## Performance Optimizations

### 3D Rendering:
- Adaptive quality (reduces detail if FPS < 30)
- Geometry LOD (level of detail)
- Particle count scaling
- Post-processing toggle

### Audio Processing:
- Shared AudioContext (singleton pattern)
- Worker thread offloading (future)
- FFT caching
- Sample rate monitoring

### Storage:
- Blob URLs for in-memory access
- IndexedDB for persistence
- localStorage for settings
- Lazy loading

---

## Deployment Architecture

### Current (Client-Side Only):
```
Browser → VEKTR STUDIO (Static Site)
         ↓
    IndexedDB (Local Storage)
         ↓
    OpenAI API (Transcription)
```

### Future (Optional Cloud Sync):
```
Browser → VEKTR STUDIO
         ↓
    IndexedDB (Local)
         ↓
    Cloud Backup (Firebase/Supabase)
         ↓
    Cross-Device Sync
```

---

## Scalability

### Current Limits:
- **Tracks:** Unlimited (limited by browser storage)
- **File Size:** 100MB per track
- **Storage:** ~5GB (browser-dependent)
- **Concurrent Users:** N/A (client-side only)

### Future Scaling:
- Cloud storage for large files
- CDN for static assets
- Server-side rendering for exports
- Multi-user collaboration

---

## Development Workflow

```
Local Development
      ↓
   Git Commit
      ↓
  GitLab CI/CD
      ↓
   Build (Vite)
      ↓
Deploy (Static Host)
      ↓
   Production
```

---

## Dependencies

### Core:
- react: ^19.0.0
- three: (to be added)
- motion: ^12.4.7

### Dev:
- vite: ^6.0.7
- typescript: ~5.9.3
- tailwindcss: ^4.0.0

### APIs:
- OpenAI Whisper (transcription)

**Total bundle size:** ~500KB (gzipped)

---

## Future Architecture

### Planned Additions:
- TheREV Server (10KD analysis)
- The Forge (code protection)
- Cloud sync (optional)
- Collaboration features
- Plugin system

---

**For technical deep-dives, see:**
- [Security Model](./SECURITY.md)
- [Determinism Explained](./DETERMINISM_EXPLAINED.md)
- [DSP Pipeline](./DSP_PIPELINE.md)
