'use client';

import { motion } from 'framer-motion';
import { Bell, Search, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function Topbar() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [environment] = useState('All Environments');

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 border-b border-white/[0.06]" style={{ background: 'rgba(11, 12, 16, 0.8)', backdropFilter: 'blur(20px)' }}>
      {/* Left: Environment selector */}
      <div className="flex items-center gap-4">
        <div className="glass-panel-static flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:border-white/[0.12] transition-colors rounded-lg" style={{ borderRadius: '8px' }}>
          <div className="w-2 h-2 rounded-full bg-[var(--accent-green)]" />
          <span className="text-[var(--text-secondary)]">{environment}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors"
        >
          <Search className="w-[18px] h-[18px]" />
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--accent-red)]" />
        </motion.button>

        {/* User */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'SC'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-sm font-medium">{user?.name || 'Sarah Chen'}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] capitalize">{user?.role || 'admin'}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)] hidden md:block" />
          </motion.button>

          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 top-full mt-2 w-48 glass-panel-static p-2 shadow-2xl"
              style={{ borderRadius: '12px' }}
            >
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-red)] hover:bg-white/[0.04] rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
