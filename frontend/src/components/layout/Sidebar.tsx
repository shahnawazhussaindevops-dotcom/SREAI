'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Network, AlertTriangle, FlaskConical,
  DollarSign, Bot, Shield, BookOpen, Settings, Plug,
  Activity, Terminal, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/infrastructure', label: 'Infrastructure', icon: Network },
  { href: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { href: '/observability', label: 'Observability', icon: Activity },
  { href: '/ai-assistant', label: 'AI Assistant', icon: Bot },
  { href: '/simulation', label: 'Simulation Lab', icon: FlaskConical },
  { href: '/automation', label: 'Automation', icon: Terminal },
  { href: '/cost', label: 'Cost Intelligence', icon: DollarSign },
  { href: '/security', label: 'Security', icon: Shield },
  { href: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
  { href: '/integrations', label: 'Integrations', icon: Plug },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      className="glass-sidebar fixed left-0 top-0 h-screen z-40 flex flex-col"
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#A855F7] flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col"
            >
              <span className="text-base font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                AI SRE
              </span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                Control Tower
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`nav-item ${isActive ? 'active' : ''}`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && item.href === '/incidents' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center justify-center"
                  >
                    3
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          className="nav-item w-full justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}
