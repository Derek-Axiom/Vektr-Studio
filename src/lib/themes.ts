export interface ThemeDefinition {
  id: string;
  name: string;
  bgClass: string;
  textColor: string;
  cardBg: string;
  cardBorder: string;
  cardShadow?: string;
  accent?: string;
  customStyle?: React.CSSProperties; // For glitch effects or SVGs
  isCustom?: boolean; // Flag to identify the robust custom builder
}

export const THEME_CATEGORIES = [
  { id: 'obsidian', name: 'Obsidian Framework', description: 'Deep, glassmorphic minimalism.' },
  { id: 'abstract', name: 'Sleek Abstract', description: 'Refined, subtle structural and geometric designs.' },
  { id: 'creative', name: 'Creative Direction', description: 'Unique, highly-refined editorial aesthetics.' },
  { id: 'glitch', name: 'Glitch & Wireframe', description: 'Boldly executed brutalist disruption.' },
  { id: 'custom', name: 'Artist Custom', description: 'Robust, fully customizable hex-controlled design.' },
];

export const THEMES: Record<string, ThemeDefinition[]> = {
  obsidian: [
    { 
      id: 'obs-1', name: 'Vantablack Glass', 
      bgClass: 'bg-[#050505]', textColor: '#ffffff', 
      cardBg: 'rgba(255, 255, 255, 0.03)', cardBorder: 'rgba(255, 255, 255, 0.08)',
      cardShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    },
    { 
      id: 'obs-2', name: 'Titanium Slate', 
      bgClass: 'bg-gradient-to-b from-[#1a1a1c] to-[#0a0a0b]', textColor: '#e2e2e2', 
      cardBg: 'rgba(0, 0, 0, 0.4)', cardBorder: 'rgba(255, 255, 255, 0.05)',
      cardShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.5)'
    },
    { 
      id: 'obs-3', name: 'Ghost White', 
      bgClass: 'bg-[#f5f5f7]', textColor: '#1d1d1f', 
      cardBg: 'rgba(255, 255, 255, 0.8)', cardBorder: 'rgba(0, 0, 0, 0.04)',
      cardShadow: '0 8px 32px rgba(0, 0, 0, 0.04)', accent: '#000000'
    },
  ],
  abstract: [
    { 
      id: 'abs-1', name: 'Subtle Topography', 
      bgClass: 'bg-[var(--color-bg-card)]', textColor: '#d4d4d4', 
      cardBg: 'rgba(25, 25, 25, 0.5)', cardBorder: 'rgba(255, 255, 255, 0.05)',
      customStyle: { 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }
    },
    { 
      id: 'abs-2', name: 'Silk Sand', 
      bgClass: 'bg-[#e5e1d8]', textColor: '#3e3a35', 
      cardBg: 'rgba(255, 255, 255, 0.4)', cardBorder: 'rgba(62, 58, 53, 0.1)',
      customStyle: { 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233e3a35' fill-opacity='0.03' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
      }
    },
    { 
      id: 'abs-3', name: 'Graphite Grid', 
      bgClass: 'bg-[#121212]', textColor: '#ffffff', 
      cardBg: 'rgba(30, 30, 30, 0.6)', cardBorder: 'rgba(255, 255, 255, 0.08)',
      customStyle: {
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%23ffffff' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E")`
      }
    },
  ],
  creative: [
    { 
      id: 'cre-1', name: 'Editorial Blush', 
      bgClass: 'bg-[#f4ebe6]', textColor: '#2d2422', 
      cardBg: 'rgba(255, 255, 255, 0.5)', cardBorder: 'rgba(45, 36, 34, 0.1)',
      cardShadow: '0 10px 40px rgba(45, 36, 34, 0.05)',
      customStyle: { background: 'radial-gradient(circle at 50% 0%, #ffdfd3 0%, #f4ebe6 60%)' }
    },
    { 
      id: 'cre-2', name: 'Couture Noir', 
      bgClass: 'bg-[#111111]', textColor: '#f0f0f0', 
      cardBg: 'rgba(255, 255, 255, 0.02)', cardBorder: 'rgba(255, 255, 255, 0.05)',
      cardShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
      customStyle: { background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #050505 100%)' }
    },
    { 
      id: 'cre-3', name: 'Liquid Cobalt', 
      bgClass: 'bg-[#0a1128]', textColor: '#ffffff', 
      cardBg: 'rgba(255, 255, 255, 0.05)', cardBorder: 'rgba(255, 255, 255, 0.1)',
      cardShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
      customStyle: { background: 'radial-gradient(circle at 100% 100%, #1c3d7a 0%, #0a1128 70%)' }
    },
  ],
  glitch: [
    { 
      id: 'gli-1', name: 'System Override', 
      bgClass: 'bg-[#000000]', textColor: '#ffffff', 
      cardBg: 'rgba(0, 0, 0, 1)', cardBorder: 'rgba(255, 0, 0, 0.8)',
      cardShadow: '4px 4px 0px rgba(255,0,0,0.5)',
      customStyle: { textShadow: '2px 0 0 red, -2px 0 0 cyan' }
    },
    { 
      id: 'gli-2', name: 'Acid Burn', 
      bgClass: 'bg-[#0a0f0d]', textColor: '#ccff00', 
      cardBg: 'rgba(10, 15, 13, 1)', cardBorder: '#ccff00',
      cardShadow: '-4px 4px 0px #ccff00',
    },
    { 
      id: 'gli-3', name: 'Fatal Exception', 
      bgClass: 'bg-[#ffffff]', textColor: '#000000', 
      cardBg: '#ffffff', cardBorder: '#000000',
      cardShadow: '6px 6px 0px #000000, -2px -2px 0px red',
      customStyle: { textShadow: '1px 1px 0 rgba(255,0,0,0.8)' }
    },
  ],
  custom: [
    {
      id: 'custom-1', name: 'Artist Builder',
      bgClass: 'bg-black', textColor: '#ffffff',
      cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.1)',
      isCustom: true
    }
  ]
};
