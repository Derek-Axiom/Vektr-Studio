export interface ShareableItem {
  id: string;
  ownerId: string;
  type: 'external_link' | 'track' | 'lyric' | 'visual' | 'audio';
  title: string;
  subtitle?: string;
  url?: string;
  thumbnail?: string;
  sourceId?: string;
  isVisible: boolean;
  sortOrder: number;
  createdAt?: number;
}
