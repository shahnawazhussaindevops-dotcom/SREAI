'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  Crown,
  Plus,
  Settings2,
  ShieldAlert,
  Home,
  Route,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useTelemetryStore } from '@/store/telemetry';
import LiveConnectionIndicator from '@/components/ui/LiveConnectionIndicator';
import GlobalHealthOrbit from '@/components/founder/GlobalHealthOrbit';
import StackMatrix from '@/components/founder/StackMatrix';
import ProcessRadar from '@/components/founder/ProcessRadar';
import AITranslator from '@/components/founder/AITranslator';

export default function FounderDashboardPage() {
  const nodes = useTelemetryStore((s) => s.nodes);
  const connected = useTelemetryStore((s) => s.connected);
  const connect = useTelemetryStore((s) => s.connect);
  const criticalCount = useTelemetryStore((s) => s.criticalCount);

  useEffect(() => {
    connect();
  }, [connect]);

  return (
    <div className="min-h-screen w-full flex flex-col text-[var(--text-primary)]">
      {/* Void Background */}
      <div className="void-bg" />

      {/* Top Header Bar */}
      <header
        className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 border-b border-white/[0.06]"
        style={{
          background: 'rgba(5, 5, 8, 0.7)',
          backdropFilter: 'blur(40px) saturate(1.3)',
        }}
      >
        <div className="flex items-center gap-4 min-w-0">
          {/* Back to main dashboard */}
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">Back</span>
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00F2FE] to-[#4FACFE] flex items-center justify-center">
              <Crown className="w-4 h-4 text-[#050505]" />
            </div>
            <div className="hidden sm:block">
              <h1
                className="text-base font-bold tracking-tight leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                God Mode
              </h1>
              <p className="text-[0.5625rem] text-[var(--text-tertiary)] uppercase tracking-[0.12em]">
                Founder Dashboard
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Critical alerts */}
          {criticalCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[0.6875rem] font-semibold"
              style={{
                background: 'rgba(255, 0, 85, 0.08)',
                border: '1px solid rgba(255, 0, 85, 0.2)',
                color: 'var(--crit)',
              }}
            >
              <span className="status-dot critical live" style={{ width: 7, height: 7 }} />
              {criticalCount} critical
            </motion.div>
          )}

          {/* Live Connection */}
          <LiveConnectionIndicator connected={connected} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-[1600px] mx-auto flex flex-col gap-6"
        >
          {/* Zone 1: Global Health Orbit */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 mb-4"
            >
              <Zap className="w-4 h-4 text-[#00F2FE]" />
              <h2
                className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Global Health Orbit
              </h2>
            </motion.div>
            <GlobalHealthOrbit nodes={nodes} />
          </section>

          {/* Zone 2: Stack Matrix */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mb-4"
            >
              <Activity className="w-4 h-4 text-[#4FACFE]" />
              <h2
                className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Stack Matrix
              </h2>
            </motion.div>
            <StackMatrix nodes={nodes} />
          </section>

          {/* Zone 3: Process Radar + AI Translator */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProcessRadar nodes={nodes} />
            <AITranslator nodes={nodes} />
          </section>
        </motion.div>
      </main>
    </div>
  );
}
