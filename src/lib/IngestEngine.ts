/**
 * VEKTR Studio - IngestEngine (Sovereign, Zero-Dependency)
 *
 * The "Ingest Once, Ready Everywhere" background processing layer.
 * Executes immediately after a file is added to the vault.
 *
 * Pipeline:
 *   1. Decode audio via OfflineAudioContext (non-blocking, C++ native)
 *   2. Extract BPM, Key, Camelot, Genre, Spectral Histogram (via VektrLabContext)
 *   3. Detect transient onsets (via audioAnalysis - for Lyric Sync & Visualizer)
 *   4. Compute overall energy level (0–1)
 *   5. Return a fully typed IngestionResult for global state storage
 *
 * This function is designed to be called with .then() - it NEVER blocks the UI.
 * The file appears in the vault instantly. Analysis arrives seconds later.
 */

import { extractAudioIntelligence } from './VektrLabContext';
import { detectVocalOnsets } from './audioAnalysis';
import type { IngestionResult } from '../types';

/**
 * Decodes a raw File into an AudioBuffer using OfflineAudioContext.
 * OfflineAudioContext processes at maximum native CPU speed - ~10–50x faster
 * than real-time AudioContext decoding, and never blocks the main thread.
 */
async function decodeFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  // Use stereo, 44100Hz as baseline - OfflineAudioContext auto-resamples
  const offlineCtx = new OfflineAudioContext(2, 44100 * 30, 44100);
  return offlineCtx.decodeAudioData(arrayBuffer);
}

/**
 * Compute overall RMS energy of the track (0–1).
 * Used for the 'high_energy' / 'mellow' auto-tag.
 */
function computeEnergy(buffer: AudioBuffer): number {
  const data = buffer.getChannelData(0);
  let sum = 0;
  const step = Math.floor(data.length / 4000); // Sample 4000 points for speed
  for (let i = 0; i < data.length; i += step) {
    sum += data[i] * data[i];
  }
  return Math.min(1, Math.sqrt(sum / (data.length / step)) * 8);
}

/**
 * Main ingestion function. Call this fire-and-forget with .then() immediately
 * after adding a file to the vault. It resolves with a full IngestionResult.
 *
 * @param file   - The raw File object from the upload handler
 * @param itemId - The vault ID already assigned to this MediaItem
 */
export async function processIngestion(file: File, itemId: string): Promise<IngestionResult & { itemId: string }> {
  // Step 1: Decode audio natively (OfflineAudioContext - non-blocking)
  const audioBuffer = await decodeFile(file);

  // Step 2: Full audio intelligence extraction (BPM, Key, Camelot, Genre, Histogram, Suggestions)
  const intelligence = await extractAudioIntelligence(audioBuffer);

  // Step 3: Transient onset detection (timing anchors for Lyric Sync & Visualizer Word-Storm)
  const onsets = await detectVocalOnsets(audioBuffer);

  // Step 4: Overall energy level
  const energy = computeEnergy(audioBuffer);

  return {
    itemId,
    bpm: intelligence.bpm,
    key: intelligence.key,
    camelot: intelligence.camelot,
    genre: intelligence.genre,
    energy,
    duration: audioBuffer.duration,
    onsets,                    // Full Onset[] array - timestamps preserved
    onsetCount: onsets.length, // Convenience derived field
    suggestions: intelligence.suggestions,
    histogram: intelligence.histogram,
  };
}

/**
 * Builds the auto-tag array from an IngestionResult.
 * Tags are used for search, filtering, and routing in the Syncopated Studio.
 */
export function buildAutoTags(result: IngestionResult): string[] {
  const tags: string[] = [
    `bpm:${result.bpm}`,
    `key:${result.key}`,
    `camelot:${result.camelot}`,
    `genre:${result.genre.toLowerCase().replace(/\s+\/\s+/g, '_').replace(/\s+/g, '_')}`,
    result.energy > 0.65 ? 'high_energy' : result.energy > 0.35 ? 'mid_energy' : 'mellow',
    'ready_for_studio',
  ];

  // Spectral character tags
  if (result.histogram.subBass > 60) tags.push('heavy_bass');
  if (result.histogram.treble > 60) tags.push('bright');
  if (result.histogram.mid > 65) tags.push('mid_forward');

  return tags;
}

