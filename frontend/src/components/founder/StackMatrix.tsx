'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animate, utils } from 'animejs';
import {
  Server,
  Container,
  Boxes,
  HardDrive,
  Cpu,
  MemoryStick,
  Monitor,
} from 'lucide-react';
import { TelemetryNode } from '@/store/telemetry';

interface StackMatrixProps {
  nodes: TelemetryNode[];
}

// Simulated data structures derived from real telemetry
interface VMData {
  name: string;
  cpu: number;
  memory: number;
  status: string;
  ip: string;
}

interface PodData {
  name: string;
  status: 'Running' | 'CrashLoopBackOff' | 'Pending';
  uptime: string;
  namespace: string;
}

interface ContainerData {
  name: string;
  image: string;
  ramUsage: number;
  status: string;
  icon: string;
}

function deriveVMs(nodes: TelemetryNode[]): VMData[] {
  return nodes.map((n) => ({
    name: n.name,
    cpu: n.cpu || 0,
    memory: n.memory || 0,
    status: n.status,
    ip: n.ip,
  }));
}

function derivePods(nodes: TelemetryNode[]): PodData[] {
  // Generate representative pod data from server nodes
  const pods: PodData[] = [];
  nodes.forEach((n) => {
    const podCount = Math.max(1, Math.floor(Math.random() * 4) + 1);
    const services = ['api', 'web', 'worker', 'cache', 'db', 'proxy', 'monitor'];
    for (let i = 0; i < podCount; i++) {
      const service = services[Math.floor(Math.random() * services.length)];
      const isCrashing = n.status === 'critical' && Math.random() > 0.5;
      pods.push({
        name: `${n.name}-${service}-${Math.random().toString(36).slice(2, 7)}`,
        status: isCrashing ? 'CrashLoopBackOff' : 'Running',
        uptime: n.uptime || '—',
        namespace: 'default',
      });
    }
  });
  return pods;
}

function deriveContainers(nodes: TelemetryNode[]): ContainerData[] {
  const images = [
    { name: 'nginx-proxy', image: 'nginx:alpine', icon: '🌐' },
    { name: 'redis-cache', image: 'redis:7', icon: '🔴' },
    { name: 'postgres-db', image: 'postgres:16', icon: '🐘' },
    { name: 'node-api', image: 'node:20-slim', icon: '🟢' },
    { name: 'prometheus', image: 'prom/prometheus', icon: '📊' },
    { name: 'grafana', image: 'grafana/grafana', icon: '📈' },
    { name: 'rabbitmq', image: 'rabbitmq:3-mgmt', icon: '🐰' },
    { name: 'elasticsearch', image: 'elasticsearch:8', icon: '🔍' },
  ];

  return nodes.slice(0, 8).map((n, i) => {
    const img = images[i % images.length];
    return {
      name: img.name,
      image: img.image,
      ramUsage: Math.round(n.memory || Math.random() * 70),
      status: n.status === 'critical' ? 'unhealthy' : 'running',
      icon: img.icon,
    };
  });
}

