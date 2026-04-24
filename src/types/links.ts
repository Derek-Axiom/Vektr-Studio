export type LinkPlatform =
  | 'spotify'
  | 'apple'
  | 'youtube'
  | 'soundcloud'
  | 'bandcamp'
  | 'tiktok'
  | 'instagram'
  | 'twitter'
  | 'website'
  | 'custom';

export type LinkScope = 'artist' | 'release';

export interface LinkItem {
  id: string;
  platform: LinkPlatform;
  label: string;
  url: string;
  isPrimary: boolean;
  scope: LinkScope;
  trackId?: string;
  addedAt: string;
  /** Compat alias - simple type used by some UI components */
  type?: 'spotify' | 'apple' | 'instagram' | 'tiktok' | 'other';
}

