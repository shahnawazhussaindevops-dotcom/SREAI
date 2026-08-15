'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CircularProgress from '@/components/ui/CircularProgress';
import { TelemetryNode } from '@/store/telemetry';

interface GlobalHealthOrbitProps {
  nodes: TelemetryNode[];
}

function calculateHealthGrade(nodes: TelemetryNode[]): {
  grade: string;
  score: number;
  description: string;
} {
  if (nodes.length === 0) {
    return { grade: '—', score: 0, description: 'No servers registered' };
  }

  const avgCpu = nodes.reduce((sum, n) => sum + (n.cpu || 0), 0) / nodes.length;
  const avgMem = nodes.reduce((sum, n) => sum + (n.memory || 0), 0) / nodes.length;
  const avgDisk = nodes.reduce((sum, n) => sum + (n.disk || 0), 0) / nodes.length;
  const criticalCount = nodes.filter(
    (n) => n.status === 'critical' || (n.cpu || 0) >= 90
  ).length;
  const criticalRatio = criticalCount / nodes.length;

  // Score: 100 = perfect, 0 = terrible
  let score = 100;
  score -= avgCpu * 0.4; // CPU weight
  score -= avgMem * 0.25; // Memory weight
  score -= avgDisk * 0.15; // Disk weight
  score -= criticalRatio * 30; // Critical penalty
  score = Math.max(0, Math.min(100, score));

  let grade: string;
  let description: string;

  if (score >= 90) {
    grade = 'A';
    description = 'All systems operating optimally';
  } else if (score >= 75) {
    grade = 'B';
    description = 'Good performance, minor load detected';
  } else if (score >= 55) {
    grade = 'C';
    description = 'Moderate load, attention recommended';
  } else if (score >= 35) {
    grade = 'D';
    description = 'High load detected, action needed';
  } else {
    grade = 'F';
    description = 'Critical — immediate intervention required';
  }

  return { grade, score, description };
}

export default function GlobalHealthOrbit({ nodes }: GlobalHealthOrbitProps) {
  const nodeCount = nodes.length;
  const avgCpu = nodeCount
    ? nodes.reduce((sum, n) => sum + (n.cpu || 0), 0) / nodeCount
    : 0;
  const avgMem = nodeCount
    ? nodes.reduce((sum, n) => sum + (n.memory || 0), 0) / nodeCount
    : 0;
  const avgDisk = nodeCount
    ? nodes.reduce((sum, n) => sum + (n.disk || 0), 0) / nodeCount
    : 0;
  const latencies = nodes
    .map((n) => n.latency_ms)
    .filter((v): v is number => v != null);
  const avgLatency = latencies.length
    ? latencies.reduce((a, b) => a + b, 0) / latencies.length
    : 0;
  // Normalize latency to percentage (0-100) where 1000ms = 100%
  const latencyPct = Math.min((avgLatency / 1000) * 100, 100);

  const { grade, score, description } = calculateHealthGrade(nodes);

  const gradeClass =
    grade === 'A'
      ? 'grade-a'
      : grade === 'B'
      ? 'grade-b'
      : grade === 'C'
      ? 'grade-c'
      : grade === 'D'
      ? 'grade-d'
      : 'grade-f';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, damping: 20, stiffness: 150 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="glass-panel p-6 lg:p-8"
    >
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Health Score */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center gap-3 flex-shrink-0"
        >
          <div className="text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
            Server Health Score
          </div>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              damping: 12,
              stiffness: 100,
              delay: 0.3,
            }}
            className={`health-grade ${grade !== '—' ? gradeClass : ''}`}
            style={grade === '—' ? { color: 'var(--text-tertiary)' } : undefined}
          >
            {grade}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="text-sm font-medium text-[var(--text-secondary)]">
              {description}
            </div>
            <div className="text-[0.6875rem] font-mono text-[var(--text-tertiary)] mt-1">
              Score: {Math.round(score)}/100 · {nodeCount} node
              {nodeCount === 1 ? '' : 's'}
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-40 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        {/* Progress Rings */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 justify-items-center">
          <CircularProgress
            value={avgCpu}
            label="CPU Load"
            sublabel={`${Math.round(avgCpu)}% avg`}
            gradientFrom="#00F2FE"
            gradientTo="#4FACFE"
            delay={0.1}
          />
          <CircularProgress
            value={avgMem}
            label="RAM Usage"
            sublabel={`${Math.round(avgMem)}% avg`}
            gradientFrom="#4FACFE"
            gradientTo="#7C3AED"
            delay={0.2}
          />
          <CircularProgress
            value={latencyPct}
            label="Network I/O"
            sublabel={avgLatency ? `${Math.round(avgLatency)}ms avg` : 'N/A'}
            gradientFrom="#00E676"
            gradientTo="#00F2FE"
            delay={0.3}
          />
          <CircularProgress
            value={avgDisk}
            label="Storage"
            sublabel={`${Math.round(avgDisk)}% used`}
            gradientFrom="#FF9100"
            gradientTo="#FFD600"
            delay={0.4}
          />
        </div>
      </div>
    </motion.div>
  );
}
