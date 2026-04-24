export interface PublicProfile {
  ownerId: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: string;
  cardStyle: string;
  font: string;
  slug: string;
  initialized: boolean;
  customTheme?: {
    background: string;
    bgImage: string;
    cardBg: string;
    cardImage: string;
    textColor: string;
    cardText: string;
    cardBorder: string;
    font: string;
  };
  ambientMode?: 'flow' | 'focus';
  customThemeConfig?: {
    bg: string;
    text: string;
    cardBg: string;
    border: string;
  };
  socials?: {
    id: string;
    url: string;
    active: boolean;
  }[];
}
