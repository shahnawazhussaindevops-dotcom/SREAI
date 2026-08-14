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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]"
        >
          <motion.div
            initial={{ scale: 0.98, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.98, y: 8 }}
            className="glass-panel w-full max-w-lg p-6 relative overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-dim)] rounded-full blur-2xl -mr-8 -mt-8" />

            <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-surface-2)] flex items-center justify-center">
                <Server className="w-4.5 h-4.5 text-[var(--accent)]" />
              </div>
              <div>
                <h2 className="text-[1rem] font-semibold tracking-tight">Add new server</h2>
                <p className="text-[0.6875rem] text-[var(--text-tertiary)]">Register a node for real telemetry & monitoring</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[0.6875rem] font-medium text-[var(--text-secondary)] mb-1.5">Server name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[8px] px-3.5 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors text-[0.8125rem]"
                  placeholder="e.g., prod-web-01"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[0.6875rem] font-medium text-[var(--text-secondary)] mb-1.5">Host / IP address</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[8px] px-3.5 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors text-[0.8125rem] font-mono"
                    placeholder="192.168.1.50"
                    value={formData.ip_address}
                    onChange={e => setFormData({ ...formData, ip_address: e.target.value })}
                  />
                </div>
                <div className="w-24">
                  <label className="block text-[0.6875rem] font-medium text-[var(--text-secondary)] mb-1.5">Port</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[8px] px-3.5 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors text-[0.8125rem] font-mono"
                    value={formData.port}
                    onChange={e => setFormData({ ...formData, port: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.6875rem] font-medium text-[var(--text-secondary)] mb-1.5">Connection type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, connection_type: 'ssh', port: 22 })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[8px] border text-[0.8125rem] font-medium transition-all ${formData.connection_type === 'ssh' ? 'bg-[var(--accent-dim)] border-[var(--border-accent)] text-[var(--accent)]' : 'bg-[var(--bg-surface-2)] border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'}`}
                  >
                    <Key size={15} /> SSH auth
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, connection_type: 'prometheus', port: 9100 })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[8px] border text-[0.8125rem] font-medium transition-all ${formData.connection_type === 'prometheus' ? 'bg-[var(--accent-dim)] border-[var(--border-accent)] text-[var(--accent)]' : 'bg-[var(--bg-surface-2)] border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'}`}
                  >
                    <Network size={15} /> Prometheus
                  </button>
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
                    <label className="block text-[0.6875rem] font-medium text-[var(--text-secondary)] mb-1.5">Username</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[8px] px-3.5 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors text-[0.8125rem]"
                      placeholder="root"
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[0.6875rem] font-medium text-[var(--text-secondary)] mb-1.5">Authentication</label>
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setAuthMethod('password')}
                        className={`flex-1 py-1.5 rounded-[6px] border text-[0.6875rem] font-medium transition-all ${authMethod === 'password' ? 'bg-[var(--accent-dim)] border-[var(--border-accent)] text-[var(--accent)]' : 'bg-[var(--bg-surface-2)] border-[var(--border)] text-[var(--text-tertiary)]'}`}
                      >
                        Password
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMethod('key')}
                        className={`flex-1 py-1.5 rounded-[6px] border text-[0.6875rem] font-medium transition-all ${authMethod === 'key' ? 'bg-[var(--accent-dim)] border-[var(--border-accent)] text-[var(--accent)]' : 'bg-[var(--bg-surface-2)] border-[var(--border)] text-[var(--text-tertiary)]'}`}
                      >
                        Private key
                      </button>
                    </div>

                    {authMethod === 'password' ? (
                      <input
                        type="password"
                        className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[8px] px-3.5 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors text-[0.8125rem]"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                      />
                    ) : (
                      <textarea
                        rows={5}
                        className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[8px] px-3.5 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors text-[0.8125rem] font-mono"
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
                <div className="text-[0.75rem] text-[var(--crit)] border border-[var(--crit)]/30 rounded-[8px] px-3 py-2 bg-[var(--crit)]/8">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-[var(--accent)] text-[#06232E] font-semibold py-2.5 rounded-[8px] hover:brightness-110 active:brightness-95 transition-all flex justify-center items-center disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'Registering...' : 'Register server'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
