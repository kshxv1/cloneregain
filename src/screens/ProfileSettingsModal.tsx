import React, { useState } from 'react';
import {
  X,
  Flame,
  Clock,
  Award,
  Sparkles,
  Shield,
  Download,
  RotateCcw,
  Palette,
  Moon,
  Sun,
  Lock,
  Check,
  ChevronRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { nativeBridge } from '../services/NativeBridge';

export const ProfileSettingsModal: React.FC = () => {
  const {
    showProfileModal,
    setShowProfileModal,
    profile,
    updateProfile,
    theme,
    setTheme,
    accentTheme,
    setAccentTheme,
    clearAllData,
    loadDemoSeedData,
    openPaywall,
    sessions,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [isEditingName, setIsEditingName] = useState(false);
  const [userName, setUserName] = useState(profile.name);

  if (!showProfileModal) return null;

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ profile, sessions }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `stillwater_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSaveName = () => {
    if (userName.trim()) {
      updateProfile({
        name: userName.trim(),
        avatarInitial: userName.trim().charAt(0).toUpperCase(),
      });
    }
    setIsEditingName(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#141925] border border-[#273049] rounded-t-[32px] sm:rounded-[32px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-[#273049]/60">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                activeTab === 'profile'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-ink)]'
                  : 'text-[#8B95AD] hover:text-white'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-ink)]'
                  : 'text-[#8B95AD] hover:text-white'
              }`}
            >
              Settings
            </button>
          </div>

          <button
            onClick={() => setShowProfileModal(false)}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8B95AD] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* ================= TAB 1: PROFILE ================= */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="bg-[#1C2333]/70 border border-[#273049] rounded-[24px] p-5 flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-2xl text-[var(--color-primary-ink)] shadow-lg"
                  style={{ backgroundColor: profile.avatarColor }}
                >
                  {profile.avatarInitial}
                </div>

                <div className="flex-1 min-w-0">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="bg-[#141925] border border-[var(--color-primary)] rounded-lg px-2 py-1 text-sm font-bold text-white w-full"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      />
                      <button
                        onClick={handleSaveName}
                        className="text-xs font-bold text-[var(--color-primary)]"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-left group"
                    >
                      <h3 className="text-lg font-bold font-display text-[#F2F5FA] group-hover:text-[var(--color-primary)] truncate">
                        {profile.name}
                      </h3>
                      <span className="text-xs text-[#8B95AD]">Tap to edit name</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">
                      Stillness Scholar
                    </span>
                    {profile.isPlus && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 uppercase">
                        PLUS
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1C2333]/50 border border-[#273049] rounded-2xl p-4">
                  <span className="text-xs text-[#8B95AD] block font-medium flex items-center gap-1.5">
                    <Flame size={14} className="text-amber-400" />
                    Focus Streak
                  </span>
                  <div className="text-2xl font-bold font-display text-[#F2F5FA] mt-1">
                    {profile.streak} <span className="text-xs text-[#8B95AD]">days</span>
                  </div>
                  <span className="text-[11px] text-amber-400">Best: {profile.longestStreak} days</span>
                </div>

                <div className="bg-[#1C2333]/50 border border-[#273049] rounded-2xl p-4">
                  <span className="text-xs text-[#8B95AD] block font-medium flex items-center gap-1.5">
                    <Clock size={14} className="text-[var(--color-primary)]" />
                    Total Focus
                  </span>
                  <div className="text-2xl font-bold font-display text-[#F2F5FA] mt-1">
                    {profile.totalHours} <span className="text-xs text-[#8B95AD]">hrs</span>
                  </div>
                  <span className="text-[11px] text-emerald-400">Top 5% student rank</span>
                </div>
              </div>

              {/* Badges Collection */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#F2F5FA] uppercase tracking-wider block">
                  Achievements & Badges
                </span>

                <div className="grid grid-cols-1 gap-2.5">
                  {profile.badges.map(b => (
                    <div
                      key={b.id}
                      className={`p-3.5 rounded-2xl border flex items-center gap-3.5 ${
                        b.unlocked
                          ? 'bg-[#1C2333]/60 border-[#273049]'
                          : 'bg-[#141925]/30 border-[#273049]/30 opacity-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        b.unlocked ? 'bg-amber-400/20 text-amber-400' : 'bg-white/5 text-[#8B95AD]'
                      }`}>
                        <Award size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#F2F5FA]">
                            {b.title}
                          </span>
                          {b.unlocked && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 uppercase">
                              Unlocked
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#8B95AD] truncate">
                          {b.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: SETTINGS ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Theme Settings */}
              <div className="bg-[#1C2333]/60 border border-[#273049] rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-[#F2F5FA] uppercase tracking-wider block">
                  Appearance
                </span>

                {/* Dark / Light / System */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#141925] rounded-xl border border-[#273049]">
                  {(['dark', 'light', 'system'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setTheme(m)}
                      className={`py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                        theme === m ? 'bg-[#1C2333] text-white font-bold' : 'text-[#8B95AD]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Accent Colors: Aqua, Violet, Sunset (Plus) */}
                <div className="pt-2">
                  <span className="text-[11px] text-[#8B95AD] block mb-2">Accent Theme:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setAccentTheme('aqua')}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                        accentTheme === 'aqua' ? 'border-[#5EEAD4] bg-[#5EEAD4]/10 text-white' : 'border-[#273049] text-[#8B95AD]'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-[#5EEAD4]" />
                      <span>Aqua</span>
                    </button>

                    <button
                      onClick={() => setAccentTheme('violet')}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                        accentTheme === 'violet' ? 'border-[#A78BFA] bg-[#A78BFA]/10 text-white' : 'border-[#273049] text-[#8B95AD]'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-[#A78BFA]" />
                      <span>Violet</span>
                    </button>

                    <button
                      onClick={() => setAccentTheme('sunset')}
                      className={`p-2 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                        accentTheme === 'sunset' ? 'border-[#FB923C] bg-[#FB923C]/10 text-white' : 'border-[#273049] text-[#8B95AD]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#FB923C]" />
                        <span>Sunset</span>
                      </div>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">
                        Free
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Strict Mode Safety: Emergency Exit */}
              <div className="bg-[#1C2333]/60 border border-[#273049] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#F2F5FA] block">
                    Allow Emergency Exit (5s Hold)
                  </span>
                  <span className="text-[11px] text-[#8B95AD] block">
                    If disabled, strictly nothing can end the session early
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.emergencyExitAllowed}
                  onChange={(e) => updateProfile({ emergencyExitAllowed: e.target.checked })}
                  className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer"
                />
              </div>

              {/* Data & Privacy */}
              <div className="bg-[#1C2333]/60 border border-[#273049] rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-[#F2F5FA] uppercase tracking-wider block">
                  Data & Backup
                </span>

                <button
                  onClick={handleExportData}
                  className="w-full py-2.5 px-3 bg-[#141925] border border-[#273049] rounded-xl text-xs font-semibold text-[#F2F5FA] flex items-center justify-between hover:border-[var(--color-primary)]"
                >
                  <span className="flex items-center gap-2">
                    <Download size={14} />
                    Export Study History (JSON)
                  </span>
                  <ChevronRight size={14} className="text-[#8B95AD]" />
                </button>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={loadDemoSeedData}
                    className="flex-1 py-2 rounded-xl bg-[#141925] border border-[#273049] text-xs text-[#8B95AD] hover:text-white"
                  >
                    Reload Demo Data
                  </button>
                  <button
                    onClick={clearAllData}
                    className="flex-1 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 hover:bg-rose-500/20"
                  >
                    Clear All Data
                  </button>
                </div>
              </div>

              {/* Privacy Notice Card */}
              <div className="p-4 bg-[#0B0E14]/70 border border-[#273049]/60 rounded-2xl flex items-start gap-3">
                <ShieldCheck size={18} className="text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#F2F5FA]">
                    Privacy First Architecture
                  </h4>
                  <p className="text-[11px] text-[#8B95AD] mt-0.5 leading-relaxed">
                    Stillwater processes device usage, foreground applications, and study logs strictly on-device. No personal browsing activity or passwords ever leave your phone.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Plus Banner */}
        <div className="p-4 border-t border-[#273049] bg-[#141925]">
          <button
            onClick={() => openPaywall('Stillwater Plus')}
            className="w-full py-3 bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 font-bold text-xs rounded-full flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            <Sparkles size={14} />
            <span>All Pro Features Active (100% Free)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
