'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Server, Key, Network } from 'lucide-react';
import { api, ServerPayload } from '@/lib/api';

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddServerModal({ isOpen, onClose, onSuccess }: AddServerModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    ip_address: string;
    connection_type: 'ssh' | 'prometheus';
    port: number;
    username: string;
    password: string;
    private_key: string;
  }>({
    name: '',
    ip_address: '',
    connection_type: 'ssh',
    port: 22,
    username: '',
    password: '',
    private_key: '',
  });
  const [authMethod, setAuthMethod] = useState<'password' | 'key'>('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload: ServerPayload = {
        name: formData.name.trim(),
        ip_address: formData.ip_address.trim(),
        connection_type: formData.connection_type,
        port: Number(formData.port) || (formData.connection_type === 'ssh' ? 22 : 9100),
      };
      if (formData.connection_type === 'ssh') {
        payload.username = formData.username.trim() || null;
        if (authMethod === 'key') {
          payload.private_key = formData.private_key;
          payload.password = null;
        } else {
          payload.password = formData.password;
          payload.private_key = null;
        }
      }
      await api.addServer(payload);
      onSuccess();
      onClose();
      setFormData({ name: '', ip_address: '', connection_type: 'ssh', port: 22, username: '', password: '', private_key: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay"
        >
          <motion.div
            initial={{ scale: 0.95, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 16, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="glass-panel w-full max-w-lg p-6 relative overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Accent glow */}
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-12 -mt-12 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(0, 242, 254, 0.12), transparent 70%)',
              }}
            />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(79, 172, 254, 0.15))',
                  border: '1px solid rgba(0, 242, 254, 0.2)',
                }}
              >
                <Server className="w-4.5 h-4.5 text-[#00F2FE]" />
              </div>
              <div>
                <h2 className="text-[1rem] font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  Add new server
                </h2>
                <p className="text-[0.6875rem] text-[var(--text-tertiary)]">
                  Register a node for real telemetry & monitoring
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[0.6875rem] font-medium text-[var(--text-secondary)] mb-1.5">
                  Server name
                </label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  placeholder="e.g., prod-web-01"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[0.6875rem] font-medium text-[var(--text-secondary)] mb-1.5">
                    Host / IP address
                  </label>
                  <input
                    type="text"
                    required
                    className="glass-input font-mono"
                    placeholder="192.168.1.50"
                    value={formData.ip_address}
                    onChange={e => setFormData({ ...formData, ip_address: e.target.value })}
                  />
                </div>
                <div className="w-24">
                  <label className="block text-[0.6875rem] font-medium text-[var(--text-secondary)] mb-1.5">
                    Port
                  </label>
                  <input
                    type="number"
                    required
                    className="glass-input font-mono"
                    value={formData.port}
                    onChange={e => setFormData({ ...formData, port: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.6875rem] font-medium text-[var(--text-secondary)] mb-1.5">
                  Connection type
                </label>
                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, connection_type: 'ssh', port: 22 })}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[0.8125rem] font-medium transition-all"
                    style={{
                      background: formData.connection_type === 'ssh' ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${formData.connection_type === 'ssh' ? 'rgba(0, 242, 254, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: formData.connection_type === 'ssh' ? '#00F2FE' : 'var(--text-tertiary)',
                    }}
                  >
                    <Key size={15} /> SSH auth
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, connection_type: 'prometheus', port: 9100 })}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[0.8125rem] font-medium transition-all"
                    style={{
                      background: formData.connection_type === 'prometheus' ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${formData.connection_type === 'prometheus' ? 'rgba(0, 242, 254, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: formData.connection_type === 'prometheus' ? '#00F2FE' : 'var(--text-tertiary)',
                    }}
                  >
                    <Network size={15} /> Prometheus
                  </motion.button>
                </div>
                <p className="text-[0.625rem] text-[var(--text-tertiary)] mt-1.5">
                  {formData.connection_type === 'ssh'
                    ? 'SREAI polls real SSH commands (top/free/df/journalctl) on this host.'
                    : 'SREAI scrapes http://<ip>:<port>/metrics (Prometheus node_exporter).'}
                </p>
              </div>

              {formData.connection_type === 'ssh' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[0.6875rem] font-medium text-[var(--text-secondary)] mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      className="glass-input"
                      placeholder="root"
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[0.6875rem] font-medium text-[var(--text-secondary)] mb-1.5">
                      Authentication
                    </label>
                    <div className="flex gap-2 mb-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAuthMethod('password')}
                        className="flex-1 py-2 rounded-lg text-[0.6875rem] font-medium transition-all"
                        style={{
                          background: authMethod === 'password' ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${authMethod === 'password' ? 'rgba(0, 242, 254, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
                          color: authMethod === 'password' ? '#00F2FE' : 'var(--text-tertiary)',
                        }}
                      >
                        Password
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAuthMethod('key')}
                        className="flex-1 py-2 rounded-lg text-[0.6875rem] font-medium transition-all"
                        style={{
                          background: authMethod === 'key' ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${authMethod === 'key' ? 'rgba(0, 242, 254, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
                          color: authMethod === 'key' ? '#00F2FE' : 'var(--text-tertiary)',
                        }}
                      >
                        Private key
                      </motion.button>
                    </div>

                    {authMethod === 'password' ? (
                      <input
                        type="password"
                        className="glass-input"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                      />
                    ) : (
                      <textarea
                        rows={5}
                        className="glass-input font-mono"
                        placeholder={'-----BEGIN OPENSSH PRIVATE KEY-----\n...'}
                        value={formData.private_key}
                        onChange={e => setFormData({ ...formData, private_key: e.target.value })}
                      />
                    )}
                    <p className="text-[0.625rem] text-[var(--text-tertiary)] mt-1.5">
                      Credentials are encrypted (Fernet) on the backend before storage.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[0.75rem] font-medium rounded-xl px-4 py-2.5"
                  style={{
                    color: 'var(--crit)',
                    background: 'rgba(255, 0, 85, 0.06)',
                    border: '1px solid rgba(255, 0, 85, 0.15)',
                  }}
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="neon-btn neon-btn-primary w-full mt-6 py-3 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'Registering...' : 'Register server'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
