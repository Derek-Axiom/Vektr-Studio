import React from 'react';
import { ChevronRight } from '../../lib/icons';
import { cn } from '../../lib/utils';

export type LibraryCategory = 'All' | 'Single' | 'EP' | 'Album' | 'Stems' | 'Videos' | 'Photos';

interface LibrarySidebarProps {
  activeCategory: string;
  onCategoryChange: (category: LibraryCategory) => void;
  activeSubCategory?: string;
  onSubCategoryChange?: (sub: string) => void;
}

const SECTIONS = [
  {
    label: 'REPERTOIRE',
    items: ['Single', 'EP', 'Album'] as LibraryCategory[],
  },
  {
    label: 'STUDIO ASSETS',
    items: ['Stems'] as LibraryCategory[],
  },
  {
    label: 'MEDIA',
    items: ['Videos', 'Photos'] as LibraryCategory[],
  },
];

const STEM_SUB_CATEGORIES = [
  'All Stems', 'Instrumental', 'Vocals', 'Backing Vocals', 'Drums', 'Percussion', 
  'Bass', 'Guitar', 'Synth', 'Keys', 'Piano', 'Strings', 'Brass', 'Woodwinds', 'FX', 'Others'
];

export function LibrarySidebar({ 
  activeCategory, 
  onCategoryChange, 
  activeSubCategory, 
  onSubCategoryChange
}: LibrarySidebarProps) {
  return (
    <aside className="w-[240px] shrink-0 flex flex-col h-full hidden md:flex overflow-y-auto ui-panel p-[16px]">
      <div className="pb-6 mb-4 border-b border-white/[0.06]">
        <h2 className="text-section-title">
          Files
        </h2>
      </div>

      <nav className="space-y-8 select-none">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="px-3 mb-3 text-app-label">
              {section.label}
            </div>
            
            <div className="space-y-1">
              {section.items.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <div key={cat} className="space-y-1">
                    <button
                      onClick={() => onCategoryChange(cat)}
                      className={cn(
                        "group w-full flex items-center justify-between px-3 py-[8px] rounded-[8px] text-[13px] transition-all relative overflow-hidden",
                        isActive
                          ? "bg-white/[0.08] text-[var(--color-text)] shadow-sm border border-white/[0.06]"
                          : "text-[var(--color-text)] hover:text-[var(--color-text)] hover:bg-white/[0.04] border border-transparent"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-md bg-[#7ca2ff]" />
                      )}
                      <span className={cn(
                        "truncate transition-all",
                        isActive ? "font-semibold" : "font-medium"
                      )}>
                        {cat}
                      </span>
                      <ChevronRight className={cn(
                        "w-[14px] h-[14px] transition-all",
                        isActive ? "opacity-100 text-[#7ca2ff]" : "opacity-0 group-hover:opacity-50"
                      )} />
                    </button>

                    {cat === 'Stems' && isActive && STEM_SUB_CATEGORIES && (
                      <div className="ml-3 pl-3 border-l border-white/[0.06] mt-2 space-y-1 mb-3">
                        {STEM_SUB_CATEGORIES.map(sub => (
                          <button
                            key={sub}
                            onClick={() => onSubCategoryChange?.(sub)}
                            className={cn(
                              "w-full text-left px-3 py-[6px] rounded-[6px] text-micro tracking-wider transition-all",
                              activeSubCategory === sub
                                ? "bg-white/[0.06] text-[var(--color-text)]"
                                : "text-[var(--color-text)] hover:text-[var(--color-text)]"
                            )}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
