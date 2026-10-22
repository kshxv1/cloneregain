import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  HelpCircle,
  Video,
  Globe,
  Lock,
  Smartphone,
  ExternalLink,
  Check,
  SplitSquareVertical,
  Layers,
  BellOff,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { AppLimit, InstalledApp } from '../types';
import { MOCK_INSTALLED_APPS, nativeBridge } from '../services/NativeBridge';
import { AppPickerModal } from '../components/AppPickerModal';

export const LimitsScreen: React.FC = () => {
  const {
    appLimits,
    saveAppLimit,
    deleteAppLimit,
    blockConfig,
    updateBlockConfig,
    profile,
    openPaywall,
  } = useApp();

  const [isAppPickerOpen, setIsAppPickerOpen] = useState(false);
  const [editingLimit, setEditingLimit] = useState<{ appId: string; minutes: number; strict: boolean } | null>(null);
  const [showWebsiteModal, setShowWebsiteModal] = useState(false);
  const [newSiteUrl, setNewSiteUrl] = useState('');

  const getAppName = (appId: string) => {
    return MOCK_INSTALLED_APPS.find(a => a.id === appId)?.name || appId;
  };

  const getAppIconBg = (appId: string) => {
    return MOCK_INSTALLED_APPS.find(a => a.id === appId)?.iconBg || 'from-indigo-500 to-purple-600';
  };

  const formatLimitMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m Limit`;
    if (m === 0) return `${h}h Limit`;
    return `${h}h ${m}m Limit`;
  };

  const handleToggleShorts = (type: 'video' | 'reels' | 'spotlight') => {
    nativeBridge.triggerHaptic('medium');
    updateBlockConfig(prev => ({
      ...prev,
      shorts: {
        ...prev.shorts,
        [type]: !prev.shorts[type],
      }
    }));
  };

  const handleToggleProtection = (key: keyof typeof blockConfig.protections) => {
    nativeBridge.triggerHaptic('medium');
    updateBlockConfig(prev => ({
      ...prev,
      protections: {
        ...prev.protections,
        [key]: !prev.protections[key],
      }
    }));
  };

  const handleAddWebsite = () => {
    if (!newSiteUrl.trim()) return;
    const cleanUrl = newSiteUrl.trim().toLowerCase().replace(/^https?:\/\//, '');
    updateBlockConfig(prev => ({
      ...prev,
      websites: [...prev.websites, cleanUrl]
    }));
    setNewSiteUrl('');
  };

  const handleRemoveWebsite = (url: string) => {
    updateBlockConfig(prev => ({
      ...prev,
      websites: prev.websites.filter(w => w !== url)
    }));
  };

  return (
    <div className="min-h-screen pb-32 pt-5 px-5 max-w-md mx-auto select-none space-y-6">
      {/* Top Header matching reference screenshot #3: Blocks & Help */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-2xl font-bold font-display text-[#F2F5FA]">
          Blocks
        </h2>
        <button
          onClick={() => alert('Stillwater Block Engine intercepts distracting launch intents and accessibility view hierarchy changes locally on device.')}
          className="flex items-center gap-1.5 text-xs text-[#8B95AD] bg-[#141925] border border-[#273049] px-3 py-1.5 rounded-full hover:text-white"
        >
          <HelpCircle size={14} />
          <span>Help</span>
        </button>
      </div>

      {/* 1. App Limits Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#F2F5FA]">
            App Limits
          </span>
          <button
            onClick={() => setIsAppPickerOpen(true)}
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Plus size={14} />
            <span>Add App</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {appLimits.map(limit => {
            const name = getAppName(limit.appId);
            const iconBg = getAppIconBg(limit.appId);
            return (
              <div
                key={limit.appId}
                className="bg-[#141925] border border-[#273049] rounded-[22px] p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${iconBg} flex items-center justify-center text-white shadow-md`}>
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#F2F5FA] block">
                      {name}
                    </span>
                    <span className="text-xs text-[#8B95AD]">
                      {formatLimitMinutes(limit.dailyMin)}
                      {limit.strict && ' • Strict'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setEditingLimit({ appId: limit.appId, minutes: limit.dailyMin, strict: limit.strict })}
                  className="px-3.5 py-1.5 rounded-full bg-[#1C2333] border border-[#273049] text-xs font-semibold text-[#F2F5FA] hover:border-[var(--color-primary)] active:scale-95"
                >
                  Edit
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Block Shorts Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#F2F5FA]">
            Block Shorts & Reels
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
            Active
          </span>
        </div>

        <div className="space-y-2">
          {/* YouTube Shorts equivalent */}
          <div className="bg-[#141925] border border-[#273049] rounded-[22px] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
                <Video size={18} />
              </div>
              <div>
                <span className="text-sm font-semibold text-[#F2F5FA] block">
                  ClipTube Shorts
                </span>
                <span className="text-[11px] text-[#8B95AD]">
                  Mutes short-video feed while keeping longform intact
                </span>
              </div>
            </div>

            <button
              onClick={() => handleToggleShorts('video')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                blockConfig.shorts.video
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-[#1C2333] border border-[#273049] text-[#8B95AD] hover:text-white'
              }`}
            >
              {blockConfig.shorts.video ? 'Blocked' : '+ Block'}
            </button>
          </div>

          {/* IG Reels equivalent */}
          <div className="bg-[#141925] border border-[#273049] rounded-[22px] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Video size={18} />
              </div>
              <div>
                <span className="text-sm font-semibold text-[#F2F5FA] block">
                  ByteGram Reels
                </span>
                <span className="text-[11px] text-[#8B95AD]">
                  Blocks infinite vertical doom-scroll
                </span>
              </div>
            </div>

            <button
              onClick={() => handleToggleShorts('reels')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                blockConfig.shorts.reels
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-[#1C2333] border border-[#273049] text-[#8B95AD] hover:text-white'
              }`}
            >
              {blockConfig.shorts.reels ? 'Blocked' : '+ Block'}
            </button>
          </div>

          {/* Snapchat Spotlight equivalent */}
          <div className="bg-[#141925] border border-[#273049] rounded-[22px] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-neutral-950 shadow-md">
                <Video size={18} />
              </div>
              <div>
                <span className="text-sm font-semibold text-[#F2F5FA] block">
                  Snapline Spotlight
                </span>
                <span className="text-[11px] text-[#8B95AD]">
                  Hides algorithm discovery stories
                </span>
              </div>
            </div>

            <button
              onClick={() => handleToggleShorts('spotlight')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                blockConfig.shorts.spotlight
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-[#1C2333] border border-[#273049] text-[#8B95AD] hover:text-white'
              }`}
            >
              {blockConfig.shorts.spotlight ? 'Blocked' : '+ Block'}
            </button>
          </div>
        </div>

        <p className="text-[10px] text-[#8B95AD] px-1">
          // Native bridge: Android AccessibilityService view inspection active
        </p>
      </div>

      {/* 3. Other Blocks */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#F2F5FA]">
            Other Blocks
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
            Unlocked
          </span>
        </div>

        <div className="bg-[#141925] border border-[#273049] rounded-[22px] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shadow-md">
              <Globe size={18} />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#F2F5FA] block">
                Block Websites
              </span>
              <span className="text-[11px] text-[#8B95AD]">
                {blockConfig.websites.length} custom domains & explicit content
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowWebsiteModal(true)}
            className="px-3.5 py-1.5 rounded-full bg-[#1C2333] border border-[#273049] text-xs font-semibold text-[#F2F5FA] hover:border-[var(--color-primary)] active:scale-95"
          >
            Manage
          </button>
        </div>
      </div>

      {/* 4. Strict Mode Protections */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#F2F5FA]">
            Strict Mode Protections
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
            Unlocked
          </span>
        </div>

        <div className="bg-[#141925] border border-[#273049] rounded-[24px] divide-y divide-[#273049]/50 overflow-hidden">
          {/* Block uninstall */}
          <div className="p-4 flex items-center justify-between">
            <div className="pr-3">
              <span className="text-sm font-semibold text-[#F2F5FA] block">
                Block Stillwater app uninstall
              </span>
              <span className="text-[11px] text-[#8B95AD] block">
                Cannot uninstall or log out during locked study sessions
              </span>
            </div>
            <div
              onClick={() => handleToggleProtection('uninstall')}
              className={`w-12 h-7 rounded-full p-1 cursor-pointer shrink-0 transition-colors ${
                blockConfig.protections.uninstall ? 'bg-emerald-400' : 'bg-[#273049]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-neutral-950 shadow-md transform transition-transform ${
                  blockConfig.protections.uninstall ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Block split screen */}
          <div className="p-4 flex items-center justify-between">
            <div className="pr-3">
              <span className="text-sm font-semibold text-[#F2F5FA] block">
                Block split screen
              </span>
              <span className="text-[11px] text-[#8B95AD] block">
                Cannot use blocked apps in Android split screen
              </span>
            </div>
            <div
              onClick={() => handleToggleProtection('splitScreen')}
              className={`w-12 h-7 rounded-full p-1 cursor-pointer shrink-0 transition-colors ${
                blockConfig.protections.splitScreen ? 'bg-emerald-400' : 'bg-[#273049]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-neutral-950 shadow-md transform transition-transform ${
                  blockConfig.protections.splitScreen ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Block floating window */}
          <div className="p-4 flex items-center justify-between">
            <div className="pr-3">
              <span className="text-sm font-semibold text-[#F2F5FA] block">
                Block floating window
              </span>
              <span className="text-[11px] text-[#8B95AD] block">
                Cannot open picture-in-picture or bubble overlays
              </span>
            </div>
            <div
              onClick={() => handleToggleProtection('floating')}
              className={`w-12 h-7 rounded-full p-1 cursor-pointer shrink-0 transition-colors ${
                blockConfig.protections.floating ? 'bg-emerald-400' : 'bg-[#273049]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-neutral-950 shadow-md transform transition-transform ${
                  blockConfig.protections.floating ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Block notifications */}
          <div className="p-4 flex items-center justify-between">
            <div className="pr-3">
              <span className="text-sm font-semibold text-[#F2F5FA] block">
                Block notifications
              </span>
              <span className="text-[11px] text-[#8B95AD] block">
                Silence alerts & heads-up banners from blocked apps
              </span>
            </div>
            <div
              onClick={() => handleToggleProtection('notifications')}
              className={`w-12 h-7 rounded-full p-1 cursor-pointer shrink-0 transition-colors ${
                blockConfig.protections.notifications ? 'bg-emerald-400' : 'bg-[#273049]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-neutral-950 shadow-md transform transition-transform ${
                  blockConfig.protections.notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit App Limit Modal */}
      {editingLimit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-[#141925] border border-[#273049] rounded-3xl p-5 shadow-2xl space-y-4">
            <h4 className="text-base font-bold font-display text-[#F2F5FA]">
              Daily Limit: {getAppName(editingLimit.appId)}
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#8B95AD]">Allowed Time</span>
                <span className="text-[var(--color-primary)] font-display text-base">
                  {formatLimitMinutes(editingLimit.minutes)}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="240"
                step="5"
                value={editingLimit.minutes}
                onChange={(e) => setEditingLimit({ ...editingLimit, minutes: parseInt(e.target.value) })}
                className="w-full accent-[var(--color-primary)] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between bg-[#1C2333] p-3 rounded-2xl border border-[#273049]">
              <span className="text-xs text-[#F2F5FA] font-medium">Strict lock (cannot extend today)</span>
              <input
                type="checkbox"
                checked={editingLimit.strict}
                onChange={(e) => setEditingLimit({ ...editingLimit, strict: e.target.checked })}
                className="w-4 h-4 accent-[var(--color-primary)]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  deleteAppLimit(editingLimit.appId);
                  setEditingLimit(null);
                }}
                className="px-3 py-2.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold hover:bg-rose-500/20"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  saveAppLimit({
                    appId: editingLimit.appId,
                    dailyMin: editingLimit.minutes,
                    days: [0, 1, 2, 3, 4, 5, 6],
                    strict: editingLimit.strict,
                  });
                  setEditingLimit(null);
                }}
                className="flex-1 py-2.5 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-ink)] text-xs font-bold shadow-md"
              >
                Save Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Website Blocker Modal */}
      {showWebsiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#141925] border border-[#273049] rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <h4 className="text-base font-bold font-display text-[#F2F5FA]">
              Blocked Websites & Domains
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSiteUrl}
                onChange={(e) => setNewSiteUrl(e.target.value)}
                placeholder="domain.com (e.g. twitter.com)"
                className="flex-1 bg-[#1C2333] border border-[#273049] rounded-xl px-3 py-2 text-xs text-[#F2F5FA] focus:outline-none focus:border-[var(--color-primary)]"
              />
              <button
                onClick={handleAddWebsite}
                className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-ink)] font-bold text-xs rounded-xl"
              >
                Add
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {blockConfig.websites.map(site => (
                <div key={site} className="flex items-center justify-between p-2.5 bg-[#1C2333]/60 rounded-xl border border-[#273049]/60">
                  <span className="text-xs text-[#F2F5FA]">{site}</span>
                  <button
                    onClick={() => handleRemoveWebsite(site)}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowWebsiteModal(false)}
              className="w-full py-2.5 bg-[#1C2333] hover:bg-[#273049] text-xs font-semibold text-[#F2F5FA] rounded-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* App Picker */}
      <AppPickerModal
        isOpen={isAppPickerOpen}
        onClose={() => setIsAppPickerOpen(false)}
        selectedAppIds={appLimits.map(a => a.appId)}
        onConfirm={(ids) => {
          ids.forEach(id => {
            if (!appLimits.some(a => a.appId === id)) {
              saveAppLimit({
                appId: id,
                dailyMin: 45,
                days: [0, 1, 2, 3, 4, 5, 6],
                strict: false,
              });
            }
          });
        }}
        title="Add App Limit"
      />
    </div>
  );
};