export default function StackMatrix({ nodes }: StackMatrixProps) {
  const [hoveredPod, setHoveredPod] = useState<PodData | null>(null);
  const [podTooltipPos, setPodTooltipPos] = useState({ x: 0, y: 0 });

  const vms = deriveVMs(nodes);
  const pods = derivePods(nodes);
  const containers = deriveContainers(nodes);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  } as const;

  const colVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, damping: 20, stiffness: 120 },
    },
  };

  useEffect(() => {
    if (pods.length > 0) {
      animate('.hive-dot', {
        scale: [0, 1],
        opacity: [0, 1],
        rotate: () => utils.random(-180, 180),
        borderRadius: () => `${utils.random(10, 50)}%`,
        delay: (_, i) => (i || 0) * 35,
        duration: () => utils.random(1000, 1800),
        ease: 'outElastic(1, .5)',
      });
    }
  }, [pods.length]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-3 gap-5"
    >
      {/* Column 1: Hypervisor / Bare Metal */}
      <motion.div variants={colVariants} className="glass-panel p-5 flex flex-col">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4FACFE]/20 to-[#7C3AED]/20 flex items-center justify-center border border-[#4FACFE]/20">
            <Monitor className="w-4 h-4 text-[#4FACFE]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              Hypervisor / Bare Metal
            </h3>
            <p className="text-[0.625rem] text-[var(--text-tertiary)] font-mono">
              {vms.length} virtual machine{vms.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[300px]">
          {vms.length === 0 ? (
            <div className="text-center text-[var(--text-tertiary)] text-xs py-8">
              No VMs detected
            </div>
          ) : (
            vms.map((vm, i) => {
              const isHeavy = vm.cpu >= 80 || vm.memory >= 80;
              const isCritical = vm.status === 'critical';
              return (
                <motion.div
                  key={vm.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="rounded-xl p-3.5 border transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderColor: isCritical
                      ? 'rgba(255, 0, 85, 0.35)'
                      : isHeavy
                      ? 'rgba(255, 145, 0, 0.3)'
                      : 'rgba(255, 255, 255, 0.06)',
                    boxShadow: isCritical
                      ? '0 0 20px rgba(255, 0, 85, 0.1)'
                      : isHeavy
                      ? '0 0 15px rgba(255, 145, 0, 0.08)'
                      : 'none',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold font-mono truncate">
                      {vm.name}
                    </span>
                    <span
                      className="status-dot"
                      style={{
                        width: 7,
                        height: 7,
                        background: isCritical
                          ? 'var(--crit)'
                          : isHeavy
                          ? 'var(--warn)'
                          : 'var(--ok)',
                      }}
                    />
                  </div>
                  <div className="text-[0.625rem] text-[var(--text-tertiary)] font-mono mb-2.5">
                    {vm.ip}
                  </div>
                  <div className="flex gap-3 text-[0.625rem] font-mono">
                    <div className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-[var(--text-tertiary)]" />
                      <span
                        className={
                          vm.cpu >= 90
                            ? 'text-[var(--crit)]'
                            : vm.cpu >= 70
                            ? 'text-[var(--warn)]'
                            : 'text-[var(--text-secondary)]'
                        }
                      >
                        {Math.round(vm.cpu)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MemoryStick className="w-3 h-3 text-[var(--text-tertiary)]" />
                      <span className="text-[var(--text-secondary)]">
                        {Math.round(vm.memory)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Column 2: Kubernetes Cluster */}
      <motion.div variants={colVariants} className="glass-panel p-5 flex flex-col relative">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E676]/20 to-[#00F2FE]/20 flex items-center justify-center border border-[#00E676]/20">
            <Boxes className="w-4 h-4 text-[#00E676]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              Kubernetes Cluster
            </h3>
            <p className="text-[0.625rem] text-[var(--text-tertiary)] font-mono">
              {pods.length} pod{pods.length === 1 ? '' : 's'} ·{' '}
              {pods.filter((p) => p.status === 'CrashLoopBackOff').length} failing
            </p>
          </div>
        </div>

        {/* Hive Grid */}
        <div className="flex-1 flex flex-wrap gap-1.5 content-start max-h-[300px] overflow-y-auto p-1">
          {pods.map((pod, i) => (
            <div
              key={pod.name}
              data-index={i}
              className={`hive-dot ${
                pod.status === 'CrashLoopBackOff' ? 'crashing' : 'running'
              }`}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const parent = e.currentTarget.closest('.glass-panel');
                const parentRect = parent?.getBoundingClientRect() || rect;
                setPodTooltipPos({
                  x: rect.left - parentRect.left + 6,
                  y: rect.top - parentRect.top - 60,
                });
                setHoveredPod(pod);
              }}
              onMouseLeave={() => setHoveredPod(null)}
            />
          ))}
        </div>

        {/* Pod Tooltip */}
        <AnimatePresence>
          {hoveredPod && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute z-20 glass-tooltip"
              style={{
                left: Math.min(podTooltipPos.x, 200),
                top: Math.max(podTooltipPos.y, 10),
                minWidth: 180,
                pointerEvents: 'none',
              }}
            >
              <div className="text-[0.6875rem] font-semibold font-mono truncate mb-1">
                {hoveredPod.name}
              </div>
              <div className="flex items-center gap-1.5 text-[0.625rem]">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background:
                      hoveredPod.status === 'CrashLoopBackOff'
                        ? 'var(--crit)'
                        : 'var(--ok)',
                  }}
                />
                <span
                  style={{
                    color:
                      hoveredPod.status === 'CrashLoopBackOff'
                        ? 'var(--crit)'
                        : 'var(--ok)',
                  }}
                >
                  {hoveredPod.status}
                </span>
              </div>
              <div className="text-[0.5625rem] text-[var(--text-tertiary)] mt-1">
                ns: {hoveredPod.namespace}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Column 3: Docker Engine */}
      <motion.div variants={colVariants} className="glass-panel p-5 flex flex-col">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F2FE]/20 to-[#4FACFE]/20 flex items-center justify-center border border-[#00F2FE]/20">
            <Container className="w-4 h-4 text-[#00F2FE]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              Docker Engine
            </h3>
            <p className="text-[0.625rem] text-[var(--text-tertiary)] font-mono">
              {containers.length} container{containers.length === 1 ? '' : 's'} running
            </p>
          </div>
        </div>

        {/* Horizontal scrolling carousel */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2 -mx-1">
          <div className="flex gap-3 px-1 min-w-max">
            {containers.map((container, i) => {
              // Assign a composition mode based on index for demonstration
              const modeClass = i % 3 === 0 ? 'none' : i % 3 === 1 ? 'replace' : 'blend';
              return (
              <div
                key={container.name}
                className={`docker-card ${modeClass} flex-shrink-0 w-40 rounded-xl p-3.5 border border-white/8 cursor-pointer transition-colors`}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  const mode = el.classList.contains('none') ? 'none' : el.classList.contains('replace') ? 'replace' : 'blend';
                  animate(el, { scale: 1.08, duration: 350, composition: mode as any, ease: 'outElastic(1, 0.6)' });
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  const mode = el.classList.contains('none') ? 'none' : el.classList.contains('replace') ? 'replace' : 'blend';
                  animate(el, { scale: 1.0, duration: 250, composition: mode as any, ease: 'outQuad' });
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  boxShadow:
                    container.status === 'unhealthy'
                      ? '0 0 15px rgba(255, 0, 85, 0.1)'
                      : 'var(--shadow-glass-inner)',
                  borderColor:
                    container.status === 'unhealthy'
                      ? 'rgba(255, 0, 85, 0.2)'
                      : 'rgba(255, 255, 255, 0.06)',
                }}
              >
                <div className="text-2xl mb-2">{container.icon}</div>
                <div className="text-xs font-semibold truncate mb-0.5">
                  {container.name}
                </div>
                <div className="text-[0.5625rem] text-[var(--text-tertiary)] font-mono truncate mb-3">
                  {container.image}
                </div>
                <div className="text-[0.625rem] font-mono text-[var(--text-secondary)]">
                  RAM:{' '}
                  <span
                    style={{
                      color:
                        container.ramUsage >= 80
                          ? 'var(--crit)'
                          : container.ramUsage >= 60
                          ? 'var(--warn)'
                          : 'var(--ok)',
                    }}
                  >
                    {container.ramUsage}%
                  </span>
                </div>
                {/* Mini progress bar */}
                <div className="mt-2 h-1 rounded-full bg-white/6 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${container.ramUsage}%` }}
                    transition={{ delay: 0.8 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        container.ramUsage >= 80
                          ? 'linear-gradient(90deg, #FF0055, #FF6B6B)'
                          : container.ramUsage >= 60
                          ? 'linear-gradient(90deg, #FFD600, #FF9100)'
                          : 'linear-gradient(90deg, #00E676, #00F2FE)',
                    }}
                  />
                </div>
              </div>
            )})}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
