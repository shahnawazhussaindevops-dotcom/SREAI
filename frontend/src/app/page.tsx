'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, ShieldAlert, Cpu, HardDrive, Server, Home,
  Plus, Settings2, Route, Crown, Zap
} from 'lucide-react';
import Link from 'next/link';
import NetworkTopology3D from '@/components/dashboard/NetworkTopology3D';
import LiveTerminal from '@/components/dashboard/LiveTerminal';
import IncidentTriage from '@/components/dashboard/IncidentTriage';
import AddServerModal from '@/components/dashboard/AddServerModal';
import LiveConnectionIndicator from '@/components/ui/LiveConnectionIndicator';
import { useTelemetryStore } from '@/store/telemetry';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
} as const;

const fadeUpItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 22, stiffness: 180 },
  },
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);

  const telemetryNodes = useTelemetryStore((s) => s.nodes);
  const criticalCount = useTelemetryStore((s) => s.criticalCount);
  const healthPct = useTelemetryStore((s) => s.healthPct);
  const connected = useTelemetryStore((s) => s.connected);
  const connect = useTelemetryStore((s) => s.connect);

  useEffect(() => {
    connect();
  }, [connect]);

  const nodeCount = telemetryNodes.length;
  const avgCpu = nodeCount
    ? Math.round(telemetryNodes.reduce((sum, n) => sum + (n.cpu || 0), 0) / nodeCount)
    : 0;
  const avgDisk = nodeCount
    ? Math.round(telemetryNodes.reduce((sum, n) => sum + (n.disk || 0), 0) / nodeCount)
    : 0;
  const latencies = telemetryNodes.map((n) => n.latency_ms).filter((v): v is number => v != null);
  const avgLatency = latencies.length
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : null;
  const anomaly = telemetryNodes.find((n) => n.status === 'critical' || (n.cpu || 0) >= 90);

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'triage', icon: ShieldAlert, label: 'Incident Triage' },
    { id: 'automation', icon: Route, label: 'Automation' },
    { id: 'settings', icon: Settings2, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen w-full flex text-[var(--text-primary)]">
      {/* Left Sidebar */}
      <aside className="w-56 flex flex-col h-screen glass-sidebar relative z-20 flex-shrink-0">
        <div className="h-14 px-5 flex items-center gap-2.5 border-b border-white/[0.06]">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00F2FE] to-[#4FACFE] flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-[#050505]" strokeWidth={2.5} />
          </div>
          <span className="font-bold tracking-tight text-sm" style={{ fontFamily: 'var(--font-display)' }}>
            SREAI
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item w-full ${isActive ? 'active' : ''}`}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                <span>{item.label}</span>
              </motion.button>
            );
          })}

          {/* God Mode Link */}
          <div className="pt-3 mt-3 border-t border-white/[0.06]">
            <Link href="/founder-dashboard">
              <motion.div
                className="nav-item w-full group"
                whileHover={{ x: 3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.06), rgba(79, 172, 254, 0.06))',
                  border: '1px solid rgba(0, 242, 254, 0.12)',
                }}
              >
                <Crown className="w-4 h-4 text-[#00F2FE]" strokeWidth={2} />
                <span className="text-[#00F2FE] font-semibold">God Mode</span>
              </motion.div>
            </Link>
          </div>
        </nav>

        {/* Bottom Status */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="glass-panel p-3 flex items-center gap-2.5">
            <div className={`live-indicator ${connected ? '' : 'disconnected'}`} style={{ width: 8, height: 8 }} />
            <div className="min-w-0">
              <div className="text-[0.6875rem] font-semibold text-[var(--text-primary)] leading-tight">
                Agent {connected ? 'Online' : 'Offline'}
              </div>
              <div className="text-[0.5625rem] text-[var(--text-tertiary)] font-mono truncate">
                {nodeCount} node{nodeCount === 1 ? '' : 's'} · {healthPct}% healthy
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col min-w-0">
        {/* Top Bar */}
        <header
          className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-white/[0.06]"
          style={{
            background: 'rgba(5, 5, 8, 0.6)',
            backdropFilter: 'blur(30px)',
          }}
        >
          <div className="flex items-baseline gap-3 min-w-0">
            <h1 className="text-[1.125rem] font-bold tracking-tight truncate" style={{ fontFamily: 'var(--font-display)' }}>
              {activeTab === 'dashboard' ? 'Command Center' : activeTab === 'triage' ? 'Incident Triage' : activeTab === 'automation' ? 'Automation' : 'Settings'}
            </h1>
            <p className="hidden sm:block text-[0.6875rem] text-[var(--text-tertiary)]">
              Real-time infrastructure health
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Critical chip */}
            {criticalCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-semibold"
                style={{
                  background: 'rgba(255, 0, 85, 0.08)',
                  border: '1px solid rgba(255, 0, 85, 0.2)',
                  color: 'var(--crit)',
                }}
              >
                <span className="status-dot critical live" style={{ width: 6, height: 6 }} />
                {criticalCount} critical
              </motion.div>
            )}

            {/* Live Connection */}
            <LiveConnectionIndicator connected={connected} />

            {/* Add Server */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsAddServerOpen(true)}
              className="neon-btn neon-btn-primary text-[0.75rem] py-1.5 px-3.5"
            >
              <Plus size={14} strokeWidth={2.5} /> Add server
            </motion.button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6"
              >
                {/* KPI Row */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  <motion.div variants={fadeUpItem} className="glass-panel hoverable p-4" whileHover={{ scale: 1.03, y: -2 }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="label-small">Global Compute</span>
                      <Cpu className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="text-[1.75rem] font-bold tracking-tight font-mono leading-none text-glow-cyan">{avgCpu}%</div>
                    <div className="mt-3 h-[3px] rounded-full bg-white/6 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(avgCpu, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #00F2FE, #4FACFE)' }}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUpItem} className="glass-panel hoverable p-4" whileHover={{ scale: 1.03, y: -2 }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="label-small">Avg Disk Usage</span>
                      <HardDrive className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="text-[1.75rem] font-bold tracking-tight font-mono leading-none">{avgDisk}%</div>
                    <div className="mt-3 h-[3px] rounded-full bg-white/6 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(avgDisk, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #4FACFE, #7C3AED)' }}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUpItem} className="glass-panel hoverable p-4" whileHover={{ scale: 1.03, y: -2 }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="label-small">Avg Latency</span>
                      <Activity className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="text-[1.75rem] font-bold tracking-tight font-mono leading-none">
                      {avgLatency == null ? '—' : avgLatency >= 1000 ? `${(avgLatency / 1000).toFixed(2)}s` : `${avgLatency}ms`}
                    </div>
                    <div className="mt-3 h-[3px] rounded-full bg-white/6 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(avgLatency == null ? 0 : avgLatency / 10, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #00E676, #00F2FE)' }}
                      />
                    </div>
                  </motion.div>

                  <motion.button
                    variants={fadeUpItem}
                    onClick={() => setActiveTab('triage')}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className={`glass-panel p-4 text-left cursor-pointer ${anomaly ? 'animate-border-glow' : ''}`}
                    style={anomaly ? {
                      borderColor: 'rgba(255, 0, 85, 0.3)',
                      boxShadow: '0 0 20px rgba(255, 0, 85, 0.08)',
                    } : undefined}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="label-small">Active Anomaly</span>
                      <ShieldAlert className={`w-4 h-4 ${anomaly ? 'text-[var(--crit)]' : 'text-[var(--text-tertiary)]'}`} />
                    </div>
                    <div className="text-[1.125rem] font-bold tracking-tight leading-none font-mono truncate">
                      {anomaly ? anomaly.name : 'None'}
                    </div>
                    <div className={`mt-2 text-[0.6875rem] font-semibold ${anomaly ? 'text-[var(--crit)]' : 'text-[var(--ok)]'}`}>
                      {anomaly ? `CPU ${anomaly.cpu}% · ${anomaly.status}` : 'All systems nominal'}
                    </div>
                  </motion.button>
                </div>

                {/* Topology + Terminal */}
                <motion.div variants={fadeUpItem} className="flex gap-6 h-[480px]">
                  <div className="flex-[2] min-w-0 rounded-xl glass-panel overflow-hidden">
                    <NetworkTopology3D />
                  </div>
                  <div className="flex-1 min-w-0 rounded-xl glass-panel overflow-hidden">
                    <LiveTerminal />
                  </div>
                </motion.div>

                {/* Inventory Strip */}
                <motion.div variants={fadeUpItem} className="glass-panel p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[0.8125rem] font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                      <Server className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> Server inventory
                    </h3>
                    <span className="text-[0.6875rem] text-[var(--text-tertiary)] font-mono">{nodeCount} total</span>
                  </div>
                  {telemetryNodes.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-[0.8125rem] text-[var(--text-secondary)]">
                        No servers registered yet. Add your first host to begin live monitoring.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {telemetryNodes.map((srv, i) => {
                        const isCritical = srv.status === 'critical' || (srv.cpu || 0) >= 90;
                        const isWarn = srv.status === 'warning' || (srv.cpu || 0) >= 70;
                        return (
                          <motion.div
                            key={srv.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.05 }}
                            whileHover={{ scale: 1.03, y: -2 }}
                            className="rounded-xl p-3 transition-all"
                            style={{
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: `1px solid ${isCritical ? 'rgba(255, 0, 85, 0.3)' : isWarn ? 'rgba(255, 214, 0, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`,
                              boxShadow: isCritical ? '0 0 15px rgba(255, 0, 85, 0.08)' : 'none',
                            }}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[0.75rem] font-semibold font-mono truncate">{srv.name}</span>
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{
                                  background: isCritical ? 'var(--crit)' : isWarn ? 'var(--warn)' : 'var(--ok)',
                                  boxShadow: isCritical ? '0 0 6px rgba(255, 0, 85, 0.5)' : isWarn ? '0 0 6px rgba(255, 214, 0, 0.4)' : '0 0 6px rgba(0, 230, 118, 0.4)',
                                }}
                              />
                            </div>
                            <div className="text-[0.625rem] text-[var(--text-tertiary)] font-mono truncate mb-2">
                              {srv.ip} · {srv.connection_type}{srv.latency_ms != null ? ` · ${Math.round(srv.latency_ms)}ms` : ''}
                            </div>
                            <div className="flex gap-3 text-[0.625rem] font-mono">
                              <span className={isCritical ? 'text-[var(--crit)]' : isWarn ? 'text-[var(--warn)]' : 'text-[var(--text-secondary)]'}>
                                CPU {Math.round(srv.cpu || 0)}%
                              </span>
                              <span className="text-[var(--text-secondary)]">MEM {Math.round(srv.memory || 0)}%</span>
                              <span className="text-[var(--text-secondary)]">DSK {Math.round(srv.disk || 0)}%</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'triage' && (
              <motion.div
                key="triage"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                className="h-full"
              >
                <IncidentTriage />
              </motion.div>
            )}

            {activeTab === 'automation' && (
              <motion.div
                key="automation"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                className="glass-panel p-8 text-center"
              >
                <Route className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
                <h2 className="text-[1rem] font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  Automation Hub
                </h2>
                <p className="text-[0.8125rem] text-[var(--text-secondary)] max-w-md mx-auto">
                  Runbooks and remediation automation. The backend has active automation endpoints for runbooks, remediation actions, and AI-powered root cause analysis. SSH connections are handled via paramiko for secure remote execution.
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="glass-panel p-4 text-left">
                    <div className="text-lg font-bold font-mono text-[#00F2FE] mb-1">SSH</div>
                    <div className="text-[0.6875rem] text-[var(--text-tertiary)]">
                      Paramiko SSH connections to remote servers for command execution and log streaming
                    </div>
                  </div>
                  <div className="glass-panel p-4 text-left">
                    <div className="text-lg font-bold font-mono text-[#4FACFE] mb-1">AI RCA</div>
                    <div className="text-[0.6875rem] text-[var(--text-tertiary)]">
                      Auto-triggered root cause analysis on ERROR/CRITICAL log keywords
                    </div>
                  </div>
                  <div className="glass-panel p-4 text-left">
                    <div className="text-lg font-bold font-mono text-[#00E676] mb-1">WebSocket</div>
                    <div className="text-[0.6875rem] text-[var(--text-tertiary)]">
                      Real-time telemetry broadcast every 3s + live log streaming
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                className="glass-panel p-8 text-center"
              >
                <Settings2 className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
                <h2 className="text-[1rem] font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>Settings</h2>
                <p className="text-[0.8125rem] text-[var(--text-secondary)]">Connection and monitoring configuration arrives here.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AddServerModal
          isOpen={isAddServerOpen}
          onClose={() => setIsAddServerOpen(false)}
          onSuccess={() => {}}
        />
      </main>
    </div>
  );
}
