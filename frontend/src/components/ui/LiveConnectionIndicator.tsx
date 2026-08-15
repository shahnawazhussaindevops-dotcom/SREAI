'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LiveConnectionIndicatorProps {
  connected: boolean;
  label?: string;
  showLabel?: boolean;
}

export default function LiveConnectionIndicator({
  connected,
  label,
  showLabel = true,
}: LiveConnectionIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg"
      style={{
        background: connected
          ? 'rgba(0, 230, 118, 0.06)'
          : 'rgba(255, 255, 255, 0.03)',
        border: `1px solid ${connected ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 255, 255, 0.08)'}`,
      }}
    >
      <div className={`live-indicator ${connected ? '' : 'disconnected'}`} />
      {showLabel && (
        <span
          className="text-[0.6875rem] font-semibold"
          style={{
            color: connected ? 'var(--ok)' : 'var(--text-tertiary)',
          }}
        >
          {label || (connected ? 'Live Connection' : 'Reconnecting...')}
        </span>
      )}
    </motion.div>
  );
}
