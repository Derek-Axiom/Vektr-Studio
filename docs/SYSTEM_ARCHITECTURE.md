# VEKTR VAULT - System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         VEKTR VAULT (Browser)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    SOVEREIGN IDENTITY LAYER                      │  │
│  │  - User authentication (email/password)                          │  │
│  │  - Recovery keys                                                 │  │
│  │  - Profile management                                            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      MEDIA VAULT LAYER                           │  │
│  │  - IndexedDB blob storage (audio files)                          │  │
│  │  - Metadata persistence (localStorage)                           │  │
│  │  - Analysis data (IndexedDB)                                     │  │
│  │  - Lyric books                                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    INGEST PIPELINE LAYER                         │  │
│  │                                                                  │  │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐   │  │
│  │  │  Audio Decode   │  │  Audio Analysis  │  │ Transcription│   │  │
│  │  │  (OfflineAudio) │  │  (BPM/Key/etc)   │  │  (Whisper)   │   │  │
│  │  └────────┬────────┘  └────────┬─────────┘  └──────┬───────┘   │  │
│  │           │                    │                   │            │  │
│  │           └────────────────────┼───────────────────┘            │  │
│  │                                │                                │  │
│  │                    ┌───────────▼──────────┐                    │  │
│  │                    │  Onset Detection     │                    │  │
│  │                    │  (Transient Timing)  │                    │  │
│  │                    └───────────┬──────────┘                    │  │
│  │                                │                                │  │
│  │                    ┌───────────▼──────────┐                    │  │
│  │                    │  Sampler Intelligence│                    │  │
│  │                    │  (Loop/Stem Classify)│                    │  │
│  │                    └──────────────────────┘                    │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   PROOF-OF-DETERMINISM LAYER                     │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │  ART_CanvasHasher (NFOD Root Hash)                       │   │  │
│  │  │  - User ID + Track ID + Timestamp + DSP Settings         │   │  │
│  │  │  - SHA-256 cryptographic hash                            │   │  │
│  │  │  - Bitwise sync hash (for visual seeding)                │   │  │
│  │  │  - Parent hash (chain of custody)                        │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │  DeterministicPRNG (xoshiro256**)                         │   │  │
│  │  │  - Seeded from NFOD hash                                 │   │  │
│  │  │  - Generates visual parameters                           │   │  │
│  │  │  - Same seed = same output forever                       │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   VISUAL GENERATION LAYER                        │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │  MetabolicVisualizer (3D Identity-Forged)                │   │  │
│  │  │  - Deterministic geometry from identity                  │   │  │
│  │  │  - Audio-reactive (bass/mid/treble)                      │   │  │
│  │  │  - Signature watermark (visual DNA)                      │   │  │
│  │  │  - Post-processing (bloom, film grain)                   │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │  KineticLyricSyncopator (Animated Lyrics)                │   │  │
│  │  │  - 6 animation modes (Explode, Spiral, Quantum, etc)     │   │  │
│  │  │  - Rhythm-locked to BPM                                  │   │  │
│  │  │  - Time-synced to onsets                                 │   │  │
│  │  │  - Video export with audio                               │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │  QuoteCardGenerator (Social Media Graphics)              │   │  │
│  │  │  - 1080x1080px PNG generation                            │   │  │
│  │  │  - 4 style presets                                       │   │  │
│  │  │  - Artist branding overlay                               │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    AUDIO PROCESSING LAYER                        │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │  OmniRack (29-Parameter DSP Chain)                        │   │  │
│  │  │  - Transport (tempo, vinyl pitch)                         │   │  │
│  │  │  - Dynamics (gate, compression, limiter, saturation)      │   │  │
│  │  │  - Filters (LP, HP, BP, notch)                            │   │  │
│  │  │  - 12-Band Graphic EQ                                     │   │  │
│  │  │  - Space (reverb, echo)                                   │   │  │
│  │  │  - Modulation (chorus, flanger)                           │   │  │
│  │  │  - 8D Spatial (binaural panning)                          │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │  Audio Context Singleton                                 │   │  │
│  │  │  - Shared AudioContext (one per session)                 │   │  │
│  │  │  - Sample rate locking (44.1kHz)                         │   │  │
│  │  │  - Hardware safety checks                                │   │  │
│  │  │  - Headphone detection                                   │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    INTERFACE LAYER                               │  │
│  │                                                                  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │  Dashboard   │  │  LyricBook   │  │  Visualizer  │           │  │
│  │  │  (Overview)  │  │  (Sync/Edit) │  │  (3D/Kinetic)│           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  │                                                                  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │ MobileStudio │  │  VektrLab    │  │  SamplerStud │           │  │
│  │  │ (Recording)  │  │  (Effects)   │  │  (Loops)     │           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  │                                                                  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │ ContentKit   │  │  LinkVault   │  │  TunerStudio │           │  │
│  │  │ (Graphics)   │  │  (Bio/Links) │  │  (Pitch)     │           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌──────────────────────┐          ┌──────────────────────┐
│  OpenAI Whisper API  │          │   Web Audio API      │
│  (Transcription)     │          │   (Playback/DSP)     │
└──────────────────────┘          └──────────────────────┘
```

## Data Flow Diagrams

### Upload Flow

```
User Uploads Audio File
         │
         ▼
