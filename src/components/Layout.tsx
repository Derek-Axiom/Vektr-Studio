import { useNavigate, useLocation, Outlet, NavLink } from '../lib/router';
import { useState, useEffect } from 'react';
import { 
  Music, BookOpen, Video, Link2, Settings, LayoutDashboard,
  Zap, LayoutTemplate, ChevronDown, Monitor, Sparkles, X,
  Mic, Layers, Activity, VektrLogo
} from '../lib/icons';
import { cn } from '../lib/utils';
import { useProfile } from '../lib/ProfileContext';
import { motion } from 'motion/react';

const PASSIVE_HINTS = [
  "Select an item in your Library to begin.",
  "Your Lyric Book auto-syncs. Open it while playing audio.",
  "Check the Visualizer to see your graphics in real-time.",
  "Import your videos and photos to build collections.",
  "Manage your fan-facing links in the Links section."
];

export const Sidebar: React.FC = () => {
  const { profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const isFlow = profile.ambientMode === 'flow';
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
    { icon: Layers, label: 'Content Hub', to: '/library' },
    { icon: Mic, label: 'Vektr Lab', to: '/mobile' },
    { icon: Activity, label: 'Sampler Studio', to: '/sampler' },
    { icon: BookOpen, label: 'Lyric Book', to: '/lyrics' },
    { icon: Video, label: 'Visualizer Studio', to: '/visualizer' },
    { icon: LayoutTemplate, label: 'Content Kit', to: '/content' },
    { icon: Link2, label: 'Link Vault', to: '/links' },
  ];

  return (
    <>
      <aside className={cn("hidden md:flex w-[240px] flex-col border-r z-20 transition-colors duration-300", isFlow ? "border-black/[0.06] bg-white" : "border-white/[0.06] bg-[var(--color-bg)]")}>
        <div className="p-6 pb-8">
          <div className="flex items-center gap-3 px-2">
             <div className="w-8 h-8 rounded-[8px] flex items-center justify-center bg-white/[0.04] border border-white/[0.06]">
                <VektrLogo className="w-4 h-4 text-[var(--color-text)]" />
             </div>
             <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text)]">VEKTR</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={cn(
                  "group w-full flex items-center gap-3 px-4 h-[44px] rounded-[8px] transition-all relative overflow-hidden",
                  isActive 
                    ? (isFlow ? "bg-black/[0.06] text-black border border-black/[0.08]" : "bg-white/[0.08] text-[var(--color-text)] border border-white/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.2)]") 
                    : (isFlow ? "text-black/50 hover:bg-black/[0.04] hover:text-black" : "text-[var(--color-text)] hover:bg-white/[0.04] hover:text-[var(--color-text)]")
                )}
              >
                <item.icon className={cn("w-[18px] h-[18px] relative z-10 transition-transform group-hover:scale-110", isActive ? "text-current" : "opacity-70")} />
                <span className="text-[13px] font-medium tracking-wide relative z-10">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div layoutId="nav-bg" className="absolute inset-0 bg-white/[0.02] z-0 pointer-events-none" />
                )}
              </button>
            );
          })}
        </nav>

        <div className={cn("p-5 border-t transition-colors", isFlow ? "border-black/[0.06]" : "border-white/[0.06]")}>
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-[8px] overflow-hidden border border-white/[0.1]">
              <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-[13px] font-semibold truncate", isFlow ? "text-black" : "text-[var(--color-text)]")}>{profile.displayName}</p>
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider truncate", isFlow ? "text-black/40" : "text-[var(--color-text)]")}>@{profile.slug || 'vektr'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/[0.06] bg-[var(--color-bg-panel)] z-50">
        <nav className="flex overflow-x-auto hide-scrollbar h-14 px-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center flex-shrink-0 w-[72px] h-full gap-1 transition-all outline-none",
                isActive ? "text-[var(--color-text)]" : "text-[var(--color-text)] hover:text-[var(--color-text)]"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-4 h-4" />
                  <span className="text-[9px] font-semibold uppercase tracking-wider">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export const Layout: React.FC = () => {
  const [hintIndex, setHintIndex] = useState(0);
  const { profile, updateProfile } = useProfile();
  const isFlow = profile.ambientMode === 'flow';

  const toggleMode = () => {
    updateProfile({ ambientMode: isFlow ? 'focus' : 'flow' });
  };
  
  useEffect(() => {
    const interval = setInterval(() => setHintIndex(prev => (prev + 1) % PASSIVE_HINTS.length), 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("flex h-[100dvh] overflow-hidden relative text-[var(--color-text)] transition-colors duration-300", isFlow ? "flow-mode bg-[#f4f3f0]" : "bg-[var(--color-bg)]")} style={{ color: 'var(--color-text)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        
        {/* Top App Header */}
        <header className={cn("h-[60px] border-b px-[32px] flex items-center justify-between shrink-0 transition-colors", isFlow ? "border-black/[0.06] bg-white" : "border-white/[0.06] bg-[var(--color-bg-panel)]")}>
          <div className="flex-1 flex items-center gap-3">
             <div className={cn("px-2 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-[0.2em] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]", isFlow ? "bg-black/[0.04] text-black/50 border border-black/[0.08]" : "bg-white/[0.03] text-[var(--color-text)] border border-white/[0.06]")}>
               WORKSPACE
             </div>
             <ChevronDown className={cn("w-3 h-3", isFlow ? "text-black/30" : "text-[var(--color-text)]")} />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2">
              <Sparkles className={cn("w-3 h-3", isFlow ? "text-black/30" : "text-[var(--color-text)]")} />
              <div className={cn("text-[11px] font-medium uppercase tracking-[0.1em] truncate max-w-[300px]", isFlow ? "text-black/40" : "text-[var(--color-text)]")}>
                {PASSIVE_HINTS[hintIndex]}
              </div>
            </div>

            {/* Flow / Focus Mode Toggle */}
            <button
              onClick={toggleMode}
              id="mode-toggle-btn"
              className={cn(
                "flex items-center gap-[8px] px-[12px] h-[32px] rounded-[8px] text-[10px] font-bold uppercase tracking-[0.18em] border transition-all duration-200",
                isFlow
                  ? "bg-black/[0.04] border-black/[0.1] text-black/60 hover:bg-black/[0.08]"
                  : "bg-white/[0.04] border-white/[0.08] text-[var(--color-text)] hover:bg-white/[0.08]"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full transition-colors", isFlow ? "bg-amber-400" : "bg-indigo-400")} />
              {isFlow ? 'Flow' : 'Focus'}
            </button>
          </div>
        </header>

        {/* Locked Grid Content Area */}
        <main className={cn("flex-1 overflow-x-hidden overflow-y-auto relative transition-colors", isFlow ? "bg-[#f4f3f0]" : "bg-[var(--color-bg)]")}>
          <div className="w-full max-w-[1200px] mx-auto px-[32px] py-[24px] min-h-full flex flex-col space-y-[24px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
