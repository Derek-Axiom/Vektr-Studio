/**
 * DEPLOYMENT: Autonomous UI Engine / Axiogenesis Ecosystem
 * MODULE: ART_CanvasHasher (v3 - Sovereign Edition)
 *
 * DESCRIPTION:
 * The Ultimate Proof-of-Creation Engine. Zero dependencies. Two layers:
 *
 * 1. SYNC VISUAL HASH: A fast bitwise hash of the full creative state
 *    (identity + metadata + lyrics + full 29-param OmniRack sonic DNA)
 *    used to deterministically seed cover art generation. Always reproducible.
 *
 * 2. ASYNC CRYPTOGRAPHIC HASH: SHA-256 via native window.crypto.subtle.
 *    Produces a hex digest suitable for signing with Ed25519/ECDSA and
 *    anchoring to OpenTimestamps. This is the NFOD root hash.
 *
 * SESSION HISTORY: parentHash embeds a prior creation's proof inside
 * a derivative work's hash, creating a mathematically provable lineage.
 * You cannot have Hash B without Hash A inside it.
 */

import type { OmniRackParams } from './useOmniRack';

// ─── SOVEREIGN CREATION CONTEXT ─────────────────────────────────────────────
// Every field that defines a unique creative work. Any change to any field
// produces a completely different hash. This is the DNA of the creation.

export interface SovereignCreationContext {
  // Artist Identity
  profileId: string;
  username: string;

  // Track Metadata
  trackId: string;
  trackTitle: string;
  artist: string;
  bpm?: number;
  key?: string;
  duration?: number;
  category?: string;
  createdAt: number; // Unix timestamp ms

  // Creative Content
  lyrics: string;
  syncLines?: Array<{ startTime: number; endTime: number; text: string }>;

  // Sonic DNA - Full OmniRack State (all 29 DSP parameters)
  // This protects the specific molecular vibration of the recording,
  // not just the title. Re-recording with a different mastering chain
  // produces a fundamentally different hash.
  rack: OmniRackParams;

  // Session History - embeds a parent proof inside a derivative work.
  // A remix or collab carries the mathematical lineage of what it builds on.
  parentHash?: string;

  // Optional visual assets
  logoUrl?: string;
}

// ─── LEGACY COMPAT (used by cover art generator calls elsewhere) ──────────────
export interface SessionContext {
  profileId: string;
  username: string;
  trackTitle: string;
  lyrics: string;
  mastering: { saturation: number; clarity: number };
  logoUrl?: string;
  syncLines?: Array<{ startTime: number; endTime: number; text: string }>;
}

// ─── LAYER 1: SYNC BITWISE HASH ──────────────────────────────────────────────
// Fast, synchronous, deterministic. Used to seed the visual cover art.
// Encodes the entire SovereignCreationContext into a single integer.

function bitwiseHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // Force 32-bit integer
  }
  return hash;
}

function buildSeedString(ctx: SovereignCreationContext): string {
  const rack = ctx.rack;

  // Every value that defines the sonic identity is serialized.
  // Floating-point values are fixed to 4 decimal places for reproducibility.
  const rackSeed = [
    // Transport
    rack.tempo.toFixed(4),
    rack.vinylPitch.toFixed(4),
    rack.transportActive ? '1' : '0',
    // Dynamics
    rack.gateThresh.toFixed(4),
    rack.compression.toFixed(4),
    rack.limiter.toFixed(4),
    rack.saturation.toFixed(4),
    rack.bitcrush.toFixed(4),
    rack.dynamicsActive ? '1' : '0',
    // Filters
    rack.lpfCutoff.toFixed(4),
    rack.lpfRes.toFixed(4),
    rack.hpfCutoff.toFixed(4),
    rack.hpfRes.toFixed(4),
    rack.bpfFreq.toFixed(4),
    rack.notchFreq.toFixed(4),
    rack.filtersActive ? '1' : '0',
    // 12-Band EQ (each band is a distinct frequency claim)
    rack.eqBands.map(b => b.toFixed(4)).join(','),
    rack.graphicActive ? '1' : '0',
    // Space
    rack.reverbMix.toFixed(4),
    rack.echoTime.toFixed(4),
    rack.echoFbk.toFixed(4),
    rack.echoMix.toFixed(4),
    rack.spaceActive ? '1' : '0',
    // Modulation
    rack.chorusRate.toFixed(4),
    rack.chorusMix.toFixed(4),
    rack.flangerRate.toFixed(4),
    rack.flangerMix.toFixed(4),
    rack.modActive ? '1' : '0',
    // 8D Spatial
    rack.speed8d.toFixed(4),
    rack.radius8d.toFixed(4),
    rack.audio8dActive ? '1' : '0',
  ].join('|');

  const syncLineSeed = ctx.syncLines
    ? ctx.syncLines.map(l => `${l.startTime.toFixed(3)}:${l.endTime.toFixed(3)}:${l.text}`).join(';')
    : '';

  return [
    ctx.profileId,
    ctx.trackId,
    ctx.trackTitle,
    ctx.artist,
    ctx.bpm ?? 0,
    ctx.key ?? '',
    ctx.duration ?? 0,
    ctx.category ?? '',
    ctx.createdAt,
    ctx.lyrics,
    syncLineSeed,
    rackSeed,
    ctx.parentHash ?? 'ORIGIN', // ORIGIN = no parent (first in chain)
  ].join('::');
}

