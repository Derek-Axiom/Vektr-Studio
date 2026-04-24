import React from 'react';
import { Search, List, LayoutGrid, Upload, Plus, Activity } from '../../lib/icons';
import { cn } from '../../lib/utils';

interface LibraryHeaderProps {
  category: string;
  parent: string;
  count: number;
  search: string;
  onSearchChange: (val: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  isUploading: boolean;
  onUploadClick: () => void;
  onCreateCollection?: () => void;
}

export function LibraryHeader({
  category,
  parent,
  count,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  isUploading,
  onUploadClick,
  onCreateCollection,
}: LibraryHeaderProps) {
  const isCollection = ['EP', 'Album'].includes(category);

  return (
    <div className="page-header relative">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-[24px]">
        {/* Title Area */}
        <div className="flex flex-col">
          <span className="text-app-label mb-[8px]">{parent} / {category}</span>
          <h1 className="text-page-title mb-[12px]">{category}</h1>
          <p className="text-body max-w-lg">
            Manage your {category.toLowerCase()} files. Select an item to edit its metadata.
          </p>
        </div>

        {/* Action / Toolbar Area */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-[16px]">
          
          <div className="relative w-full md:w-[240px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text)] group-focus-within:text-[var(--color-text)] transition-colors" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search assets..."
              className="ui-input pl-11 h-[44px]"
            />
          </div>

          <div className="flex bg-white/[0.04] p-1 rounded-[10px] border border-white/[0.06]">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                "p-2 rounded-[8px] transition-all",
                viewMode === 'grid' 
                  ? "bg-white/[0.1] text-[var(--color-text)] shadow-sm" 
                  : "text-[var(--color-text)] hover:text-[var(--color-text)]"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                "p-2 rounded-[8px] transition-all",
                viewMode === 'list' 
                  ? "bg-white/[0.1] text-[var(--color-text)] shadow-sm" 
                  : "text-[var(--color-text)] hover:text-[var(--color-text)]"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-[12px]">
            {isCollection ? (
              <button onClick={onCreateCollection} className="ui-button h-[44px]">
                <Plus className="w-4 h-4" /> Create {category}
              </button>
            ) : (
              <button 
                onClick={onUploadClick} 
                disabled={isUploading} 
                className="ui-button h-[44px] disabled:opacity-50"
              >
                {isUploading ? <Activity className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isUploading ? 'Transferring...' : 'Upload'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
