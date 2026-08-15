'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import { TelemetryNode } from '@/store/telemetry';

interface AITranslatorProps {
  nodes: TelemetryNode[];
}

function generateInsight(nodes: TelemetryNode[]): string {
  if (nodes.length === 0) {
    return 'No servers are currently registered. Add your first server to begin receiving real-time infrastructure insights and health analysis.';
  }

  const lines: string[] = [];
  const avgCpu = nodes.reduce((sum, n) => sum + (n.cpu || 0), 0) / nodes.length;
  const avgMem = nodes.reduce((sum, n) => sum + (n.memory || 0), 0) / nodes.length;
  const avgDisk = nodes.reduce((sum, n) => sum + (n.disk || 0), 0) / nodes.length;
  const criticals = nodes.filter((n) => n.status === 'critical' || (n.cpu || 0) >= 90);
  const warnings = nodes.filter(
    (n) => n.status === 'warning' || ((n.cpu || 0) >= 70 && (n.cpu || 0) < 90)
  );
  const healthy = nodes.filter(
    (n) => n.status === 'healthy' && (n.cpu || 0) < 70
  );

  // Overall status
  if (criticals.length === 0 && warnings.length === 0) {
    lines.push(
      `✅ All ${nodes.length} servers are operating within normal parameters. Infrastructure is stable and healthy.`
    );
  } else if (criticals.length > 0) {
    lines.push(
      `🚨 ATTENTION: ${criticals.length} server${criticals.length > 1 ? 's are' : ' is'} in critical condition. Immediate investigation recommended.`
    );
  } else {
    lines.push(
      `⚠️ ${warnings.length} server${warnings.length > 1 ? 's show' : ' shows'} elevated load. Monitoring closely.`
    );
  }

  // CPU analysis
  if (avgCpu >= 80) {
    lines.push(
      `📊 Average CPU utilization is at ${Math.round(avgCpu)}% — this is unusually high. Consider scaling horizontally or investigating CPU-intensive processes.`
    );
  } else if (avgCpu >= 50) {
    lines.push(
      `📊 CPU utilization averages ${Math.round(avgCpu)}% across the fleet — moderate load, within acceptable range.`
    );
  } else {
    lines.push(
      `📊 CPU utilization is healthy at ${Math.round(avgCpu)}% average. Plenty of compute headroom available.`
    );
  }

  // Memory
  if (avgMem >= 85) {
    lines.push(
      `💾 Memory pressure detected: ${Math.round(avgMem)}% average RAM usage. Risk of OOM events if load increases.`
    );
  } else if (avgMem >= 60) {
    lines.push(
      `💾 Memory usage at ${Math.round(avgMem)}% average — normal for production workloads.`
    );
  }

  // Disk
  if (avgDisk >= 80) {
    lines.push(
      `💿 Disk space warning: ${Math.round(avgDisk)}% average utilization. Plan for storage expansion or log rotation.`
    );
  }

  // Specific server callouts
  criticals.forEach((n) => {
    lines.push(
      `🔴 "${n.name}" (${n.ip}) is critical — CPU: ${Math.round(n.cpu || 0)}%, MEM: ${Math.round(n.memory || 0)}%, DISK: ${Math.round(n.disk || 0)}%.`
    );
  });

  // Healthy summary
  if (healthy.length > 0 && criticals.length > 0) {
    lines.push(
      `🟢 ${healthy.length} server${healthy.length > 1 ? 's remain' : ' remains'} fully healthy and operational.`
    );
  }

  return lines.join('\n\n');
}

export default function AITranslator({ nodes }: AITranslatorProps) {
  const insight = useMemo(() => generateInsight(nodes), [nodes]);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');
    let index = 0;
    const interval = setInterval(() => {
      if (index < insight.length) {
        setDisplayedText(insight.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 8);

    return () => clearInterval(interval);
  }, [insight]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 120, delay: 0.8 }}
      className="glass-panel p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4FACFE]/20 to-[#7C3AED]/20 flex items-center justify-center border border-[#4FACFE]/20">
          <Bot className="w-4.5 h-4.5 text-[#4FACFE]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3
              className="text-sm font-semibold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Founder&apos;s AI Translator
            </h3>
            <Sparkles className="w-3.5 h-3.5 text-[#4FACFE]" />
          </div>
          <p className="text-[0.625rem] text-[var(--text-tertiary)]">
            Real-time plain-English infrastructure summary
          </p>
        </div>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 text-[0.625rem] font-mono text-[#4FACFE]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4FACFE] animate-pulse" />
            Analyzing
          </motion.div>
        )}
      </div>

      <div
        className="rounded-xl p-4 text-[0.8125rem] leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap min-h-[80px] font-[var(--font-body)]"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {displayedText}
        {isTyping && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-[2px] h-[14px] bg-[#4FACFE] ml-0.5 align-middle"
          />
        )}
      </div>
    </motion.div>
  );
}