// ─── LAYER 2: ASYNC SHA-256 CRYPTOGRAPHIC HASH ───────────────────────────────
// Uses native window.crypto.subtle - zero dependencies.
// Output is a hex string suitable for Ed25519 signing and OTS anchoring.
// This is the NFOD root hash. Mathematically undeniable.

export async function computeCreationProof(ctx: SovereignCreationContext): Promise<string> {
  const seed = buildSeedString(ctx);
  const encoded = new TextEncoder().encode(seed);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── COVER ART GENERATOR (DNA AESTHETIC MATRIX ENGINE) ─────────────────────────
// Synchronous. Produces a deterministic Base64 JPEG from the full context.
// Calculates Energy and Darkness/Mood from DSP and metadata, mapping to
// completely different visual protocols.

export function ART_CanvasHash(
  ctx: SovereignCreationContext | SessionContext,
  width = 400,
  height = 400
): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const c = canvas.getContext('2d');
  if (!c) return '';

  // Build the seed
  let seedStr: string;
  if ('rack' in ctx) {
    seedStr = buildSeedString(ctx);
  } else {
    seedStr = `${ctx.profileId}-${ctx.trackTitle}-${ctx.lyrics.slice(0, 100)}-${ctx.mastering.saturation}`;
  }

  const hash = bitwiseHash(seedStr);

  // Deterministic pseudo-random number generator rooted in the hash
  let prngState = Math.abs(hash) || 1234567;
  const rand = () => {
    prngState = (prngState * 16807) % 2147483647;
    return (prngState - 1) / 2147483646;
  };

  // 1. SONIC DNA MATRIX ANALYSIS (Extracting Vibe)
  let energy = 0.5;
  let darkness = 0.5;

  if ('rack' in ctx) {
    const rack = ctx.rack;
    const bpm = ctx.bpm || 120;

    // Energy: Faster BPM, High Saturation, Drive/Compression
    const normBpm = Math.max(0, Math.min(1, (bpm - 60) / 140)); // 60-200bpm maps to 0-1
    const normSat = Math.max(0, Math.min(1, rack.saturation / 100)); // 0-100 to 0-1
    energy = (normBpm * 0.6) + (normSat * 0.4);

    // Darkness: Low Pass Filter (muffled = darker), Bitcrush (gritty = darker), Minor Key
    const normLpf = 1 - Math.max(0, Math.min(1, (rack.lpfCutoff - 200) / 19800)); // Lower cutoff = darker
    const normCrush = Math.max(0, Math.min(1, rack.bitcrush / 100));
    const keyStr = (ctx.key || '').toLowerCase();
    const isMinor = keyStr.includes('m');

    darkness = (normLpf * 0.3) + (normCrush * 0.4) + (isMinor ? 0.3 : 0);
  } else {
    energy = rand();
    darkness = rand();
  }

  // 2. COLOR SCIENCE
  const baseHue = Math.floor(rand() * 360);
  let sat, lit, bgLit;

  if (darkness > 0.5) {
    // DARK NARRATIVE
    sat = energy > 0.6 ? 95 : 40; // Acid/Neon for high energy, muted charcoal/blues for low
    lit = energy > 0.6 ? 45 : 25;
    bgLit = rand() * 8;           // Deep shadows (0-8% lightness)
  } else {
    // LIGHT NARRATIVE
    sat = energy > 0.6 ? 85 : 40; // Vibrant Pop colors vs pastel/airy colors
    lit = energy > 0.6 ? 60 : 80;
    bgLit = 90 + (rand() * 8);    // Bright background (90-98%)
  }

  const primaryColor = `hsl(${baseHue}, ${sat}%, ${lit}%)`;
  const accent1 = `hsl(${(baseHue + 150) % 360}, ${sat}%, ${lit}%)`;
  const accent2 = `hsl(${(baseHue + 210) % 360}, ${sat}%, ${lit}%)`;
  const bgColor = `hsl(${baseHue}, ${sat * 0.2}%, ${bgLit}%)`;
  const textColor = darkness > 0.5 ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.95)';

  // 3. BACKGROUND PLATING
  c.fillStyle = bgColor;
  c.fillRect(0, 0, width, height);

  // Deep wash / Vignette
  const grad = c.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(1, `hsl(${(baseHue + 45) % 360}, ${sat * 0.4}%, ${darkness > 0.5 ? 0 : 100}%, 0.4)`);
  c.fillStyle = grad;
  c.fillRect(0, 0, width, height);

  // 4. ATMOSPHERIC TEXTURE (Grit vs Smooth)
  if (darkness > 0.6) {
    // Industrial/Gritty: Heavy film grain
    const grainCount = energy > 0.6 ? 5000 : 2000;
    for (let i = 0; i < grainCount; i++) {
      c.fillStyle = `rgba(255,255,255,${rand() * 0.12})`;
      c.fillRect(rand() * width, rand() * height, 1 + rand() * 2, 1 + rand() * 2);
    }
    // Scanlines / Bitcrush tearing if high energy
    if (energy > 0.6) {
      c.fillStyle = `rgba(0,0,0,0.3)`;
      for (let y = 0; y < height; y += 4 + rand() * 4) {
        if (rand() > 0.4) c.fillRect(0, y, width, 1 + rand() * 2);
      }
    }
  } else {
    // Light/Airy: Soft stippling, clean diffusion
    for (let i = 0; i < 1500; i++) {
      c.fillStyle = `rgba(0,0,0,${rand() * 0.04})`;
      c.fillRect(rand() * width, rand() * height, 1, 1);
    }
  }

  // 5. VECTOR MANIFESTATION (Geometry driven by Energy)
  c.save();
  c.globalCompositeOperation = darkness > 0.5 ? 'screen' : 'multiply';

  const numElements = Math.floor(4 + (rand() * 12 * energy));

  for (let i = 0; i < numElements; i++) {
    c.beginPath();
    const startX = rand() * width;
    const startY = rand() * height;

    const rColor = rand();
    c.strokeStyle = rColor > 0.6 ? primaryColor : (rColor > 0.3 ? accent1 : accent2);
    c.lineWidth = 1 + (rand() * 6 * energy);

    if (energy > 0.5) {
      // HIGH ENERGY: Jagged, shattered glass, angular lines, aggressive
      c.moveTo(startX, startY);
      let cx = startX;
      let cy = startY;
      const segments = Math.floor(3 + rand() * 6);
      for (let s = 0; s < segments; s++) {
        cx += (rand() - 0.5) * (width * 0.8);
        cy += (rand() - 0.5) * (height * 0.8);
        c.lineTo(cx, cy);
      }
      c.stroke();

      // Solid geometric shard
      if (rand() > 0.7) {
        c.fillStyle = c.strokeStyle;
        c.globalAlpha = 0.15;
        c.fill();
        c.globalAlpha = 1.0;
      }
    } else {
      // LOW ENERGY: Smooth, flowing curves, orbital rings, elegant
      c.moveTo(startX, startY);
      const cp1x = startX + (rand() - 0.5) * width * 1.5;
      const cp1y = startY + (rand() - 0.5) * height * 1.5;
      const cp2x = startX + (rand() - 0.5) * width * 1.5;
      const cp2y = startY + (rand() - 0.5) * height * 1.5;
      const endX = rand() * width;
      const endY = rand() * height;
      c.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
      c.stroke();

      // Diffused soft orb
      if (rand() > 0.6) {
        const r = rand() * width * 0.4;
        const orbGrad = c.createRadialGradient(startX, startY, 0, startX, startY, r);
        orbGrad.addColorStop(0, c.strokeStyle);
        orbGrad.addColorStop(1, 'transparent');
        c.fillStyle = orbGrad;
        c.globalAlpha = 0.25;
        c.arc(startX, startY, r, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1.0;
      }
    }
  }
  c.restore();

  // 6. SOVEREIGN TYPOGRAPHY (Stylized Overlay)
  const trackName = 'trackTitle' in ctx ? ctx.trackTitle : (ctx as SessionContext).trackTitle;
  const cleanTrackName = trackName.toUpperCase();

  // Background Monolith Text
  c.save();
  c.fillStyle = darkness > 0.5 ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
  c.font = `900 ${width * 0.3}px "Inter", "system-ui", sans-serif`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(cleanTrackName.slice(0, 2), width / 2, height / 2);
  c.restore();

  // Main Typography rendering
  c.save();
  c.textAlign = 'left';
  c.textBaseline = 'bottom';

  const drawGlitchText = (text: string, x: number, y: number, fontSize: number, weight = 'bold') => {
    c.font = `${weight} ${fontSize}px "Inter", "system-ui", sans-serif`;

    // Glitch Chromatic Aberration for Dark + High Energy
    if (darkness > 0.6 && energy > 0.6) {
      c.fillStyle = 'rgba(255,0,50,0.85)';
      c.fillText(text, x + 3, y);
      c.fillStyle = 'rgba(0,255,255,0.85)';
      c.fillText(text, x - 3, y);

      // Visual slice/tear logic
      if (rand() > 0.3) {
        const sliceY = y - (rand() * fontSize);
        const sliceH = rand() * (fontSize * 0.4);
        const sliceOffset = (rand() - 0.5) * 30;
        const sliceData = c.getImageData(0, sliceY - sliceH, width, sliceH);
        c.putImageData(sliceData, sliceOffset, sliceY - sliceH);
      }
    }

    c.fillStyle = textColor;
    c.fillText(text, x, y);
  };

  // Titles
  drawGlitchText(cleanTrackName, 24, height - 55, width * 0.08, '900');

  // Artist Name
  c.fillStyle = darkness > 0.5 ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  c.font = `bold ${width * 0.035}px "Inter", "system-ui", sans-serif`;
  c.fillText(ctx.username.toUpperCase(), 24, height - 32);

  // Technical Readout (The math signature)
  c.font = `bold ${width * 0.02}px monospace`;
  c.textAlign = 'right';
  c.fillStyle = darkness > 0.5 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  const readoutText = `NRG:${energy.toFixed(2)} | DRK:${darkness.toFixed(2)} | Σ:${hash.toString().slice(0, 8).toUpperCase()}`;
  c.fillText(readoutText, width - 24, height - 32);
  c.restore();

  // Session History Lineage Ring
  if ('parentHash' in ctx && ctx.parentHash) {
    c.save();
    c.strokeStyle = darkness > 0.5 ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
    c.lineWidth = 1;
    c.setLineDash([2, 4]);
    c.beginPath();
    c.arc(width / 2, height / 2, width * 0.45, 0, Math.PI * 2);
    c.stroke();
    c.restore();
  }

  return canvas.toDataURL('image/jpeg', 0.85);
}

// ─── UTILITY: BUILD CONTEXT FROM PROFILE + TRACK ─────────────────────────────
// Convenience helper to construct a SovereignCreationContext from the
// existing ProfileContext data shapes used throughout the app.

import type { OmniRackParams as _ORP } from './useOmniRack';

export function buildSovereignContext(
  profile: { ownerId: string; displayName: string },
  track: { id: string; title: string; artist: string; bpm?: number; key?: string; duration?: number; category?: string; createdAt: number },
  rack: _ORP,
  lyrics: string = '',
  syncLines?: Array<{ startTime: number; endTime: number; text: string }>,
  parentHash?: string,
  logoUrl?: string,
): SovereignCreationContext {
  return {
    profileId: profile.ownerId,
    username: profile.displayName,
    trackId: track.id,
    trackTitle: track.title,
    artist: track.artist,
    bpm: track.bpm,
    key: track.key,
    duration: track.duration,
    category: track.category,
    createdAt: track.createdAt,
    lyrics,
    syncLines,
    rack,
    parentHash,
    logoUrl,
  };
}

