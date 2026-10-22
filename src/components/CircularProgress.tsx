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
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size,
  strokeWidth = 9,
  children,
  onTopArrowClick,
  showTopArrow = false,
  accentColor = 'var(--color-primary)',
  trackColor = '#1C2333',
  className = '',
}) => {
  // Use viewBox 0 0 100 100 for universal responsive vector scalability
  const center = 50;
  const radius = center - strokeWidth / 2 - 1.5;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference - clampedProgress * circumference;

  const styleDimension = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <div
      className={`relative inline-flex items-center justify-center transition-all duration-300 ${
        !size ? 'w-56 h-56 xs:w-64 xs:h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 max-w-full' : ''
      } ${className}`}
      style={styleDimension}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full rotate-[-90deg] drop-shadow-[0_10px_24px_rgba(0,0,0,0.3)]"
      >
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

      {/* Top arrow affordance (jumps to stats) */}
      {showTopArrow && (
        <button
          onClick={onTopArrowClick}
          aria-label="View detailed stats"
          className="absolute -top-1.5 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-ink)] flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 z-10 cursor-pointer"
        >
          <ArrowRight size={18} strokeWidth={2.8} />
        </button>
      )}

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-auto p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};
