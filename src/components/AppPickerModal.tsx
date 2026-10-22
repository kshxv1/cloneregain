import React, { useState, useEffect } from 'react';
import { X, Search, Check, Smartphone } from 'lucide-react';
import { InstalledApp } from '../types';
import { nativeBridge } from '../services/NativeBridge';

interface AppPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAppIds: string[];
  onConfirm: (selectedIds: string[]) => void;
  title?: string;
  isSingleSelect?: boolean;
}

export const AppPickerModal: React.FC<AppPickerModalProps> = ({
  isOpen,
  onClose,
  selectedAppIds,
  onConfirm,
  title = 'Select Apps',
  isSingleSelect = false,
}) => {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>(selectedAppIds);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    nativeBridge.getInstalledApps().then(setApps);
  }, []);

  useEffect(() => {
    setSelected(selectedAppIds);
  }, [selectedAppIds, isOpen]);

  if (!isOpen) return null;

  const categories = ['all', 'social', 'video', 'gaming', 'work', 'utility'];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'all' || app.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const toggleApp = (id: string) => {
    nativeBridge.triggerHaptic('light');
    if (isSingleSelect) {
      setSelected([id]);
      return;
    }
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSelectAllDistractions = () => {
    const distractions = apps.filter(a => a.isDistraction).map(a => a.id);
    setSelected(Array.from(new Set([...selected, ...distractions])));
    nativeBridge.triggerHaptic('medium');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#141925] border border-[#273049] rounded-t-[32px] sm:rounded-[32px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#273049] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#F2F5FA] font-display">
              {title}
            </h3>
            <p className="text-xs text-[#8B95AD]">
              {selected.length} {selected.length === 1 ? 'app' : 'apps'} selected
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8B95AD] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & filters */}
        <div className="p-4 space-y-3 border-b border-[#273049]/60 bg-[#0B0E14]/40">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B95AD]" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apps..."
              className="w-full bg-[#1C2333] border border-[#273049] rounded-2xl pl-10 pr-4 py-2 text-sm text-[#F2F5FA] placeholder-[#8B95AD] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs capitalize whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-ink)] font-semibold'
                    : 'bg-[#1C2333] text-[#8B95AD] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {!isSingleSelect && (
            <div className="flex justify-between items-center text-xs pt-1">
              <button
                onClick={handleSelectAllDistractions}
                className="text-[var(--color-primary)] hover:underline font-medium"
              >
                + Select all distractions
              </button>
              {selected.length > 0 && (
                <button
                  onClick={() => setSelected([])}
                  className="text-[#8B95AD] hover:text-white"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Apps list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredApps.map(app => {
            const isChecked = selected.includes(app.id);
            return (
              <div
                key={app.id}
                onClick={() => toggleApp(app.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/50'
                    : 'bg-[#1C2333]/60 border-[#273049]/60 hover:border-[#273049]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.iconBg} flex items-center justify-center text-white shadow-md`}>
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[#F2F5FA] block">
                      {app.name}
                    </span>
                    <span className="text-xs text-[#8B95AD] capitalize">
                      {app.category} • ~{app.dailyUsageMin}m/day
                    </span>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isChecked
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-primary-ink)]'
                      : 'border-[#273049] bg-transparent'
                  }`}
                >
                  {isChecked && <Check size={14} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#273049] bg-[#141925]">
          <button
            onClick={() => {
              onConfirm(selected);
              onClose();
            }}
            className="w-full py-3.5 bg-[var(--color-primary)] text-[var(--color-primary-ink)] font-bold text-sm rounded-full transition-transform active:scale-95 shadow-lg"
          >
            Confirm ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
};
