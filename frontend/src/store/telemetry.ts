'use client';

import { create } from 'zustand';

export interface TelemetryNode {
  id: string;
  name: string;
  ip: string;
  connection_type: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  cpu: number;
  memory: number;
  disk: number;
  latency_ms: number | null;
  uptime: string | null;
}

interface TelemetryState {
  nodes: TelemetryNode[];
  connected: boolean;
  lastUpdate: number | null;
  criticalCount: number;
  healthPct: number;
  connect: () => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/telemetry';

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function openConnection(set: (partial: Partial<TelemetryState>) => void) {
  const connect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

    ws = new WebSocket(WS_URL);
    ws.onopen = () => set({ connected: true });
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'telemetry' && Array.isArray(data.nodes)) {
          const nodes: TelemetryNode[] = data.nodes;
          const criticalCount = nodes.filter(
            (n) => n.status === 'critical' || (n.cpu || 0) >= 90
          ).length;
          const healthy = nodes.filter((n) => n.status === 'healthy').length;
          const healthPct = nodes.length
            ? Math.round((healthy / nodes.length) * 100)
            : 100;
          set({ nodes, lastUpdate: Date.now(), criticalCount, healthPct });
        }
      } catch {
        /* ignore malformed frames */
      }
    };
    ws.onclose = () => {
      set({ connected: false });
      reconnectTimer = setTimeout(connect, 3000);
    };
    ws.onerror = () => ws?.close();
  };

  connect();
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  nodes: [],
  connected: false,
  lastUpdate: null,
  criticalCount: 0,
  healthPct: 100,
  connect: () => openConnection(set),
}));
