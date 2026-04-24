export type StemType = 'instrumental' | 'vocals' | 'backing_vocals' | 'drums' | 'percussion' | 'bass' | 'guitar' | 'synth' | 'keys' | 'piano' | 'strings' | 'brass' | 'woodwinds' | 'fx' | 'other';
export type MediaType = 'audio' | 'video' | 'image' | 'collection' | 'other';
export type MediaStatus = 'uploading' | 'processing' | 'ready' | 'error';

export interface Stem {
  id: string;
  name: string;
  type: StemType;
  audioUrl: string;
}

/** Structured data produced by the IngestEngine after background analysis */
export interface Onset {
  time: number;
  magnitude: number;
}

export interface IngestionResult {
  bpm: number;
  key: string;
  camelot: string;
  genre: string;
  energy: number;        // 0–1 RMS energy level
  duration: number;
  onsets: Onset[];       // Full transient timestamp array - used by LyricBook sync
  onsetCount: number;   // Convenience count derived from onsets.length
  suggestions: { presetName: string; reason: string }[];
  histogram: {
    subBass: number; bass: number; lowMid: number;
    mid: number; highMid: number; treble: number;
  };
}

export interface MediaItem {
  id: string;
  title: string;
  artist: string;
  type: MediaType;
  category: 'Single' | 'EP' | 'Album' | 'Stems' | 'Videos' | 'Photos';
  subcategory?: string;
  // Auto-detected metadata fields
  bpm?: number;
  key?: string;
  duration: number;
  thumbnailUrl?: string;
  fileUrl?: string;
  trackIds?: string[];
  stems?: Stem[];
  lyricsId?: string;
  createdAt: number;
  // Ingest Pipeline Fields
  status?: MediaStatus;         // Lifecycle state of the item
  tags?: string[];              // Auto-generated system tags (bpm:120, key:Am, etc.)
  analysisData?: IngestionResult; // Full structured output from IngestEngine
}

