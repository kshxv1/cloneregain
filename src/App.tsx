/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { FocusScreen } from './screens/FocusScreen';
import { PlanScreen } from './screens/PlanScreen';
import { RoomsScreen } from './screens/RoomsScreen';
import { LimitsScreen } from './screens/LimitsScreen';
import { ActiveSessionScreen } from './screens/ActiveSessionScreen';
import { StatsScreen } from './screens/StatsScreen';
import { CreateScheduleScreen } from './screens/CreateScheduleScreen';
import { StartSessionModal } from './screens/StartSessionModal';
import { PaywallModal } from './components/PaywallModal';
import { ProfileSettingsModal } from './screens/ProfileSettingsModal';
import { ScreenTimeDetailModal } from './screens/ScreenTimeDetailModal';
import { SessionSummaryModal } from './components/SessionSummaryModal';
import { OnboardingTour } from './components/OnboardingTour';
import { OnboardingFlow } from './screens/OnboardingFlow';
import { BottomNav } from './components/BottomNav';

const MainLayout: React.FC = () => {
  const {
    profile,
    activeTab,
    activeSession,
    showStatsScreen,
    showCreateSchedule,
  } = useApp();

  // If user hasn't completed first-launch onboarding
  if (!profile.onboarded) {
    return <OnboardingFlow />;
  }

  return (
    <div className="relative min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex justify-center">
      {/* Container framing for mobile baseline (360-480px) and tablet centering */}
      <div className="w-full max-w-[480px] min-h-screen relative flex flex-col shadow-2xl bg-[var(--color-bg)]">
        {/* Active Fullscreen Session takes complete precedence */}
        {activeSession ? (
          <ActiveSessionScreen />
        ) : showStatsScreen ? (
          <StatsScreen />
        ) : showCreateSchedule ? (
          <CreateScheduleScreen />
        ) : (
          <>
            {activeTab === 'focus' && <FocusScreen />}
            {activeTab === 'plan' && <PlanScreen />}
            {activeTab === 'rooms' && <RoomsScreen />}
            {activeTab === 'limits' && <LimitsScreen />}
          </>
        )}

        {/* Global Floating Navigation & Sheets */}
        <BottomNav />
        <StartSessionModal />
        <PaywallModal />
        <ProfileSettingsModal />
        <ScreenTimeDetailModal />
        <SessionSummaryModal />
        <OnboardingTour />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
