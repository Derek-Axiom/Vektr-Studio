# Copyright Protection - How It Works

**VEKTR STUDIO is the only music studio where your visuals are mathematically impossible to replicate.**

---

## The Problem

You create a music visualizer or lyric video. Someone downloads it, re-uploads it, and claims it's theirs. How do you prove it's yours?

**Traditional solutions:**
- **Watermarks:** Can be cropped or removed
- **Blockchain:** Expensive, requires network, slow
- **Timestamps:** Can be faked
- **Metadata:** Can be stripped

**None of these are foolproof.**

---

## The VEKTR Solution

VEKTR uses **deterministic mathematics** to create visuals that are unique to your session. The visual itself IS the proof.

### How It Works (Simple Explanation)

1. **You upload a track**
   - VEKTR analyzes: BPM, key, energy

2. **VEKTR creates a "session fingerprint"**
   - Your user ID
   - Track metadata
   - Session timestamp
   - Your DSP settings

3. **VEKTR generates the visual deterministically**
   - Every color is derived from your fingerprint
   - Every vertex is calculated from your identity
   - Every motion is based on your track's DNA

4. **VEKTR creates a "proof"**
   - SHA-256 hash of your entire session
   - PRNG state snapshot
   - Input/output verification

**Result:** A visual that can ONLY be created by you, with your exact session data.

---

## How It Works (Technical Explanation)

### Step 1: Identity Hashing

```
Your Email + Session Timestamp
         ↓
    SHA-256 Hash
         ↓
Deterministic Seeds (seed1, seed2)
```

### Step 2: PRNG Initialization

```
Seeds → xoshiro256** PRNG
         ↓
Deterministic Random Sequence
(same seeds = same sequence, forever)
```

### Step 3: Visual Generation

```
PRNG → Color Palette (5 colors)
PRNG → Geometry Type (icosahedron, octahedron, etc.)
PRNG → Vertex Count (8-64 vertices)
PRNG → Motion Parameters (rotation, orbit, pulse)
PRNG → Particle System (50-250 particles)
PRNG → Signature Pattern (16-value DNA)
```

### Step 4: Proof Generation

```
Input Hash (user + track + timestamp)
         +
Output Hash (colors + geometry + motion)
         +
PRNG State Snapshot
         +
Logical Tick (deterministic time)
         ↓
    SHA-256 Hash
         ↓
    Root Hash (your proof)
```

---

## What This Proves

### In Court:

**You can prove:**
1. ✅ **You created it** (your user ID is in the hash)
2. ✅ **When you created it** (timestamp + logical tick)
3. ✅ **How you created it** (PRNG state + DSP params)
4. ✅ **It's reproducible** (regenerate with same inputs = same hash)

**They cannot prove:**
1. ❌ They created it (different user ID = different hash)
2. ❌ They created it first (your timestamp is earlier)
3. ❌ They used the same process (different PRNG state)

---

## Example Scenario

### The Theft:

1. You create a visualizer for your track "Artifact of Compression"
2. You post it on YouTube
3. Someone downloads it, re-uploads it, claims it's theirs
4. They get 1M views, monetize it
5. You file a DMCA takedown
6. They counter-claim: "I created this"

### The Proof:

**You provide:**
```
Identity ID: VEKTR-A7F3C2E9D4B1
Track ID: media-1743589408000
Session Timestamp: 1743589408000
Root Hash: 4d7e2a1f8c9b3e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1
```

**You regenerate the visual:**
- Same inputs → Same hash: `4d7e2a1f8c9b3e6d...`

**They try to regenerate:**
- Different user ID → Different hash: `9f3b1c2e8d7a6f5e...`

**Result:** You win. Math doesn't lie.

---

## Verification Process

### How to Verify Your Proof:

1. Go to **Settings → Copyright Proof**
2. Select your track
3. Click **"Verify Proof"**
4. VEKTR will:
   - Regenerate the visual from your session data
   - Compare the hash
   - Show verification evidence

**If the hashes match, your proof is valid.**

---

## What Makes This Different?

### vs. Watermarks:
- **Watermarks:** Can be removed
- **VEKTR:** Cannot be removed (it's in the math)

### vs. Blockchain:
- **Blockchain:** Requires network, costs money
- **VEKTR:** Works offline, free

### vs. Timestamps:
- **Timestamps:** Can be faked
- **VEKTR:** Cannot be faked (deterministic hash)

### vs. AI Generation:
- **AI:** Probabilistic (different output every time)
- **VEKTR:** Deterministic (same output every time)

---

## Technical Details

### Algorithms Used:

- **Hashing:** SHA-256 (same as Bitcoin)
- **PRNG:** xoshiro256** (cryptographically strong)
- **Determinism:** Logical tick (not wall-clock time)
- **Verification:** Input/output hash comparison

### Security:

- **Password:** SHA-256 with random salt
- **Recovery Key:** Deterministic from email + password hash
- **Session Data:** Stored in IndexedDB (encrypted at rest by browser)

### Reproducibility:

Same inputs = same outputs, **always**.

This is enforced by:
- Deterministic PRNG (no Math.random())
- Logical tick (no Date.now())
- Fixed algorithms (no external APIs)

---

## Limitations

### What This DOES Protect:

✅ Visual ownership (geometry, colors, motion)
✅ Lyric video ownership (animations, timing)
✅ Session authenticity (you created it at this time)

### What This DOES NOT Protect:

❌ Audio copyright (use traditional copyright registration)
❌ Lyric copyright (use traditional copyright registration)
❌ Concept/idea copyright (ideas cannot be copyrighted)

**VEKTR protects the VISUAL OUTPUT, not the underlying music or lyrics.**

---

## Best Practices

### 1. Save Your Recovery Key
Write it down. Store it in a password manager. Don't lose it.

### 2. Export Your Identity Regularly
Create backups of your identity + tracks. Store them safely.

### 3. Keep Records
Screenshot your proofs. Save the hash values. Document your creation process.

### 4. Register Your Music Separately
VEKTR protects visuals. Use traditional copyright registration (ASCAP, BMI, etc.) for your music.

### 5. Watermark If You Want
VEKTR's math proof is invisible. Add a visible watermark if you want extra deterrence.

---

## Legal Disclaimer

VEKTR's copyright protection is based on mathematical proof, not legal registration. While the proof is strong evidence of ownership, it is not a substitute for:
- Copyright registration with the U.S. Copyright Office
- Music rights registration with PROs (ASCAP, BMI, SESAC)
- Legal counsel

**Always consult a lawyer for legal advice.**

---

## Learn More

- [Technical Whitepaper](./WHITEPAPER.md) - Full mathematical explanation
- [Security Model](./SECURITY.md) - How we protect your data
- [Architecture](./ARCHITECTURE.md) - How the system works

---

**Questions? Email support@axiometric.tech**