┌─────────────────────────────────────────┐
│  1. Save to IndexedDB (blob storage)    │
│  2. Create MediaItem in vault           │
│  3. Display in Library (instant)        │
└─────────────────────────────────────────┘
         │
         ▼ (Fire-and-forget background)
┌─────────────────────────────────────────┐
│  Ingest Pipeline (Parallel)             │
│  ├─ Decode audio (OfflineAudioContext)  │
│  ├─ Analyze (BPM, key, energy)          │
│  ├─ Detect onsets (transients)          │
│  ├─ Transcribe (Whisper API)            │
│  └─ Classify sample (loop/stem/track)   │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Save Analysis Data to IndexedDB        │
│  ├─ Onsets array                        │
│  ├─ Frequency histogram                 │
│  ├─ Energy profile                      │
│  └─ Transcription text                  │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Update MediaItem in Vault              │
│  ├─ Status: processing → ready          │
│  ├─ BPM, key, duration                  │
│  ├─ Auto-tags                           │
│  └─ Analysis data reference             │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Save Transcription to LyricBook        │
│  ├─ Auto-create lyric book              │
│  ├─ Populate with transcribed text      │
│  └─ Ready for sync calibration          │
└─────────────────────────────────────────┘
```

### Visualization Flow

```
User Selects Track + Lyrics + DSP Settings
         │
         ▼
┌─────────────────────────────────────────┐
│  Build SovereignCreationContext         │
│  ├─ User ID + username                  │
│  ├─ Track ID + metadata                 │
│  ├─ Lyrics + sync lines                 │
│  ├─ All 29 DSP parameters               │
│  └─ Session timestamp                   │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  ART_CanvasHasher                       │
│  ├─ Bitwise hash (sync visual seed)     │
│  ├─ SHA-256 hash (NFOD root)            │
│  └─ Proof-of-determinism                │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  DeterministicPRNG (seeded from hash)   │
│  ├─ Generate geometry parameters        │
│  ├─ Generate color palette              │
│  ├─ Generate motion parameters          │
│  └─ Generate signature pattern          │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  MetabolicVisualizer                    │
│  ├─ Create 3D geometry (THREE.js)       │
│  ├─ Apply colors from PRNG              │
│  ├─ Set up audio reactivity             │
│  ├─ Add signature watermark             │
│  └─ Render to canvas                    │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Real-Time Audio Reactivity             │
│  ├─ Analyze audio (FFT)                 │
│  ├─ Extract bass/mid/treble             │
│  ├─ Update shader uniforms              │
│  └─ Animate geometry                    │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Optional: Kinetic Lyric Overlay        │
│  ├─ Render words at sync times          │
│  ├─ Apply animation mode                │
│  ├─ Sync to BPM                         │
│  └─ Composite with 3D                   │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Export Video                           │
│  ├─ Capture canvas stream (60fps)       │
│  ├─ Mix with audio track                │
│  ├─ Encode to VP9 (WebM)                │
│  ├─ Include proof hash in filename      │
│  └─ Download to user                    │
└─────────────────────────────────────────┘
```

### Lyric Sync Flow

```
Transcription Complete
         │
         ▼
