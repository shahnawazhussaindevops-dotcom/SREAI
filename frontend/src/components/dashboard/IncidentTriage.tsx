'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Terminal, Bot, Play, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, AnalyzeResult, RemediationResult } from '@/lib/api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/logs';

interface LogMsg {
  server_id: string;
  server_name?: string;
  level: string;
  message: string;
  timestamp: string;
}

interface TriggerMsg {
  type: 'ai_trigger';
  server_id: string;
  server_name: string;
  specs: Record<string, unknown>;
  log_chunk: string;
  timestamp: string;
}

export default function IncidentTriage() {
  const [logs, setLogs] = useState<LogMsg[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [rcaResult, setRcaResult] = useState<AnalyzeResult | null>(null);
  const [rcaMeta, setRcaMeta] = useState<{ server_id: string; server_name: string } | null>(null);
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState<RemediationResult | null>(null);
  const analyzingRef = useRef(false);

  const runRCA = async (logChunk: string, serverId: string, serverName?: string, specs?: Record<string, unknown>) => {
    if (analyzingRef.current) return;
    analyzingRef.current = true;
    setAnalyzing(true);
    setRcaResult(null);
    setExecResult(null);
    try {
      const data = await api.aiAnalyzeLog({ server_id: serverId, log_chunk: logChunk, server_name: serverName, specs });
      setRcaResult(data);
      setRcaMeta({ server_id: serverId, server_name: data.server_name || serverName || serverId });
    } catch (e) {
      setRcaResult({ explanation: `Failed to contact AI engine: ${e instanceof Error ? e.message : String(e)}`, remediation_script: 'N/A' });
      setRcaMeta({ server_id: serverId, server_name: serverName || serverId });
    } finally {
      analyzingRef.current = false;
      setAnalyzing(false);
    }
  };

  // Listen for real log lines AND backend `ai_trigger` events -> auto RCA.
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => ws.send(JSON.stringify({ type: 'subscribe', server_id: null }));
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'ai_trigger') {
        const trigger: TriggerMsg = msg;
        setLogs((prev) => [
          ...prev.slice(-49),
          { server_id: trigger.server_id, server_name: trigger.server_name, level: 'ERROR', message: trigger.log_chunk, timestamp: trigger.timestamp },
        ]);
        runRCA(trigger.log_chunk, trigger.server_id, trigger.server_name, trigger.specs);
      } else if (msg.type === 'log') {
        setLogs((prev) => [...prev.slice(-49), msg]);
      }
    };
    return () => ws.close();
  }, []);

  const executeRemediation = async () => {
    if (!rcaResult || !rcaMeta || !rcaResult.remediation_script) return;
    const confirmed = window.confirm(
      `Execute this remediation script on real server "${rcaMeta.server_name}" (${rcaMeta.server_id}) over SSH?\n\nDestructive commands will run with the registered user's permissions.`
    );
    if (!confirmed) return;

    setExecuting(true);
    setExecResult(null);
    try {
      const data = await api.executeRemediation({ server_id: rcaMeta.server_id, script: rcaResult.remediation_script });
      setExecResult(data);
    } catch (e) {
      setExecResult({ status: 'failure', exit_code: null, stdout: '', stderr: e instanceof Error ? e.message : 'Remediation request failed' });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden w-full max-w-full">
      {/* Left: Live Error Stream */}
      <div className="flex-1 glass-panel flex flex-col relative overflow-hidden min-h-0">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[var(--crit)]" />
            <span className="text-[0.8125rem] font-semibold">Error telemetry stream</span>
          </div>
          <span className="status-dot critical live" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 font-mono text-[0.8125rem] space-y-2 terminal-window">
          {logs.length === 0 ? (
            <div className="text-[var(--text-tertiary)]">
              Waiting for real errors... (Try adding a server with incorrect SSH credentials or failing service)
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className={`p-2 rounded-md border ${log.level === 'CRITICAL' || log.level === 'ERROR' ? 'border-[var(--crit)]/25 bg-[var(--crit)]/6 text-[var(--crit)]' : log.level === 'WARN' ? 'border-[var(--warn)]/25 text-[var(--warn)]' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}>
                <div className="flex justify-between text-[0.625rem] opacity-70 mb-1">
                  <span>{log.timestamp}</span>
                  <span>{log.server_name || log.server_id}</span>
                </div>
                <div className="break-all">{log.message}</div>
                {(log.level === 'CRITICAL' || log.level === 'ERROR') && (
                  <button
                    onClick={() => runRCA(log.message, log.server_id, log.server_name)}
                    className="mt-2 text-[0.6875rem] font-semibold border border-[var(--crit)]/40 text-[var(--crit)] hover:bg-[var(--crit)] hover:text-white px-2.5 py-1 rounded-[6px] transition-colors"
                  >
                    Analyze with AI
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: AI Agent Triage */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto min-h-0">
        <div className="glass-panel p-6 flex-1 flex flex-col relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-[8px] bg-[var(--accent-dim)] flex items-center justify-center">
              <Bot className="w-4.5 h-4.5 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-[0.9375rem] font-semibold tracking-tight">RCA Agent</h2>
              <div className="text-[0.6875rem] text-[var(--text-tertiary)]">
                {rcaMeta ? `Analyzing: ${rcaMeta.server_name}` : 'Auto-triggers on error keywords'}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {analyzing ? (
              <div className="flex flex-col items-center justify-center text-[var(--accent)]">
                <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                <div className="mt-4 font-mono text-[0.75rem]">Running root cause analysis...</div>
              </div>
            ) : rcaResult ? (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div>
                    <h3 className="text-[0.6875rem] font-semibold text-[var(--text-tertiary)] mb-2">Root cause</h3>
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface-2)] p-4 text-[0.8125rem] leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap">
                      {rcaResult.explanation}
                    </div>
                  </div>

                  {rcaResult.remediation_script && rcaResult.remediation_script !== 'N/A' && (
                    <div>
                      <h3 className="text-[0.6875rem] font-semibold text-[var(--text-tertiary)] mb-2 flex items-center gap-1.5">
                        <Terminal size={13} /> Suggested remediation
                      </h3>
                      <div className="rounded-lg border border-[var(--border-accent)] bg-[#0B0D10] p-4 font-mono text-[0.75rem] text-[var(--accent)] overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{rcaResult.remediation_script}</pre>
                      </div>

                      {!execResult && (
                        <button
                          onClick={executeRemediation}
                          disabled={executing}
                          className="w-full mt-4 bg-[var(--accent)] text-[#06232E] font-semibold py-2.5 rounded-[8px] hover:brightness-110 active:brightness-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {executing ? 'Executing on remote server...' : <><Play size={16} /> Execute remediation on {rcaMeta?.server_name}</>}
                        </button>
                      )}
                    </div>
                  )}

                  {execResult && (
                    <div className="space-y-2">
                      <div className={`flex items-center gap-2 text-[0.8125rem] font-semibold ${execResult.status === 'success' ? 'text-[var(--ok)]' : 'text-[var(--crit)]'}`}>
                        {execResult.status === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        {execResult.status === 'success' ? 'Remediation executed successfully' : `Remediation failed (exit ${execResult.exit_code ?? 'N/A'})`}
                      </div>
                      {(execResult.stdout || execResult.stderr) && (
                        <pre className="rounded-lg border border-[var(--border)] bg-[#0B0D10] p-3 font-mono text-[0.6875rem] text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                          {execResult.stdout || ''}{execResult.stderr ? `\n[stderr]\n${execResult.stderr}` : ''}
                        </pre>
                      )}
                      <button
                        onClick={() => { setExecResult(null); setRcaResult(null); }}
                        className="text-[0.6875rem] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] underline"
                      >
                        Dismiss result
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="text-center text-[var(--text-tertiary)] my-auto">
                <ShieldAlert className="w-10 h-10 mx-auto mb-4 opacity-25" />
                <p className="text-[0.8125rem] max-w-sm mx-auto">
                  RCA runs automatically when ERROR / CRITICAL / FATAL / EXCEPTION is detected in the real log stream.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
