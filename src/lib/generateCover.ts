import { ART_CanvasHash } from './ART_CanvasHasher';

/**
 * LEGACY / SEED-ONLY UTILITY
 * Generates a deterministic cover image from a plain string seed.
 * Used where full SovereignCreationContext is not available (e.g. placeholder art).
 * For real track cover art, use ART_CanvasHash(buildSovereignContext(...)) directly.
 */
export function generateCoverUrl(seed: string, width = 400, height = 400): string {
  if (typeof document === 'undefined') return '';

  return ART_CanvasHash({
    profileId: seed,
    username: 'SOVEREIGN',
    trackTitle: seed.substring(0, 10),
    lyrics: '',
    mastering: { saturation: 75, clarity: 50 },
  }, width, height);
}
