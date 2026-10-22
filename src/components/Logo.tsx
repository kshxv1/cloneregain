import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, className = '', showText = false }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Soft outer glow */}
        <circle cx="24" cy="24" r="22" stroke="var(--color-primary)" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
        
        {/* Middle water ripple */}
        <circle cx="24" cy="24" r="16" stroke="var(--color-primary)" strokeWidth="2" strokeOpacity="0.6" />
        
        {/* Inner still water drop */}
        <circle cx="24" cy="24" r="9" stroke="var(--color-primary)" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="4" fill="var(--color-primary)" />
        
        {/* Concentric reflection arc */}
        <path
          d="M14 17C16.5 13.5 20 12 24 12"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
      </svg>
      {showText && (
        <span className="font-display font-bold text-xl tracking-tight text-[var(--color-text)]">
          Stillwater
        </span>
      )}
    </div>
  );
};
