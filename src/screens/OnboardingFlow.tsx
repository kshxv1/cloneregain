import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  Shield,
  Layers,
  Accessibility,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Logo } from '../components/Logo';
import { MOCK_INSTALLED_APPS, nativeBridge } from '../services/NativeBridge';

export const OnboardingFlow: React.FC = () => {
  const { profile, updateProfile, goals, updateGoals, saveAppLimit } = useApp();
  const [step, setStep] = useState(1);

  // Step 2: Goal
  const [dailyHours, setDailyHours] = useState(goals.dailyMin / 60 || 6);

  // Step 3: Pick distractions
  const [selectedApps, setSelectedApps] = useState<string[]>([
    'app_bytegram',
    'app_cliptube',
    'app_snapline',
    'app_tokscroll',
  ]);

  // Step 4: Permissions state
  const [perms, setPerms] = useState({
    usage: true,
    overlay: true,
    accessibility: true,
  });

  // Step 5: Name & Avatar Color
  const [name, setName] = useState(profile.name || 'Kai');
  const [selectedColor, setSelectedColor] = useState('#5EEAD4');

  const avatarColors = ['#5EEAD4', '#A78BFA', '#38BDF8', '#FBBF24', '#F43F5E', '#34D399'];

  const handleNext = () => {
    nativeBridge.triggerHaptic('light');
    if (step < 5) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    // Save goals
    updateGoals({
      dailyMin: Math.round(dailyHours * 60),
      weeklyMin: Math.round(dailyHours * 5 * 60),
    });

    // Save app limits
    selectedApps.forEach(appId => {
      saveAppLimit({
        appId,
        dailyMin: 45,
        days: [0, 1, 2, 3, 4, 5, 6],
        strict: true,
      });
    });

    // Update profile
    updateProfile({
      name: name.trim() || 'Student',
      avatarInitial: (name.trim() || 'S').charAt(0).toUpperCase(),
      avatarColor: selectedColor,
      onboarded: true,
    });

    nativeBridge.triggerHaptic('success');
  };

  const toggleApp = (id: string) => {
    if (selectedApps.includes(id)) {
      setSelectedApps(selectedApps.filter(a => a !== id));
    } else {
      setSelectedApps([...selectedApps, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0E14] text-[#F2F5FA] flex flex-col justify-between p-6 max-w-md mx-auto select-none animate-in fade-in duration-300">
      {/* Top progress indicator */}
      <div className="flex items-center justify-between pt-2">
        <Logo size={28} showText={true} />
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s ? 'w-6 bg-[var(--color-primary)]' : step > s ? 'w-2 bg-[var(--color-primary)]/50' : 'w-2 bg-[#273049]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Center Body */}
      <div className="my-auto py-4">
        {/* ================= STEP 1: WELCOME ================= */}
        {step === 1 && (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 flex items-center justify-center shadow-2xl relative">
              <div className="w-16 h-16 rounded-full border border-[var(--color-primary)]/40 animate-water-pulse absolute" />
              <Logo size={48} />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold font-display text-[#F2F5FA] leading-tight">
                Quiet the Noise.<br />Find Stillness.
              </h1>
              <p className="text-sm text-[#8B95AD] max-w-xs mx-auto leading-relaxed">
                Reclaim your deep attention from endless algorithmic loops through locked study blocks and smart app limits.
              </p>
            </div>
          </div>
        )}

        {/* ================= STEP 2: FOCUS GOAL ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                Step 2 of 5
              </span>
              <h2 className="text-2xl font-bold font-display text-[#F2F5FA] mt-1">
                Set Your Daily Focus Target
              </h2>
              <p className="text-xs text-[#8B95AD] mt-1">
                How many hours do you want to devote to deep, uninterrupted study each day?
              </p>
            </div>

            <div className="bg-[#141925] border border-[#273049] rounded-3xl p-6 text-center space-y-4">
              <div className="text-5xl font-bold font-display text-[var(--color-primary)] tabular-nums">
                {dailyHours}<span className="text-xl text-[#8B95AD]">h / day</span>
              </div>
              <p className="text-xs text-[#8B95AD]">
                Weekly target: {Math.round(dailyHours * 5)} hours across 5 study days
              </p>

              <input
                type="range"
                min="1"
                max="12"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full accent-[var(--color-primary)] cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-[#8B95AD]">
                <span>1 hr</span>
                <span>6 hrs (recommended)</span>
                <span>12 hrs</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PICK DISTRACTIONS ================= */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                Step 3 of 5
              </span>
              <h2 className="text-2xl font-bold font-display text-[#F2F5FA] mt-1">
                Select Your Distractions
              </h2>
              <p className="text-xs text-[#8B95AD] mt-1">
                Choose the apps that tempt you most when you try to sit down and study.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-[46vh] overflow-y-auto pr-1">
              {MOCK_INSTALLED_APPS.filter(a => a.isDistraction).map(app => {
                const isSelected = selectedApps.includes(app.id);
                return (
                  <div
                    key={app.id}
                    onClick={() => toggleApp(app.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[var(--color-primary)]/15 border-[var(--color-primary)]/60'
                        : 'bg-[#141925] border-[#273049]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${app.iconBg} flex items-center justify-center text-white shrink-0`}>
                        <Smartphone size={15} />
                      </div>
                      <span className="text-xs font-bold text-[#F2F5FA] truncate">
                        {app.name}
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                        isSelected
                          ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-primary-ink)]'
                          : 'border-[#273049]'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 4: PERMISSIONS EXPLAINER ================= */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                Step 4 of 5
              </span>
              <h2 className="text-2xl font-bold font-display text-[#F2F5FA] mt-1">
                Required Permissions
              </h2>
              <p className="text-xs text-[#8B95AD] mt-1">
                Stillwater relies on Android accessibility & usage APIs to protect your study blocks.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Usage access */}
              <div className="p-3.5 bg-[#141925] border border-[#273049] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
                    <Shield size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#F2F5FA] block">Usage Access</span>
                    <span className="text-[10px] text-[#8B95AD] block">Measures accurate screen time</span>
                  </div>
                </div>
                <button
                  onClick={() => setPerms(p => ({ ...p, usage: !p.usage }))}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    perms.usage ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#1C2333] text-[#8B95AD]'
                  }`}
                >
                  {perms.usage ? 'Granted' : 'Grant'}
                </button>
              </div>

              {/* Display over other apps */}
              <div className="p-3.5 bg-[#141925] border border-[#273049] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                    <Layers size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#F2F5FA] block">Display Over Apps</span>
                    <span className="text-[10px] text-[#8B95AD] block">Draws calm blocking overlay</span>
                  </div>
                </div>
                <button
                  onClick={() => setPerms(p => ({ ...p, overlay: !p.overlay }))}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    perms.overlay ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#1C2333] text-[#8B95AD]'
                  }`}
                >
                  {perms.overlay ? 'Granted' : 'Grant'}
                </button>
              </div>

              {/* Accessibility */}
              <div className="p-3.5 bg-[#141925] border border-[#273049] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <Accessibility size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#F2F5FA] block">Accessibility Service</span>
                    <span className="text-[10px] text-[#8B95AD] block">Mutes short-video surfaces</span>
                  </div>
                </div>
                <button
                  onClick={() => setPerms(p => ({ ...p, accessibility: !p.accessibility }))}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    perms.accessibility ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#1C2333] text-[#8B95AD]'
                  }`}
                >
                  {perms.accessibility ? 'Granted' : 'Grant'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: PROFILE & FINISH ================= */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                Step 5 of 5
              </span>
              <h2 className="text-2xl font-bold font-display text-[#F2F5FA] mt-1">
                Customize Your Avatar
              </h2>
              <p className="text-xs text-[#8B95AD] mt-1">
                This appears in study rooms and on your daily stats.
              </p>
            </div>

            <div className="bg-[#141925] border border-[#273049] rounded-3xl p-6 text-center space-y-4">
              <div
                className="w-20 h-20 mx-auto rounded-full font-display font-bold text-3xl text-neutral-950 flex items-center justify-center shadow-xl transition-all"
                style={{ backgroundColor: selectedColor }}
              >
                {(name.trim() || 'S').charAt(0).toUpperCase()}
              </div>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-[#1C2333] border border-[#273049] rounded-2xl px-4 py-2.5 text-sm text-center text-[#F2F5FA] focus:outline-none focus:border-[var(--color-primary)]"
              />

              <div className="flex justify-center gap-2 pt-1">
                {avatarColors.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      selectedColor === c ? 'scale-125 border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="space-y-2">
        <button
          onClick={handleNext}
          className="w-full py-4 bg-white text-neutral-950 font-bold text-base rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <span>{step === 1 ? 'Get Started' : step === 5 ? 'Enter Stillwater' : 'Continue'}</span>
          <ArrowRight size={18} />
        </button>

        {step > 1 && step < 5 && (
          <button
            onClick={finishOnboarding}
            className="w-full py-2 text-xs text-[#8B95AD] hover:text-white text-center"
          >
            Skip setup & continue as guest
          </button>
        )}
      </div>
    </div>
  );
};
