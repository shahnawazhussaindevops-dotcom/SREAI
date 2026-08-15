'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  glowColor?: 'cyan' | 'purple' | 'red' | 'green';
  onClick?: () => void;
  delay?: number;
}

export default function GlassCard({
  children,
  className,
  hoverable = false,
  glowColor,
  onClick,
  delay = 0,
}: GlassCardProps) {
  const glowMap = {
    cyan: 'hover:shadow-[0_0_25px_rgba(0,242,254,0.15),0_0_60px_rgba(0,242,254,0.05)] hover:border-[rgba(0,242,254,0.25)]',
    purple: 'hover:shadow-[0_0_25px_rgba(79,172,254,0.15),0_0_60px_rgba(79,172,254,0.05)] hover:border-[rgba(79,172,254,0.25)]',
    red: 'hover:shadow-[0_0_25px_rgba(255,0,85,0.2),0_0_60px_rgba(255,0,85,0.06)] hover:border-[rgba(255,0,85,0.25)]',
    green: 'hover:shadow-[0_0_25px_rgba(0,230,118,0.15),0_0_60px_rgba(0,230,118,0.05)] hover:border-[rgba(0,230,118,0.25)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring' as const,
        damping: 25,
        stiffness: 200,
        delay,
      }}
      whileHover={hoverable ? { scale: 1.02, y: -2 } : undefined}
      whileTap={hoverable ? { scale: 0.99 } : undefined}
      onClick={onClick}
      className={cn(
        'glass-panel',
        hoverable && 'cursor-pointer',
        hoverable && glowColor && glowMap[glowColor],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
