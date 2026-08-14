'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Copy, Terminal as TerminalIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

interface ServerOption {
  id: string;
  name: string;
  ip_address: string;
  connection_type: string;
}

interface LogEntry {
  id: string;
  server_id: string;
  server_name?: string;
  timestamp: string;
  level: string;
  message: string;
  raw: string;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/logs';

const highlightLog = (log: LogEntry) => {
  const getLevelClass = (level: string) => {
    if (level === 'ERROR' || level === 'CRITICAL' || level === 'FAIL') return 'log-error';
    if (level === 'WARN') return 'log-warn';
    return '';
  };

  const ipRegex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g;
  const parts = log.message.split(ipRegex);

  return (
    <span>
      <span className="log-timestamp">[{log.timestamp}]</span>
      <span className={`mr-3 ${getLevelClass(log.level)}`}>[{log.level}]</span>
      <span className="mr-3 text-[var(--text-tertiary)]">{log.server_name || log.server_id}</span>
      <span>
        {parts.map((part, i) => {
          if (ipRegex.test(part)) {
            return <span key={i} className="log-ip">{part}</span>;
          }
          if (/(FAIL|ERROR|CRITICAL)/.test(part)) {
            return <span key={i} className="log-error font-bold">{part}</span>;
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    </span>
  );
};

export default function LiveTerminal() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [servers, setServers] = useState<ServerOption[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>('all');
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const selectedRef = useRef(selectedServer);

  useEffect(() => {
    selectedRef.current = selectedServer;
  }, [selectedServer]);

  // Load the real server inventory for the selector.
  useEffect(() => {
    api.getServers()
      .then((list) => setServers(list))
      .catch(() => setServers([]));
  }, []);

  const sendSubscribe = useCallback((ws: WebSocket) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'subscribe', server_id: selectedRef.current === 'all' ? null : selectedRef.current }));
    }
  }, []);

  // Stream real log lines via WebSocket, filtered by the selected server.
  useEffect(() => {
    let ws: WebSocket;
    const connect = () => {
      ws = new WebSocket(WS_URL);
      ws.onopen = () => {
        wsRef.current = ws;
        sendSubscribe(ws);
      };
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type !== 'log') return;
        setLogs((prev) => {
          const next: LogEntry[] = [...prev, {
            id: Math.random().toString(36).substring(7),
            server_id: msg.server_id,
            server_name: msg.server_name,
            timestamp: msg.timestamp,
            level: msg.level,
            message: msg.message,
            raw: `[${msg.timestamp}] [${msg.level}] [${msg.server_id}] ${msg.message}`,
          }];
          if (next.length > 50000) return next.slice(next.length - 50000);
          return next;
        });
      };
      ws.onclose = () => {
        setTimeout(connect, 3000);
      };
      ws.onerror = () => ws?.close();
    };
    connect();

    return () => { if (ws) ws.close(); };
  }, [sendSubscribe]);

  // Re-subscribe when the selected server changes.
  const handleServerChange = (id: string) => {
    setSelectedServer(id);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', server_id: id === 'all' ? null : id }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const itemContent = useCallback((index: number, log: LogEntry) => {
    return (
      <div
        className="log-line group flex items-start justify-between py-[2px]"
        onClick={() => copyToClipboard(log.raw)}
      >
        <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
          {highlightLog(log)}
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-[var(--text-tertiary)] hover:text-white shrink-0">
          <Copy size={12} />
        </button>
      </div>
    );
  }, []);

  const selectedLabel = selectedServer === 'all'
    ? 'all servers'
    : (servers.find((s) => s.id === selectedServer)?.name || 'selected server');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="h-full flex flex-col relative overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <TerminalIcon size={14} className="text-[var(--text-tertiary)] shrink-0" />
          <span className="text-[0.75rem] font-mono text-[var(--text-secondary)] truncate">
            sreai-terminal@{selectedLabel}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <select
              value={selectedServer}
              onChange={(e) => handleServerChange(e.target.value)}
              className="bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[6px] px-2 py-1 text-[0.6875rem] font-mono text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-accent)] cursor-pointer"
            >
              <option value="all">All servers</option>
              {servers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.ip_address}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => setAutoScroll(!autoScroll)}>
            <div className={`w-1.5 h-1.5 rounded-full ${autoScroll ? 'bg-[var(--ok)]' : 'bg-[var(--text-tertiary)]'}`} />
            <span className="text-[0.625rem] text-[var(--text-tertiary)] font-medium">Follow</span>
          </div>
        </div>
      </div>

      <div className="flex-1 terminal-window relative w-full overflow-hidden p-2">
        {logs.length > 0 ? (
          <Virtuoso
            ref={virtuosoRef}
            data={logs}
            itemContent={itemContent}
            followOutput={autoScroll ? 'smooth' : false}
            style={{ height: '100%' }}
            className="terminal-list"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-[var(--text-tertiary)] text-[0.75rem] font-mono px-6 text-center">
            Waiting for log stream — add a server to begin receiving real journalctl/syslog output...
          </div>
        )}
      </div>
    </motion.div>
  );
}
