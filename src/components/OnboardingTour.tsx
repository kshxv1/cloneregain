import React from 'react';
import { useApp } from '../store/AppContext';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export const OnboardingTour: React.FC = () => {
  const { tourStep, setTourStep, dismissTour } = useApp();

  if (tourStep === 0) return null;

  const tourData = [
    {
      step: 1,
      title: 'Your Stillness Ring',
      text: 'Visualizes today’s deep focus time. Tap the top arrow anytime to inspect 24-hour timelines and streaks.',
      badge: 'Step 1 of 3'
    },
    {
      step: 2,
      title: 'Real-time Screen Wellness',
      text: 'Tracks your daily ratio of productive work vs distractions. Tap to review per-app usage and pickup habits.',
      badge: 'Step 2 of 3'
    },
    {
      step: 3,
      title: 'Begin Locked Study',
      text: 'Tap here to launch a Timer, Stopwatch or Pomodoro. Enable strict mode to eliminate phone temptations.',
      badge: 'Step 3 of 3'
    }
  ];

  const current = tourData[tourStep - 1] || tourData[0];

  const handleNext = () => {
    if (tourStep >= 3) {
      dismissTour();
    } else {
      setTourStep(tourStep + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end p-5 pb-28">
      {/* Semi-transparent protective backdrop */}
      <div className="fixed inset-0 bg-black/50 pointer-events-auto backdrop-blur-[2px]" onClick={dismissTour} />

      {/* Floating Tour Card */}
      <div className="relative pointer-events-auto w-full max-w-sm mx-auto bg-[#1C2333] border border-[#273049] rounded-[28px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-3.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center">
              <Sparkles size={14} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
              {current.badge}
            </span>
          </div>
          <button
            onClick={dismissTour}
            aria-label="Skip tour"
            className="text-xs text-[#8B95AD] hover:text-white p-1"
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <h4 className="text-base font-bold font-display text-[#F2F5FA]">
            {current.title}
          </h4>
          <p className="text-xs text-[#8B95AD] mt-1 leading-relaxed">
            {current.text}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={dismissTour}
            className="text-xs font-semibold text-[#8B95AD] hover:text-white"
          >
            Skip tour
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-ink)] font-bold text-xs rounded-full flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            <span>{tourStep === 3 ? 'Get Started' : 'Next'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
