import React from 'react';
import { Hourglass, Calendar, Users2, ShieldOff } from 'lucide-react';
import { useApp } from '../store/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, activeSession, showStatsScreen, showCreateSchedule } = useApp();

  // Hide nav during active full-screen session or nested sub-flows
  if (activeSession || showStatsScreen || showCreateSchedule) {
    return null;
  }

  const tabs: {
    id: 'focus' | 'plan' | 'rooms' | 'limits';
    label: string;
    icon: React.ComponentType<{ size: number; strokeWidth?: number; className?: string }>;
  }[] = [
    { id: 'focus', label: 'Focus', icon: Hourglass },
    { id: 'plan', label: 'Schedule', icon: Calendar },
    { id: 'rooms', label: 'Groups', icon: Users2 },
    { id: 'limits', label: 'Blocks', icon: ShieldOff },
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Bottom Navigation"
        className="pointer-events-auto flex items-center justify-between w-full max-w-[390px] h-16 px-4 bg-[#141925]/95 backdrop-blur-xl border border-[#273049]/80 rounded-[28px] shadow-[0_12px_32px_rgba(0,0,0,0.55)] transition-all"
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors relative group ${
                isActive ? 'text-[var(--color-primary)] font-semibold' : 'text-[#8B95AD] hover:text-[#F2F5FA]'
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-[var(--color-primary)]/15 scale-105' : 'group-hover:bg-white/5'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
