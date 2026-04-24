import React, { useState } from 'react';
import { useNavigate } from '../lib/router';
import { ArrowRight, Shield, Zap, Globe, Loader2, CheckCircle2 } from '../lib/icons';
import { motion, AnimatePresence } from 'motion/react';
import VektrLogo from '../components/VektrLogo';
import { useProfile } from '../lib/ProfileContext';
import { useSEO } from '../lib/useSEO';
import { cn } from '../lib/utils';

export default function Onboarding() {
  useSEO('Independent Artist Onboarding', 'Enter your artist name and bio to initialize your unique Creation ID and unlock the full VEKTR Studio suite.');
  const { updateProfile } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedId, setGeneratedId] = useState('');

  const handleEstablish = () => {
    setStep(2);
  };

  const finishOnboarding = () => {
    if (!name) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      const timestamp = Date.now().toString(16).toUpperCase();
      const hash = Math.random().toString(16).substring(2, 6).toUpperCase();
      const newId = `VEKTR-${timestamp.slice(-4)}${hash}`;
      const slug = name.toLowerCase().replace(/\s+/g, '-');

      updateProfile({
        ownerId: newId,
        displayName: name,
        bio: bio || 'Artist / Creator',
        slug,
        initialized: true,
        socials: [
          { id: 'ig', url: '', active: false },
          { id: 'tw', url: '', active: false },
          { id: 'yt', url: '', active: false }
        ]
      });

      setGeneratedId(newId);
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen font-serif select-none relative overflow-hidden bg-gradient-to-b from-[#0B0B0D] to-[#121217] text-[var(--color-text)]">
      {/* BACKGROUND: Subtle vignette, faint radial light, subtle noise */}
      <div className="absolute inset-0 pointer-events-none z-0 mix-blend-multiply" />
      <div className="absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.03)_0%,transparent_50%)] pointer-events-none z-0" />
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1200px] flex-col justify-center px-[32px] py-[40px]">
        <div className="w-full flex flex-col justify-center min-h-[calc(100vh-80px)]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full space-y-[40px] max-w-5xl"
              >
                
                {/* LOGO + MAIN BRAND */}
                <div className="w-full flex flex-col items-start relative z-10 pt-[24px]">
                  <div className="flex items-center gap-[16px] mb-[8px]">
                    <div className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] relative">
                      <img src="/logo.png" alt="VEKTR Logo" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]" />
                    </div>
                    <div className="flex flex-col">
                      <h1 className="text-3xl md:text-5xl font-black tracking-widest text-[var(--color-text)] leading-none uppercase drop-shadow-md">
                        VEKTR STUDIO
                      </h1>
                    </div>
                  </div>
                  
                  <div className="pl-[64px] md:pl-[80px]">
                    <h2 className="text-[12px] md:text-[14px] font-bold uppercase tracking-[0.3em] text-[#7ca2ff]">
                      Producer Workspace
                    </h2>
                  </div>
                </div>

                {/* DESCRIPTION AREA */}
                <div className="w-full flex flex-col items-start space-y-[12px] relative z-10 pt-[24px]">
                  <p className="text-[20px] md:text-[28px] font-bold text-[var(--color-text)] max-w-2xl leading-snug tracking-tight">
                    Turn tracks into release-ready content instantly.
                  </p>
                  <p className="text-[14px] md:text-[16px] text-[var(--color-text)] max-w-2xl leading-relaxed font-sans">
                    Upload once. Auto-prep lyrics, sync visuals, and generate content built for release.
                  </p>
                </div>

                {/* FEATURE MODULES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px] w-full pt-[24px] font-sans relative z-10">
                  <FeatureModule
                    icon={<Shield className="h-4 w-4" />}
                    title="BEAT-SYNCED LYRIC VIDEOS"
                    description="Kinetic lyrics and visuals that move with your track."
                  />
                  <FeatureModule
                    icon={<Zap className="h-4 w-4 p-0.5" />}
                    title="AUTO PREP + SYNC"
                    description="Lyrics are transcribed and timed on upload."
                  />
                  <FeatureModule
                    icon={<Globe className="h-4 w-4" />}
                    title="READY-TO-SHARE EXPORTS"
                    description="Export platform-ready content instantly."
                  />
                </div>

                {/* CTA */}
                <div className="w-full flex justify-start pt-[24px] relative z-10">
                  <button 
                    onClick={handleEstablish}
                    className="ui-button h-[56px] px-[32px] bg-white/[0.04] border border-white/[0.1] text-[var(--color-text)] hover:bg-white/[0.08] hover:border-white/[0.2] font-semibold tracking-[0.2em] text-[11px] uppercase group transition-all"
                  >
                    ENTER STUDIO
                    <ArrowRight className="ml-[12px] h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[600px] mx-auto space-y-[32px]"
              >
                <div className="flex flex-col items-center text-center space-y-[8px]">
                  <div className="w-[80px] h-[80px] mb-[16px] relative">
                    <img src="/logo.png" alt="VEKTR Logo" className="w-[80px] h-[80px] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7ca2ff]">
                    System Engine
                  </span>
                  <h2 className="text-3xl font-bold uppercase tracking-tight text-[var(--color-text)] font-sans">
                    Identity Initialization
                  </h2>
                </div>

                <div className="ui-panel p-[40px] space-y-[32px] bg-[var(--color-bg-panel)]/80 backdrop-blur-md shadow-2xl border border-white/[0.06] font-sans">
                  <div className="space-y-[12px]">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text)]">Artist Alias</label>
                    <input 
                      autoFocus
                      placeholder="E.G. NOISE KILLER"
                      value={name}
                      onChange={(e) => setName(e.target.value.toUpperCase())}
                      className="ui-input h-[56px] text-[16px] font-bold tracking-widest text-center"
                    />
                  </div>

                  <div className="space-y-[12px]">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text)]">Manifesto / Bio</label>
                    <textarea 
                      placeholder="Briefly state your vision..."
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="ui-input py-[16px] min-h-[120px] text-[14px] leading-relaxed resize-none text-center"
                    />
                  </div>

                  <div className="pt-[16px] flex flex-col items-center gap-[16px]">
                    <button 
                      onClick={finishOnboarding}
                      disabled={!name || isGenerating}
                      className={cn(
                        "ui-button h-[56px] w-full group",
                        name && !isGenerating 
                          ? "bg-[#7ca2ff] text-black hover:bg-[#7ca2ff]/90" 
                          : "bg-white/[0.05] text-[var(--color-text)] hover:bg-white/[0.05]"
                      )}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-[8px]" />
                          INITIALIZING...
                        </>
                      ) : (
                        <>
                          INITIALIZE WORKSPACE
                          <ArrowRight className="ml-[8px] h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>

                    <AnimatePresence>
                      {generatedId && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-[8px] text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-widest bg-emerald-400/10 px-[16px] py-[8px] rounded-[6px]"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          CONFIRMED: {generatedId}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function FeatureModule({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-start text-left pt-[24px] mb-[16px] space-y-[12px]">
      <div className="flex h-[32px] w-[32px] items-center justify-center text-[#7ca2ff]">
        {icon}
      </div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-text)]">
        {title}
      </h3>
      <p className="text-[14px] leading-relaxed text-[var(--color-text)] max-w-[280px]">
        {description}
      </p>
    </div>
  );
}
