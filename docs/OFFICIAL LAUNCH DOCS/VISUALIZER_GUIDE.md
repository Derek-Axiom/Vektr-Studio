# VEKTR STUDIO - Visualizer Guide

**How to use the identity-forged 3D visualizer.**

---

## Overview

VEKTR STUDIO includes 5 groundbreaking visualizer modes:

1. **Metabolic** - Identity-forged 3D (unique to you)
2. **Matrix** - Wireframe geometry (digital aesthetic)
3. **Cosmic** - Smooth organic shapes (space vibes)
4. **Glitch** - Sharp angular forms (cyberpunk)
5. **Quantum** - Lyric animations (rhythm-locked)

---

## Getting Started

### 1. Upload a Track

Navigate to **Library** and upload an audio file. VEKTR will automatically analyze:
- BPM (beats per minute)
- Key (musical key)
- Energy level
- Onset markers (beat detection)

### 2. Open Visualizer Studio

Click **Visualizer** in the sidebar.

### 3. Select Your Track

Choose a track from the dropdown.

### 4. Choose a Mode

Click one of the 5 visualizer modes:
- **Metabolic** (recommended - identity-forged)
- **Matrix** (wireframe)
- **Cosmic** (organic)
- **Glitch** (cyberpunk)
- **Quantum** (lyrics required)

### 5. Press Play

Hit the play button and watch your visual react to the music.

---

## Visualizer Modes Explained

### Metabolic (Identity-Forged)

**What it is:**
- 3D geometry derived from YOUR user ID
- Colors from deterministic PRNG
- Motion based on track DNA
- Particle systems with signature patterns
- Signature ring watermark

**How it works:**
1. Your email + session timestamp → SHA-256 hash
2. Hash → deterministic seeds
3. Seeds → PRNG (xoshiro256**)
4. PRNG → colors, geometry, motion, particles
5. Result: A visual that ONLY you can create

**Why it's unique:**
- Same identity + track = same visual (always)
- Different identity = different visual (impossible to replicate)
- The visual IS the copyright proof

**Best for:**
- Music videos
- Promotional content
- Copyright protection
- Unique branding

---

### Matrix (Wireframe)

**What it is:**
- Wireframe 3D geometry
- Digital/tech aesthetic
- Sharp edges and lines

**Audio reactivity:**
- Bass → geometry scale
- Mid → rotation speed
- Treble → jitter/shake

**Best for:**
- Electronic music
- Tech/gaming content
- Minimal aesthetic

---

### Cosmic (Organic)

**What it is:**
- Smooth organic shapes
- Space/nebula vibes
- Flowing motion

**Audio reactivity:**
- Bass → bloom intensity
- Mid → wave motion
- Treble → particle speed

**Best for:**
- Ambient music
- Chill/lofi content
- Dreamy aesthetic

---

### Glitch (Cyberpunk)

**What it is:**
- Sharp angular forms
- Rapid transitions
- Cyberpunk aesthetic

**Audio reactivity:**
- Bass → geometry distortion
- Mid → color shift
- Treble → glitch intensity

**Best for:**
- Hip-hop/trap
- Cyberpunk content
- High-energy tracks

---

### Quantum (Lyric Mode)

**What it is:**
- Kinetic lyric animations
- 5 animation modes:
  - **Explode** - Words materialize from center
  - **Spiral** - Words spiral in from infinity
  - **Quantum** - Superposition collapse on beat
  - **Fractal** - Recursive subdivision
  - **Wave** - Sine wave flow

**Requirements:**
- Track must have lyrics (auto-transcribed or manual)
- Lyrics must be synced (automatic if onsets detected)

**Audio reactivity:**
- Bass → word scale
- Mid → animation speed
- Treble → particle effects

**Best for:**
- Lyric videos
- Music videos with text
- Promotional singles

---

## Audio Reactivity

All visualizers react to audio in real-time:

**Bass (20-250 Hz):**
- Geometry scale
- Bloom intensity
- Particle size

