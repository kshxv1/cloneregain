import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CircularProgressProps {
  progress: number; // 0 to 1 (can exceed 1 for >100%)
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  onTopArrowClick?: () => void;
  showTopArrow?: boolean;
  accentColor?: string;
  trackColor?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 260,
  strokeWidth = 26,
  children,
  onTopArrowClick,
  showTopArrow = false,
  accentColor = 'var(--color-primary)',
  trackColor = '#1C2333',
}) => {
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference - clampedProgress * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Foreground progress arc */}
        {clampedProgress > 0 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={accentColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>

      {/* Top arrow affordance (as seen in screenshots to jump to stats) */}
      {showTopArrow && (
        <button
          onClick={onTopArrowClick}
          aria-label="View detailed stats"
          className="absolute -top-1 w-9 h-9 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-ink)] flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 z-10"
        >
          <ArrowRight size={18} strokeWidth={2.8} />
        </button>
      )}

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-auto p-4">
        {children}
      </div>
    </div>
  );
};
