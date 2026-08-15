'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
  gradientFrom?: string;
  gradientTo?: string;
  delay?: number;
}

export default function CircularProgress({
  value,
  size = 140,
  strokeWidth = 8,
  label,
  sublabel,
  gradientFrom = '#00F2FE',
  gradientTo = '#4FACFE',
  delay = 0,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (progress / 100) * circumference;
  const gradientId = `progress-gradient-${label.replace(/\s+/g, '-').toLowerCase()}`;

  // Dynamic color based on value
  const getValueColor = () => {
    if (value >= 90) return '#FF0055';
    if (value >= 70) return '#FFD600';
    return gradientFrom;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 150,
        delay,
      }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
            <filter id={`glow-${gradientId}`}>
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />

          {/* Progress ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 80,
              delay: delay + 0.2,
            }}
            filter={`url(#glow-${gradientId})`}
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.4 }}
            className="text-2xl font-bold font-mono"
            style={{ color: getValueColor() }}
          >
            {Math.round(value)}%
          </motion.span>
        </div>
      </div>

      <div className="text-center">
        <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </div>
        {sublabel && (
          <div className="text-[10px] font-mono text-[var(--text-tertiary)] mt-0.5">
            {sublabel}
          </div>
        )}
      </div>
    </motion.div>
  );
}