┌─────────────────────────────────────────┐
│  LyricBook Auto-Sync                    │
│  ├─ Check for onset data                │
│  ├─ If onsets exist:                    │
│  │  └─ alignLyricsToOnsets()            │
│  └─ Else: even distribution             │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Generate SyncLines                     │
│  ├─ Each line has:                      │
│  │  ├─ Text                             │
│  │  ├─ Start time                       │
│  │  ├─ End time                         │
│  │  └─ ID                               │
│  └─ Stored in LyricBook                 │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Real-Time Sync Highlighting            │
│  ├─ On each frame:                      │
│  │  ├─ Read currentTime from audio      │
│  │  ├─ Find active syncLine             │
│  │  ├─ Highlight in editor              │
│  │  └─ Auto-scroll if needed            │
│  └─ User sees live sync                 │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Export Options                         │
│  ├─ SRT subtitle file                   │
│  ├─ Kinetic lyric video                 │
│  ├─ Quote cards (per line)              │
│  └─ Share to LinkVault                  │
└─────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── ProfileProvider (Global State)
│   ├── SovereignOnboarding (Auth)
│   └── Layout
│       ├── Dashboard
│       ├── ContentLibrary
│       │   └── ContentDetail
│       ├── LyricBook
│       │   ├── TranscriptionDisplay
│       │   ├── SyncCalibration
│       │   ├── QuoteCardGenerator
│       │   └── SRTExport
│       ├── VisualizerStudio
│       │   ├── MetabolicVisualizer
│       │   │   ├── MetabolicVisualizer.tsx (React wrapper)
│       │   │   └── MetabolicVisualizer.ts (Engine)
│       │   ├── KineticLyricSyncopator
│       │   ├── ProofDisplay
│       │   └── VideoExport
│       ├── ContentKit
│       │   ├── QuoteCardPreview
│       │   └── HTMLExport
│       ├── VektrLab
│       │   ├── OmniRack (29-param DSP)
│       │   ├── StyleEvolver
│       │   └── EffectPresets
│       ├── LinkVault
│       │   └── ShareableItems
│       ├── MobileStudio
│       │   ├── MetronomePopup
│       │   ├── VocalPresets
│       │   ├── PCMRecorder
│       │   └── LiveMonitor
│       ├── SamplerStudio
│       │   ├── SampleClassification
│       │   ├── LoopDetection
│       │   └── StemClassification
│       └── TunerStudio
│           └── PitchDetection
```

## State Management

```
ProfileContext (Global)
├── Profile
│   ├── ownerId
│   ├── displayName
│   ├── bio
│   ├── avatarUrl
│   └── theme
├── Vault (MediaItem[])
│   ├── id
│   ├── title
│   ├── type (audio/video/image)
│   ├── category
│   ├── duration
│   ├── fileUrl (blob)
│   ├── thumbnailUrl
│   ├── bpm
│   ├── key
│   ├── tags
│   ├── analysisData (IndexedDB)
│   │   ├── onsets
│   │   ├── histogram
│   │   ├── energy
│   │   └── suggestions
│   └── status (processing/ready)
├── LyricBooks (LyricBook[])
│   ├── id
│   ├── trackId
│   ├── title
│   ├── content
│   ├── syncLines (LyricLine[])
│   │   ├── id
│   │   ├── text
│   │   ├── startTime
│   │   └── endTime
│   └── updatedAt
├── RackParams (OmniRackParams)
│   ├── tempo
│   ├── compression
│   ├── saturation
│   ├── reverbMix
│   ├── echoTime
│   └── ... (29 total)
├── ShareableItems (ShareableItem[])
│   ├── id
│   ├── type
│   ├── content
│   ├── sortOrder
│   └── createdAt
└── Audio State
    ├── isPlaying
    ├── globalAudioRef
    ├── globalCtxRef
    ├── globalAnalyserRef
    └── recorderTapRef
```

## Storage Architecture

```
Browser Storage
├── localStorage (5MB limit)
│   ├── _vault (compact MediaItem[])
│   ├── _lyrics (LyricBook[])
│   ├── _dsp (OmniRackParams)
│   ├── _items (ShareableItem[])
│   └── profile (PublicProfile)
└── IndexedDB (Unlimited)
    ├── audio_files (Blob storage)
    │   ├── id → File blob
    │   └── ... (one per track)
    ├── analysis_data (Analysis results)
    │   ├── id → IngestionResult
    │   │   ├── bpm
    │   │   ├── key
    │   │   ├── onsets[]
    │   │   ├── histogram
    │   │   └── energy
    │   └── ... (one per track)
    └── sessions (Crash recovery)
        ├── sessionId → Session data
        └── ... (one per session)
```

## Security Model

```
Authentication
├── Email + Password
├── SHA-256 hashing (client-side)
├── Recovery key (32-char)
└── Session persistence

Data Protection
├── Local-first (IndexedDB)
├── No external API calls (except Whisper)
├── No tracking
├── No analytics
└── User owns all data

Proof-of-Determinism
├── NFOD root hash (SHA-256)
├── Input hash (all parameters)
├── Output hash (visual parameters)
├── PRNG state snapshot
└── Reproducibility verification
```

## Performance Characteristics

```
Upload Processing
├── Decode: ~1-5 seconds (OfflineAudioContext)
├── Analysis: ~2-10 seconds (BPM/key detection)
├── Transcription: ~10-30 seconds (Whisper API)
├── Onset detection: ~1-3 seconds
└── Total: ~15-50 seconds (background)

Visualization
├── Metabolic render: 60fps (GPU)
├── Audio analysis: 60fps (FFT)
├── Shader updates: 60fps
└── Memory: ~50-100MB (3D scene)

Export
├── Video encoding: ~2-5 minutes (VP9)
├── File size: ~50-200MB (4K, 60fps)
└── Audio mixing: Real-time

Storage
├── Audio file: ~5-50MB per track
├── Analysis data: ~10-50KB per track
├── Metadata: ~1KB per track
└── Total: ~5-50MB per track
```

---

This architecture is designed to be:
- **Deterministic** - Same inputs always produce same outputs
- **Reproducible** - Can verify proofs mathematically
- **Offline-first** - Works without internet (except transcription)
- **Privacy-focused** - All data stays local
- **Performance-optimized** - GPU rendering, worker threads
- **Scalable** - Handles unlimited tracks (storage-limited)