**Mid (250-4000 Hz):**
- Rotation speed
- Wave motion
- Color shift

**Treble (4000-20000 Hz):**
- Jitter/shake
- Particle speed
- Glitch intensity

---

## Export Settings

### Aspect Ratios:
- **9:16** - Vertical (TikTok, Instagram Stories)
- **1:1** - Square (Instagram Feed)
- **16:9** - Landscape (YouTube, Desktop)

### Export Quality:
- **Format:** WebM (VP9 codec)
- **Bitrate:** 12 Mbps (4K quality)
- **Frame Rate:** 60 FPS
- **Audio:** Original quality (no re-encoding)

### Export Process:
1. Click "Export Sequence"
2. Recording starts automatically
3. Let it play through entire track
4. Recording stops automatically
5. File downloads as `VEKTR_TrackName_ProofHash.webm`

**Note:** The proof hash in the filename is your copyright proof. Save it!

---

## Copyright Proof

Every Metabolic visualizer includes a copyright proof:

**What's included:**
- SHA-256 hash of your session
- PRNG state snapshot
- Input/output verification
- Timestamp

**Where to find it:**
- Bottom-left corner of visualizer (small text)
- Export filename (8-character hash)
- Console log (full proof object)

**How to verify:**
1. Regenerate visual with same inputs
2. Compare hash values
3. If they match → proof is valid

**Legal use:**
- Save the proof hash
- Save the export filename
- Screenshot the proof display
- Use in court if needed

---

## Tips & Tricks

### Get Better Visuals:
1. **Use high-quality audio** - Better analysis = better visuals
2. **Let analysis complete** - Wait for "Ready" status before visualizing
3. **Adjust DSP settings** - Different effects = different visuals (Metabolic mode)
4. **Try different modes** - Each mode has unique strengths

### Performance:
1. **Close other tabs** - Free up GPU resources
2. **Use Chrome/Edge** - Best WebGL performance
3. **Reduce complexity** - If laggy, switch to simpler mode
4. **Lower resolution** - If exporting is slow

### Creative Uses:
1. **Layer multiple exports** - Combine different modes in video editor
2. **Add your logo** - Use the watermark upload feature
3. **Sync to lyrics** - Use Quantum mode for lyric videos
4. **Create loops** - Export short sections for social media

---

## Troubleshooting

### Visualizer won't load:
- Check WebGL support: [get.webgl.org](https://get.webgl.org)
- Update graphics drivers
- Try different browser

### Black screen:
- Refresh page
- Try different mode
- Check browser console for errors

### Laggy performance:
- Close other tabs
- Reduce complexity
- Switch to Matrix or Cosmic mode

### Export failed:
- Check storage space
- Try lower quality
- Close other applications

---

## Advanced: Metabolic Mode Deep Dive

### How Identity Forging Works:

**Step 1: Generate Seeds**
```
Your Email + Session Timestamp → SHA-256 → Seeds
```

**Step 2: Initialize PRNG**
```
Seeds → xoshiro256** PRNG → Deterministic Random Sequence
```

**Step 3: Generate Visual Parameters**
```
PRNG → Color Palette (5 colors)
PRNG → Geometry Type (icosahedron, octahedron, etc.)
PRNG → Vertex Count (8-64 vertices)
PRNG → Motion Parameters (rotation, orbit, pulse)
PRNG → Particle System (50-250 particles)
PRNG → Signature Pattern (16-value DNA)
```

**Step 4: Render in Real-Time**
```
Visual Parameters + Audio Data → THREE.js → 3D Scene
```

**Result:** A visual that is mathematically unique to you.

---

## Next Steps

- [Create Your First Lyric Video](./LYRIC_VIDEO_GUIDE.md)
- [Export Guide](./TROUBLESHOOTING.md#export-issues)
- [Copyright Protection Explained](./COPYRIGHT_PROTECTION.md)

---

**Questions? Check the [FAQ](./FAQ.md) or email support@axiometric.tech**
