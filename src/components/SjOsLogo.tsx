/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SjOsLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  theme?: 'light' | 'dark' | 'glass';
  className?: string;
}

export function SjOsLogo({
  size = 'md',
  showSubtitle = true,
  theme = 'light',
  className = '',
}: SjOsLogoProps) {
  // Size dimensions
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const tagSizes = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-[#002D62]';
  const subtextColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className={`flex items-center gap-3 font-sans select-none ${className}`}>
      {/* Interwoven Dynamic SJ Arrows Vector Logo */}
      <div className={`relative shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="sjArrowGrad1" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00A3FF" />
              <stop offset="50%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#003399" />
            </linearGradient>

            <linearGradient id="sjArrowGrad2" x1="200" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="60%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>

            <filter id="sjGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* S-Loop Top Ribbon Arrow */}
          <path
            d="M 40 90 C 20 60, 50 20, 100 20 C 140 20, 165 40, 120 75 L 80 110 C 60 130, 80 160, 120 160 C 150 160, 175 140, 175 110"
            stroke="url(#sjArrowGrad1)"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* J-Loop Bottom Ribbon Arrow */}
          <path
            d="M 120 40 L 120 130 C 120 165, 95 180, 70 170 C 50 160, 45 140, 55 125"
            stroke="url(#sjArrowGrad2)"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Top Arrow Head */}
          <path
            d="M 90 20 L 125 15 L 115 45 Z"
            fill="#00A3FF"
          />

          {/* Upward Right Arrow Head */}
          <path
            d="M 160 30 L 185 10 L 180 40 Z"
            fill="#38BDF8"
          />

          {/* Checkmark Arrow accent */}
          <path
            d="M 85 90 L 110 115 L 165 55"
            stroke="#00E5FF"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`${textSizes[size]} font-extrabold tracking-tight ${textColor} leading-none`}>
            SJ OS
          </span>
          <span className="bg-[#007AFF] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono shadow-xs">
            PRO
          </span>
        </div>

        {showSubtitle && (
          <div className="mt-0.5 space-y-0.5">
            <span className={`${tagSizes[size]} font-semibold ${subtextColor} block leading-tight tracking-wide font-sans`}>
              NR Enterprise
            </span>
            <span className="text-[8px] font-bold text-[#007AFF] uppercase tracking-[0.18em] block leading-none font-mono">
              WORK MANAGEMENT OS
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
