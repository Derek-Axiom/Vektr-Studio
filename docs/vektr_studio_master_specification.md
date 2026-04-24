# VEKTR Studio: Master Product Specification

## 1. Vision Statement
VEKTR Studio is a sidebar-based, multi-page musician workspace built for the stage after music creation. It is a release-building ecosystem that expands a song into its complete visual and digital world-lyrics, visuals, transformed audio, and content assets-within a single connected system.

## 2. Core Architecture: The "Syncopated Studio"
* **Integrated Workflow**: While the app features separate pages with distinct jobs, they are fully integrated through a shared global state.
* **One-Time Ingestion**: Content is uploaded once and processed once; every downstream page is prepared automatically before the user arrives.
* **Shared Session State**: The system maintains a unified context (active track, lyrics, and session data) across all modules (Vault, Lyrics, Visualizer, Lab, and Links) to eliminate manual setup.

## 3. Page & Module Specifications

### 3.1 Dashboard (Orientation Layer)
* **Job**: The primary entry hub and workspace overview.
* **Features**: Displays real-time workspace stats, recent tracks, creative activity feeds, and quick actions to guide the user's next move.

### 3.2 Content Hub (Foundational Ingestion)
* **Job**: Persistent asset vault and automatic background processor.
* **Ingest Logic**: Immediately decodes audio, generates waveforms, performs FFT analysis, and detects onsets/timing upon upload.
* **Automatic Tagging**: System-driven analysis applies tags for BPM, key, energy, vocal presence, and technical metadata to power search and organization.

### 3.3 Lyric Book (Semantic Structure)
* **Job**: Full-sheet lyric management and synchronization preparation.
* **Features**: Supports sectioning (Intro, Verse, Chorus, etc.) and quote extraction for social content. Lyrics are ideally pre-transcribed during initial ingestion.

### 3.4 Visualizer Studio (Primary Render Surface)
* **Job**: The main output stage where audio and lyrics become reactive visuals.
* **Engine**: A high-fidelity, native Canvas-based system driven by real-time signal data and pre-analyzed timing anchors.
* **Outcome**: Produces synchronized lyric overlays and export-ready visual content.

### 3.5 Vektr Lab (User-Facing Transformation)
* **Job**: Creative audio processing and metadata finalization.
* **Tools**: Includes one-click effect recipes, mastering presets, a 12-band EQ, resonant filters, and a mobile-optimized recording feature.

### 3.6 Content Kit (Asset Generation)
* **Job**: Turns session data into shareable promo materials.
* **Templates**: Generates quote cards, lyric cards, and release cards based on reusable studio assets.

### 3.7 Link Vault (Public Presence)
* **Job**: The bridge between internal creation and external artist presence.
* **Features**: A bio-link builder that allows users to inject studio-created content and themes (Minimal, Glitch, Custom) into a public-facing landing page.

## 4. Supporting Toolsets
* **Mobile Studio**: Auxiliary mobile-first capture layer.
* **Sampler & Tuner Studios**: Specialized tools for mathematical pitch detection and rapid beat-loop triggering.
* **Content Library**: The persistent archive for reviewing and managing all generated studio assets.

## 5. Narrative & UX Principles
* **Musician-First Framing**: The user experience must remain intuitive and simple, avoiding complex technical or "ideological" terminology in the UI.
* **Flow Preservation**: Minimize manual, repetitive tasks through background automation and pre-prepared states.
* **Quality Confidence**: Ensure all default outputs are professional and publish-ready.

