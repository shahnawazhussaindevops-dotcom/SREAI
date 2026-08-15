'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animate, utils } from 'animejs';
import { TelemetryNode } from '@/store/telemetry';

interface ProcessRadarProps {
  nodes: TelemetryNode[];
}

interface ProcessBubble {
  id: string;
  name: string;
  cpu: number;
  memory: number;
  size: number; // Normalized 20-80
  x: number; // percentage
  y: number; // percentage
  color: string;
  server: string;
}

function generateProcesses(nodes: TelemetryNode[]): ProcessBubble[] {
  const processes: ProcessBubble[] = [];
  const processNames = [
    'nginx', 'node', 'python3', 'postgres', 'redis-server',
    'java', 'docker', 'kubelet', 'grafana', 'prometheus',
    'sshd', 'systemd', 'journald', 'cron', 'rsyslog',
    'containerd', 'etcd', 'haproxy', 'memcached', 'mongodb',
  ];

  nodes.forEach((node, ni) => {
    const count = Math.max(2, Math.min(5, Math.floor(Math.random() * 4) + 2));
    for (let i = 0; i < count; i++) {
      const procName = processNames[(ni * 5 + i) % processNames.length];
      const cpu = Math.max(1, node.cpu ? node.cpu * (0.2 + Math.random() * 0.5) : Math.random() * 30);
      const memory = Math.max(1, node.memory ? node.memory * (0.1 + Math.random() * 0.4) : Math.random() * 25);
      const resourceWeight = cpu * 0.6 + memory * 0.4;
      const size = Math.max(16, Math.min(70, resourceWeight * 0.7));

      processes.push({
        id: `${node.id}-${procName}-${i}`,
        name: procName,
        cpu: Math.round(cpu * 10) / 10,
        memory: Math.round(memory * 10) / 10,
        size,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 75,
        color:
          cpu >= 70
            ? '#FF0055'
            : cpu >= 40
            ? '#FFD600'
            : '#00F2FE',
        server: node.name,
      });
    }
  });

  return processes;
}

export default function ProcessRadar({ nodes }: ProcessRadarProps) {
  const processes = useMemo(() => generateProcesses(nodes), [nodes]);
  const [hoveredProcess, setHoveredProcess] = useState<ProcessBubble | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.5 },
    },
  } as const;

  useEffect(() => {
    if (processes.length > 0) {
      animate('.process-bubble', {
        scale: [0, 1],
        opacity: [0, 1],
        x: () => utils.random(-15, 15),
        y: () => utils.random(-15, 15),
        rotate: () => utils.random(-360, 360),
        delay: (_, i) => 600 + utils.random(0, 400),
        duration: () => utils.random(1200, 1800),
        ease: 'outElastic(1, .5)',
      });
    }
  }, [processes.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 120, delay: 0.6 }}
      className="glass-panel p-5 flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            Live Process Radar
          </h3>
          <p className="text-[0.625rem] text-[var(--text-tertiary)] font-mono">
            {processes.length} processes · bubble size = resource consumption
          </p>
        </div>
        <div className="flex items-center gap-4 text-[0.5625rem] font-mono text-[var(--text-tertiary)]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F2FE]" />
            Low
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD600]" />
            Medium
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF0055]" />
            High
          </div>
        </div>
      </div>

      {/* Radar Area */}
      <div className="relative w-full h-[280px] rounded-xl overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 242, 254, 0.03) 0%, rgba(5, 5, 5, 0.8) 70%)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {[25, 50, 75].map((pct) => (
            <React.Fragment key={pct}>
              <div
                className="absolute w-full h-px"
                style={{
                  top: `${pct}%`,
                  background: 'rgba(255, 255, 255, 0.03)',
                }}
              />
              <div
                className="absolute h-full w-px"
                style={{
                  left: `${pct}%`,
                  background: 'rgba(255, 255, 255, 0.03)',
                }}
              />
            </React.Fragment>
          ))}
          {/* Radar circles */}
          {[30, 55, 80].map((r) => (
            <div
              key={r}
              className="absolute rounded-full border border-white/[0.03]"
              style={{
                width: `${r}%`,
                height: `${r}%`,
                top: `${(100 - r) / 2}%`,
                left: `${(100 - r) / 2}%`,
              }}
            />
          ))}
        </div>

        {/* Process Bubbles */}
        <div className="absolute inset-0 process-radar-container">
          {processes.map((proc, i) => (
            <div
              key={proc.id}
              className="absolute cursor-pointer process-bubble opacity-0 scale-0"
              data-index={i}
              style={{
                left: `${proc.x}%`,
                top: `${proc.y}%`,
                width: proc.size,
                height: proc.size,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseEnter={() => setHoveredProcess(proc)}
              onMouseLeave={() => setHoveredProcess(null)}
            >
              <div
                className="w-full h-full rounded-full transition-shadow duration-300"
                style={{
                  background: `radial-gradient(circle, ${proc.color}88, ${proc.color}33)`,
                  boxShadow: `0 0 ${proc.size / 3}px ${proc.color}44`,
                  border: `1px solid ${proc.color}55`,
                }}
              />
              {proc.size >= 35 && (
                <div className="absolute inset-0 flex items-center justify-center text-[7px] font-mono font-semibold text-white/80 pointer-events-none truncate px-1">
                  {proc.name}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredProcess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute z-50 glass-tooltip"
              style={{
                left: `${Math.min(hoveredProcess.x, 75)}%`,
                top: `${Math.max(hoveredProcess.y - 20, 5)}%`,
                minWidth: 160,
                pointerEvents: 'none',
              }}
            >
              <div className="text-xs font-bold mb-1">{hoveredProcess.name}</div>
              <div className="text-[0.5625rem] text-[var(--text-tertiary)] font-mono mb-2">
                Server: {hoveredProcess.server}
              </div>
              <div className="space-y-1 text-[0.625rem] font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">CPU</span>
                  <span style={{ color: hoveredProcess.color }}>
                    {hoveredProcess.cpu}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">RAM</span>
                  <span className="text-[var(--text-secondary)]">
                    {hoveredProcess.memory}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
