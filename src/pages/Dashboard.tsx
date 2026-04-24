import React from 'react';
import { BookOpen, Video, Link2, ArrowRight, Play, Layers } from '../lib/icons';
import { useNavigate } from '../lib/router';
import { useProfile } from '../lib/ProfileContext';
import { useSEO } from '../lib/useSEO';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function Dashboard() {
  useSEO('Artist Dashboard', 'Monitor your tracks, lyrics, and visuals from one professional creative HQ.');
  const navigate = useNavigate();
  const { vault, lyricBooks, shareableItems, setActiveMediaId } = useProfile();

  const linksCount = shareableItems.filter(i => i.type === 'external_link').length;
  const visualsCount = shareableItems.filter(i => i.type === 'visual').length;

  const stats = [
    { label: 'Cloud Assets', value: vault.length, icon: Layers, to: '/library' },
    { label: 'Lyric Books', value: lyricBooks.length, icon: BookOpen, to: '/lyrics' },
    { label: 'Visualizers', value: visualsCount, icon: Video, to: '/visualizer' },
    { label: 'Active Links', value: linksCount, icon: Link2, to: '/links' },
  ];

  const handleMediaClick = (id: string, type: string) => {
    setActiveMediaId(id);
    navigate(type === 'audio' ? '/visualizer' : '/library');
  };

  return (
    <div className="flex flex-col gap-[24px] w-full">
      {/* 8. HEADER SYSTEM */}
      <div className="page-header">
        <span className="text-app-label">VEKTR STUDIO</span>
        <h1 className="text-page-title">Dashboard</h1>
        <p className="text-body max-w-2xl">
          Manage your master files, sync lyrics, and render release-ready content from a unified studio environment.
        </p>
        <div className="flex items-center gap-[12px] mt-6">
          <button onClick={() => navigate('/library')} className="ui-button">
            Content Hub
          </button>
          <button onClick={() => navigate('/visualizer')} className="ui-button-secondary">
            Visualizer Studio
          </button>
        </div>
      </div>

      {/* STATS ROW (GRID OF CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px]">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            onClick={() => navigate(stat.to)}
            className="ui-card cursor-pointer group flex flex-col gap-4"
          >
            <div className="flex justify-between items-start text-[var(--color-text)] group-hover:text-[var(--color-text)] transition-colors">
              <stat.icon className="w-5 h-5" />
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[var(--color-text)]" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight text-[var(--color-text)]">{stat.value}</div>
              <h3 className="text-card-title text-[var(--color-text)] group-hover:text-[var(--color-text)]">{stat.label}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 4. PANEL SYSTEM (ACTIVITY SECTION) */}
      <div className="ui-panel">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-section-title">Recent Activity</h2>
          <button onClick={() => navigate('/library')} className="text-app-label flex items-center gap-2 hover:text-[var(--color-text)] transition-colors">
            View Vault <ArrowRight className="w-[14px] h-[14px]" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
          {vault.length === 0 ? (
            <div className="col-span-2 py-12 text-center flex flex-col items-center justify-center border border-white/[0.06] rounded-[12px] bg-white/[0.02]">
              <p className="text-micro text-[var(--color-text)]">No recent activity found in vault.</p>
            </div>
          ) : vault.slice(0, 4).map((item) => (
            <div 
              key={item.id} 
              onClick={() => handleMediaClick(item.id, item.type)}
              className="ui-card cursor-pointer group flex items-start gap-4 hover:border-white/20"
            >
              <div className="w-[64px] h-[64px] rounded-[8px] bg-[var(--color-bg)] overflow-hidden relative border border-white/[0.06] shrink-0">
                <img src={item.thumbnailUrl} alt="Cover" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-5 h-5 text-[var(--color-text)] fill-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-1 mt-1">
                <h3 className="text-[14px] font-semibold text-[var(--color-text)] tracking-wide truncate">{item.title}</h3>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7ca2ff]">
                  {item.type}
                </span>
                <span className="text-[11px] font-medium text-[var(--color-text)] mt-1 uppercase">{timeAgo(item.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
