'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, ShieldAlert, Cpu, HardDrive, Server, Home 
} from 'lucide-react';
import NetworkTopology3D from '@/components/dashboard/NetworkTopology3D';
import LiveTerminal from '@/components/dashboard/LiveTerminal';
import IncidentTriage from '@/components/dashboard/IncidentTriage';
import AddServerModal from '@/components/dashboard/AddServerModal';
import { Plus, Settings2, Route } from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetry';

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
    <div className="min-h-screen w-full flex text-[var(--text-primary)] bg-[var(--bg-canvas)]">
      {/* Left Sidebar */}
      <aside className="w-56 flex flex-col h-screen glass-sidebar relative z-20 flex-shrink-0">
        <div className="h-14 px-5 flex items-center gap-2.5 border-b border-[var(--border)]">
          <div className="w-6 h-6 rounded-[6px] bg-[var(--accent)]/90 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-[#06232E]" strokeWidth={2.5} />
          </div>
          <span className="font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>SREAI</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item w-full ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <div className="glass-panel p-3 flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-[var(--ok)]' : 'bg-[var(--text-tertiary)]'}`} />
            <div className="min-w-0">
              <div className="text-[0.75rem] font-semibold text-[var(--text-primary)] leading-tight">Agent Online</div>
              <div className="text-[0.6875rem] text-[var(--text-tertiary)] font-mono truncate">
                {nodeCount} node{nodeCount === 1 ? '' : 's'} · {healthPct}% healthy
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-[var(--border)]">
          <div className="flex items-baseline gap-3 min-w-0">
            <h1 className="text-[1.125rem] font-semibold tracking-tight truncate" style={{ fontFamily: 'var(--font-display)' }}>
              {activeTab === 'dashboard' ? 'Command Center' : activeTab === 'triage' ? 'Incident Triage' : activeTab === 'automation' ? 'Automation' : 'Settings'}
            </h1>
            <p className="hidden sm:block text-[0.75rem] text-[var(--text-tertiary)]">
              Real-time infrastructure health
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className={`hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] border text-[0.6875rem] font-medium ${criticalCount > 0 ? 'border-[var(--crit)]/30 text-[var(--crit)] bg-[var(--crit)]/8' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}>
              <span className={`status-dot ${criticalCount > 0 ? 'critical live' : 'healthy'}`} style={{ width: 6, height: 6 }} />
              {criticalCount > 0 ? `${criticalCount} critical` : 'No critical alerts'}
            </div>
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] border border-[var(--border)] text-[0.6875rem] font-medium text-[var(--text-secondary)]">
              <span className={`status-dot ${connected ? 'healthy' : 'offline'}`} style={{ width: 6, height: 6 }} />
              {connected ? 'Live' : 'Reconnecting'}
            </div>
            <button
              onClick={() => setIsAddServerOpen(true)}
              className="flex items-center gap-1.5 text-[0.75rem] font-semibold bg-[var(--accent)] text-[#06232E] px-3 py-1.5 rounded-[6px] hover:brightness-110 active:brightness-95 transition-all"
            >
              <Plus size={14} strokeWidth={2.5} /> Add server
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-6"
              >
                {/* KPI Row */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="glass-panel p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="label-small">Global Compute</span>
                      <Cpu className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="text-[1.75rem] font-semibold tracking-tight font-mono leading-none">{avgCpu}%</div>
                    <div className="mt-2 h-[2px] rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${Math.min(avgCpu, 100)}%` }} />
                    </div>
                  </div>

                  <div className="glass-panel p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="label-small">Avg Disk Usage</span>
                      <HardDrive className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="text-[1.75rem] font-semibold tracking-tight font-mono leading-none">{avgDisk}%</div>
                    <div className="mt-2 h-[2px] rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full bg-[var(--info)] rounded-full" style={{ width: `${Math.min(avgDisk, 100)}%` }} />
                    </div>
                  </div>

                  <div className="glass-panel p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="label-small">Avg Latency</span>
                      <Activity className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="text-[1.75rem] font-semibold tracking-tight font-mono leading-none">
                      {avgLatency == null ? '—' : avgLatency >= 1000 ? `${(avgLatency / 1000).toFixed(2)}s` : `${avgLatency}ms`}
                    </div>
                    <div className="mt-2 h-[2px] rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full bg-[var(--text-secondary)]/60 rounded-full" style={{ width: `${Math.min(avgLatency == null ? 0 : avgLatency / 10, 100)}%` }} />
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('triage')}
                    className={`glass-panel p-4 text-left hoverable-panel cursor-pointer ${anomaly ? 'border-[var(--crit)]/40' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="label-small">Active Anomaly</span>
                      <ShieldAlert className={`w-4 h-4 ${anomaly ? 'text-[var(--crit)]' : 'text-[var(--text-tertiary)]'}`} />
                    </div>
                    <div className="text-[1.125rem] font-semibold tracking-tight leading-none font-mono truncate">
                      {anomaly ? anomaly.name : 'None'}
                    </div>
                    <div className={`mt-2 text-[0.6875rem] font-medium ${anomaly ? 'text-[var(--crit)]' : 'text-[var(--ok)]'}`}>
                      {anomaly ? `CPU ${anomaly.cpu}% · ${anomaly.status}` : 'All systems nominal'}
                    </div>
                  </button>
                </div>

                {/* Topology + Terminal */}
                <div className="flex gap-6 h-[480px]">
                  <div className="flex-[2] min-w-0 rounded-xl glass-panel overflow-hidden">
                    <NetworkTopology3D />
                  </div>
                  <div className="flex-1 min-w-0 rounded-xl glass-panel overflow-hidden">
                    <LiveTerminal />
                  </div>
                </div>

                {/* Inventory Strip */}
                <div className="glass-panel p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[0.8125rem] font-semibold flex items-center gap-2">
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
                      {telemetryNodes.map((srv) => {
                        const isCritical = srv.status === 'critical' || (srv.cpu || 0) >= 90;
                        const isWarn = srv.status === 'warning' || (srv.cpu || 0) >= 70;
                        return (
                          <div key={srv.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface-2)] p-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[0.75rem] font-semibold font-mono truncate">{srv.name}</span>
                              <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-[var(--crit)]' : isWarn ? 'bg-[var(--warn)]' : 'bg-[var(--ok)]'}`} />
                            </div>
                            <div className="text-[0.6875rem] text-[var(--text-tertiary)] font-mono truncate mb-2">
                              {srv.ip} · {srv.connection_type}{srv.latency_ms != null ? ` · ${Math.round(srv.latency_ms)}ms` : ''}
                            </div>
                            <div className="flex gap-3 text-[0.6875rem] font-mono">
                              <span className={isCritical ? 'text-[var(--crit)]' : isWarn ? 'text-[var(--warn)]' : 'text-[var(--text-secondary)]'}>CPU {Math.round(srv.cpu || 0)}%</span>
                              <span className="text-[var(--text-secondary)]">MEM {Math.round(srv.memory || 0)}%</span>
                              <span className="text-[var(--text-secondary)]">DSK {Math.round(srv.disk || 0)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'triage' && (
              <motion.div
                key="triage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <IncidentTriage />
              </motion.div>
            )}

            {activeTab === 'automation' && (
              <motion.div
                key="automation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="glass-panel p-8 text-center"
              >
                <Route className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
                <h2 className="text-[1rem] font-semibold mb-1">Automation Hub</h2>
                <p className="text-[0.8125rem] text-[var(--text-secondary)]">Runbooks and remediation automation arrive here.</p>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="glass-panel p-8 text-center"
              >
                <Settings2 className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
                <h2 className="text-[1rem] font-semibold mb-1">Settings</h2>
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
