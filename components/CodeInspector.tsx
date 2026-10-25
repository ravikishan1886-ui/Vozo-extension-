'use client';

import React, { useState } from 'react';
import { 
  FileCode2, 
  Copy, 
  Check, 
  Search, 
  Folder, 
  FolderOpen, 
  FileText, 
  Layers, 
  Settings2,
  ExternalLink
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, AndroidFile } from '@/lib/androidProjectFiles';

export function CodeInspector() {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(
    ANDROID_PROJECT_FILES.find((f) => f.path.includes('MainActivity.kt')) || ANDROID_PROJECT_FILES[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredFiles = ANDROID_PROJECT_FILES.filter(
    (file) =>
      file.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    { id: 'kotlin', label: 'Kotlin Source & ViewModels' },
    { id: 'manifest', label: 'Android 15 Manifest' },
    { id: 'gradle', label: 'Gradle Build Configuration' },
    { id: 'xml', label: 'XML Resources & Layouts' },
    { id: 'doc', label: 'Documentation & Guides' }
  ];

  return (
    <div className="border border-slate-800 bg-slate-900/60 rounded-xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
      {/* File Tree Navigation Sidebar (4 cols) */}
      <div className="lg:col-span-4 border-r border-slate-800 bg-slate-950/70 p-4 flex flex-col">
        <div className="pb-3 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-400" />
              Project Files ({ANDROID_PROJECT_FILES.length})
            </span>
            <span className="text-[10px] font-mono text-slate-400">Android 15 / API 35</span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter files or symbols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Categorized File List */}
        <div className="flex-1 overflow-y-auto pt-3 space-y-4">
          {categories.map((cat) => {
            const filesInCat = filteredFiles.filter((f) => f.category === cat.id);
            if (filesInCat.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 tracking-wider">
                  {cat.label}
                </div>
                <div className="space-y-0.5">
                  {filesInCat.map((file) => {
                    const isSelected = selectedFile.path === file.path;
                    return (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-600 text-white font-medium shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <span className="truncate">{file.name}</span>
                        <span
                          className={`text-[10px] uppercase tracking-wider shrink-0 ml-2 ${
                            isSelected ? 'text-blue-200' : 'text-slate-600'
                          }`}
                        >
                          {file.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Code Viewer Panel (8 cols) */}
      <div className="lg:col-span-8 flex flex-col bg-slate-950">
        {/* File Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-sm font-semibold text-white font-mono truncate">
                {selectedFile.path}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">{selectedFile.description}</p>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-750 transition-colors whitespace-nowrap shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy File</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content with Line Numbers */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 font-mono text-xs leading-relaxed max-h-[600px] bg-slate-950 text-slate-300">
          <pre className="tab-4">
            <code>
              {selectedFile.content.split('\n').map((line, index) => (
                <div key={index} className="flex hover:bg-slate-900/50 -mx-4 px-4 py-0.5">
                  <span className="w-10 select-none text-slate-600 text-right pr-4 shrink-0 tabular-nums">
                    {index + 1}
                  </span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
