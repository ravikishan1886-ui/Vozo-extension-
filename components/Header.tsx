'use client';

import React from 'react';
import { Download, Sparkles, Smartphone, Code2, BookOpen, Layers } from 'lucide-react';

interface HeaderProps {
  activeTab: 'queue' | 'phone' | 'code' | 'guide';
  setActiveTab: (tab: 'queue' | 'phone' | 'code' | 'guide') => void;
  onExportZip: () => void;
  isExporting: boolean;
}

export function Header({ activeTab, setActiveTab, onExportZip, isExporting }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
            VB
          </div>
          <span className="text-base font-semibold tracking-tight text-white whitespace-nowrap shrink-0">
            Vozo Batch Assistant
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'queue' ? 'text-white border-b-2 border-blue-500' : 'hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Queue Manager
          </button>
          <button
            onClick={() => setActiveTab('phone')}
            className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'phone' ? 'text-white border-b-2 border-blue-500' : 'hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Firefox & HUD Simulator
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'code' ? 'text-white border-b-2 border-blue-500' : 'hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Android 15 Source Code
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'guide' ? 'text-white border-b-2 border-blue-500' : 'hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Android 15 Feasibility & Build
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onExportZip}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 active:scale-95 transition-all whitespace-nowrap shrink-0 shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Packaging...' : 'Export Android Project (.ZIP)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
