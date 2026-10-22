import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  Sliders,
  Lock,
  Video,
  Globe,
  BellOff,
  CalendarDays,
  Headphones,
  Palette,
  SplitSquareVertical,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../store/AppContext';

export const PaywallModal: React.FC = () => {
  const { showPaywallModal, setShowPaywallModal, paywallFeature, profile, togglePlus } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');

  if (!showPaywallModal) return null;

  const features = [
    { icon: Sliders, title: 'Pomodoro Presets', desc: 'Custom work/rest intervals & cycles' },
    { icon: Lock, title: 'Unbreakable Strict Mode', desc: 'Emergency timer lock prevents impulsive exits' },
    { icon: Video, title: 'Block Shorts & Reels', desc: 'Surgically mute short-video feeds inside apps' },
    { icon: Globe, title: 'Block Websites & Adult Content', desc: 'Block distracting URLs and explicit domains' },
    { icon: BellOff, title: 'Block App Notifications', desc: 'Silence notification pings during focus sessions' },
    { icon: CalendarDays, title: 'Unlimited Study Schedules', desc: 'Create custom routines for every day of the week' },
    { icon: ShieldCheck, title: 'Uninstall & Tamper Protection', desc: 'Prevent disabling or removing Stillwater in study mode' },
    { icon: SplitSquareVertical, title: 'Block Split Screen & Floating Windows', desc: 'Close Android multitasking bypasses' },
    { icon: Headphones, title: 'Science-backed Focus Soundscapes', desc: 'Procedural brown noise, rain, and binaural drones' },
    { icon: Palette, title: 'Premium Themes & Accents', desc: 'Unlock Sunset Gold and custom interface palettes' },
  ];

  const handleUpgrade = () => {
    // In preview, immediately toggle Plus so user can test all features
    togglePlus();
    setShowPaywallModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#141925] border border-[#273049] rounded-t-[32px] sm:rounded-[32px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-[#273049]/60">
          <button
            onClick={() => setShowPaywallModal(false)}
            aria-label="Back"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8B95AD] hover:text-white"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-1 text-xs text-[#8B95AD] bg-white/5 px-3 py-1 rounded-full">
            <HelpCircle size={14} />
            <span>Need help?</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Banner */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 mb-1">
              <Sparkles size={24} />
            </div>
            <h2 className="text-2xl font-bold font-display text-[#F2F5FA]">
              All Features <span className="text-emerald-400">100% Free</span>
            </h2>
            <p className="text-xs text-[#8B95AD] max-w-xs mx-auto">
              Unlimited study schedules, short-video blocking, strict protections, and ambient audio are completely unlocked for all students.
            </p>
          </div>

          {/* Pricing cards - Free highlight */}
          <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-center space-y-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Permanent Free Access
            </span>
            <div className="text-3xl font-bold font-display text-[#F2F5FA]">
              $0.00 <span className="text-xs text-[#8B95AD]">/ forever</span>
            </div>
            <p className="text-[11px] text-[#8B95AD]">
              No subscriptions, no hidden limits, no paywalls.
            </p>
          </div>

          {/* Features list */}
          <div className="bg-[#0B0E14]/60 border border-[#273049]/60 rounded-2xl divide-y divide-[#273049]/40">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-3.5 p-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-[#F2F5FA] block truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-[#8B95AD] block truncate">
                      {item.desc}
                    </span>
                  </div>
                  <Check size={16} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-[#273049] bg-[#141925]">
          <button
            onClick={() => setShowPaywallModal(false)}
            className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold text-sm rounded-full transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            <span>Enjoy Full Unrestricted Access</span>
          </button>
        </div>
      </div>
    </div>
  );
};
