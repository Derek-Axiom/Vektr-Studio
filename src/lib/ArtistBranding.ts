/**
 * Automatic Artist Branding
 * Generates a unique visual look based on the artist's name.
 */

export interface BrandingAudioData {
  amplitude: number; // 0..1 overall signal level
  bass: number;      // 0..1 low-frequency power
}

// ─── 1. UNIQUE BRANDING SEED ─────────────────────────────────────────────────
export function getArtistSeed(name: string): number {
  let id = 0;
  for (let i = 0; i < name.length; i++) {
    id = name.charCodeAt(i) + ((id << 5) - id);
    id |= 0; // Force 32-bit integer
  }
  return Math.abs(id);
}

// ─── 2. VISUALIZER ENGINE PROJECTION (Perspective Math) ──────────────────────
export function project3Dto2D(
  x: number, y: number, z: number,
  width: number, height: number
): { x: number; y: number; scale: number } {
  const fov = 600 / (600 + z);
  return {
    x: width / 2 + x * fov,
    y: height / 2 + y * fov,
    scale: fov,
  };
}

// ─── 3. RENDER ENGINE ────────────────────────────────────────────────────────
export function renderArtistBranding(
  ctx: CanvasRenderingContext2D,
  name: string,
  audio: BrandingAudioData,
  width: number,
  height: number
): void {
  if (!name) return;

  const artistId = getArtistSeed(name);

  // Deterministic color - unique per username, stable across sessions
  const hue = artistId % 360;
  const crestRadius = 60 + (artistId % 120); // 60px–180px - unique crest size

  // Audio-reactive scaling
  const bass = Math.min(1, Math.max(0, audio.bass));
  const amp  = Math.min(1, Math.max(0, audio.amplitude));
  const pulse = 1 + bass * 0.18; // subtle - max 18% size increase on hard bass hit

  ctx.save();

  // ── A. DETERMINISTIC CREST (behind the foundation) ─────────────────────────
  // A unique ambient ring seeded by username. Pulses on bass.
  const sides = (artistId % 6) + 3; // 3=triangle → 8=octagon
  const cx = width / 2;
  const cy = height / 2;
  const r = crestRadius * pulse;

  ctx.beginPath();
  if (sides === 3) {
    // Circle for seeds that land on 0 mod 6
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  } else {
    // Polygon - deterministic from sides count
    const angleStep = (Math.PI * 2) / sides;
    const startAngle = (artistId % 628) / 100; // offset rotation by seed
    for (let i = 0; i < sides; i++) {
      const a = startAngle + i * angleStep;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  ctx.strokeStyle = `hsla(${hue}, 70%, 55%, ${0.08 + amp * 0.1})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Double ring - second ring at 1.4x radius for depth
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.4, 0, Math.PI * 2);
  ctx.strokeStyle = `hsla(${hue}, 60%, 50%, ${0.04 + amp * 0.06})`;
  ctx.lineWidth = 0.75;
  ctx.stroke();

  // ── B. MONUMENTAL FOUNDATION (username at bottom, perspective-projected) ────
  // The name is rendered at z=150 depth, creating a slight perspective-shrink
  // that grounds it visually. Pulses in size and glow with audio amplitude.
  const proj = project3Dto2D(0, height * 0.35, 150, width, height);
  const baseFontSize = 52 * proj.scale;
  const fontSize = baseFontSize * pulse;

  ctx.font = `bold ${fontSize.toFixed(1)}px "Inter", "Outfit", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Shadow glow - driven by amplitude, color matches crest hue
  ctx.shadowBlur = 15 + amp * 30;
  ctx.shadowColor = `hsla(${hue}, 80%, 65%, ${0.4 + amp * 0.4})`;

  // Studio Warmth shifts with amplitude: muted at silence, vivid at full signal
  const studioWarmth = Math.round(40 + amp * 55);
  const lightness = Math.round(55 + amp * 15);
  ctx.fillStyle = `hsla(${hue}, ${studioWarmth}%, ${lightness}%, ${0.7 + amp * 0.25})`;

  ctx.fillText(name.toUpperCase(), proj.x, proj.y);

  ctx.restore();
}

