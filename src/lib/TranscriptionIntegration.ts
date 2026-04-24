/**
 * Transcription Integration Patch
 * 
 * This module extends the existing MediaItem type and provides
 * integration hooks for the transcription engine.
 */

import type { MediaItem } from '../types';
import { transcribeAudioSmart, type TranscriptionResult } from './TranscriptionEngine';

/**
 * Extended MediaItem with transcription fields
 */
export interface MediaItemWithTranscription extends MediaItem {
  transcription?: string;
  transcriptionSegments?: Array<{ text: string; start: number; end: number }>;
}

/**
 * Process transcription for an uploaded audio file
 * Returns transcription data to merge into MediaItem
 */
export async function processTranscription(
  file: File
): Promise<{ transcription: string; transcriptionSegments: Array<{ text: string; start: number; end: number }> } | null> {
  try {
    const result: TranscriptionResult = await transcribeAudioSmart(file);
    
    return {
      transcription: result.text,
      transcriptionSegments: result.segments.map(s => ({
        text: s.text,
        start: s.start,
        end: s.end,
      })),
    };
  } catch (error) {
    console.warn('Transcription failed:', error);
    return null;
  }
}

/**
 * Check if transcription is available for a media item
 */
export function hasTranscription(item: MediaItem): item is MediaItemWithTranscription {
  return !!(item as MediaItemWithTranscription).transcription;
}

/**
 * Get transcription text from media item
 */
export function getTranscription(item: MediaItem): string | null {
  return (item as MediaItemWithTranscription).transcription || null;
}

/**
 * Get transcription segments with timestamps
 */
export function getTranscriptionSegments(item: MediaItem): Array<{ text: string; start: number; end: number }> | null {
  return (item as MediaItemWithTranscription).transcriptionSegments || null;
}
