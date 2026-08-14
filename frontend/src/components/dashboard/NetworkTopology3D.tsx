'use client';

import React, { useRef, useMemo, useState, useEffect, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useTelemetryStore, TelemetryNode } from '@/store/telemetry';

interface NodeData {
  id: string;
  position: THREE.Vector3;
  status: 'healthy' | 'warning' | 'critical';
  name: string;
  ip: string;
  cpu: number;
  memory: number;
  disk: number;
  latencyMs: number | null;
  connectionType: string;
}

// Keep a stable position map so nodes don't jump around when metrics update.
const nodePositions = new Map<string, THREE.Vector3>();

const colorForStatus = (s: NodeData['status']) =>
  s === 'critical' ? '#F87171' : s === 'warning' ? '#FBBF24' : '#34D399';

// Status is derived from REAL metrics (CPU thresholds per spec) plus SSH errors.
const deriveStatus = (s: TelemetryNode): NodeData['status'] => {
  if (s.status === 'critical') return 'critical';
  const cpu = s.cpu || 0;
  if (cpu >= 90) return 'critical';
  if (cpu >= 70) return 'warning';
  return 'healthy';
};

const Node = ({ data, onHover, onUnhover, onClick }: {
  data: NodeData;
  onHover: (d: NodeData | null) => void;
  onUnhover: () => void;
  onClick: (id: string) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = colorForStatus(data.status);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (data.status === 'critical') {
      const scale = 1 + Math.sin(t * 10) * 0.15;
      meshRef.current.scale.setScalar(scale);
      mat.emissiveIntensity = 2 + Math.sin(t * 10);
    } else if (data.status === 'warning') {
      const scale = 1 + Math.sin(t * 5) * 0.08;
      meshRef.current.scale.setScalar(scale);
      mat.emissiveIntensity = 1.5 + Math.sin(t * 5) * 0.4;
    } else {
      const scale = 1 + Math.sin(t * 2) * 0.05;
      meshRef.current.scale.setScalar(scale);
      mat.emissiveIntensity = 1 + Math.sin(t * 2) * 0.2;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={data.position}
      onPointerOver={(e) => { e.stopPropagation(); onHover(data); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { onUnhover(); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onClick(data.id); }}
    >
      <sphereGeometry args={[data.status === 'critical' ? 0.6 : 0.4, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={data.status === 'critical' ? 2 : 1}
        transparent
        opacity={0.9}
        roughness={0.2}
        metalness={0.8}
      />
      <Html distanceFactor={12} position={[0, 1.1, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="px-2 py-0.5 rounded bg-[#0B0D10]/80 border border-white/10 text-[10px] text-white whitespace-nowrap font-mono">
          {data.name}
        </div>
      </Html>
    </mesh>
  );
};

const Connections = ({ nodes }: { nodes: NodeData[] }) => {
  // Fully-connected topology; line color/width reflect REAL latency between
  // the dashboard and each node (SSH handshake / metrics fetch time).
  const lines = useMemo(() => {
    const l = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const lat = Math.max(a.latencyMs ?? 0, b.latencyMs ?? 0);
        let color = 'rgba(52, 211, 153, 0.12)';
        let width = 1;
        if (lat >= 300 || a.status === 'critical' || b.status === 'critical') {
          color = 'rgba(248, 113, 113, 0.4)';
          width = 2;
        } else if (lat >= 100 || a.status === 'warning' || b.status === 'warning') {
          color = 'rgba(251, 191, 36, 0.35)';
          width = 1.5;
        }
        l.push(
          <Line
            key={`${a.id}-${b.id}`}
            points={[a.position, b.position]}
            color={color}
            lineWidth={width}
            transparent
            opacity={0.7}
          />
        );
      }
    }
    return l;
  }, [nodes]);

  return <>{lines}</>;
};

// Auto-rotate the scene slowly
const SceneRig = ({ children }: { children: React.ReactNode }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });
  return <group ref={groupRef}>{children}</group>;
};

export default function NetworkTopology3D() {
  const liveNodes = useTelemetryStore((s) => s.nodes);
  const connect = useTelemetryStore((s) => s.connect);
  const [hoveredNode, setHoveredNode] = useState<NodeData | null>(null);

  useEffect(() => {
    connect();
  }, [connect]);

  // Pre-generate random positions once per node so render stays pure.
  useLayoutEffect(() => {
    for (const server of liveNodes) {
      if (!nodePositions.has(server.id)) {
        nodePositions.set(
          server.id,
          new THREE.Vector3(
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 12
          )
        );
      }
    }
  }, [liveNodes]);

  const nodes: NodeData[] = useMemo(() => {
    return liveNodes.map((server) => ({
      id: server.id,
      position: nodePositions.get(server.id) ?? new THREE.Vector3(0, 0, 0),
      status: deriveStatus(server),
      name: server.name,
      ip: server.ip,
      cpu: server.cpu || 0,
      memory: server.memory || 0,
      disk: server.disk || 0,
      latencyMs: server.latency_ms,
      connectionType: server.connection_type,
    }));
  }, [liveNodes]);

  const formatLatency = (ms: number | null) =>
    ms == null ? '—' : ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden glass-panel">
      {/* HUD Layer for Tooltips */}
      {hoveredNode && (
        <div className="absolute top-4 left-4 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-tooltip"
          >
            <div className="font-bold text-sm mb-0.5">{hoveredNode.name}</div>
            <div className="font-mono text-[10px] text-[var(--text-tertiary)] mb-2">{hoveredNode.ip}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${hoveredNode.status === 'critical' ? 'bg-[#F87171]' : hoveredNode.status === 'warning' ? 'bg-[#FBBF24]' : 'bg-[#34D399]'}`} />
              <span className="uppercase tracking-wider opacity-80">{hoveredNode.status}</span>
              <span className="ml-2 font-mono text-[10px]">↕ {formatLatency(hoveredNode.latencyMs)}</span>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between gap-4 text-xs">
                <span className="text-[var(--text-tertiary)]">CPU</span>
                <span className={`font-mono ${hoveredNode.cpu >= 90 ? 'text-[#F87171]' : hoveredNode.cpu >= 70 ? 'text-[#FBBF24]' : 'text-[#34D399]'}`}>{hoveredNode.cpu}%</span>
              </div>
              <div className="progress-bar w-32 bg-white/10">
                <div className={`progress-bar-fill ${hoveredNode.cpu >= 90 ? 'bg-[#F87171]' : hoveredNode.cpu >= 70 ? 'bg-[#FBBF24]' : 'bg-[var(--accent)]'}`} style={{ width: `${Math.min(hoveredNode.cpu, 100)}%` }} />
              </div>

              <div className="flex justify-between gap-4 text-xs mt-2">
                <span className="text-[var(--text-tertiary)]">MEM</span>
                <span className={`font-mono ${hoveredNode.memory > 80 ? 'text-[#F87171]' : ''}`}>{hoveredNode.memory}%</span>
              </div>
              <div className="progress-bar w-32 bg-white/10">
                <div className={`progress-bar-fill ${hoveredNode.memory > 80 ? 'bg-[#F87171]' : 'bg-[var(--info)]'}`} style={{ width: `${Math.min(hoveredNode.memory, 100)}%` }} />
              </div>

              <div className="flex justify-between gap-4 text-xs mt-2">
                <span className="text-[var(--text-tertiary)]">DISK</span>
                <span className={`font-mono ${hoveredNode.disk > 80 ? 'text-[#F87171]' : ''}`}>{hoveredNode.disk}%</span>
              </div>
              <div className="progress-bar w-32 bg-white/10">
                <div className={`progress-bar-fill ${hoveredNode.disk > 80 ? 'bg-[#F87171]' : 'bg-[var(--info)]'}`} style={{ width: `${Math.min(hoveredNode.disk, 100)}%` }} />
              </div>
            </div>

            {hoveredNode.status === 'critical' && (
              <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-[#F87171] uppercase font-bold text-center">
                Click for AI Triage
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Title */}
      <div className="absolute bottom-4 left-4 z-10">
        <h3 className="text-[0.8125rem] font-semibold tracking-tight text-[var(--text-primary)]">
          Live topology map
        </h3>
        <p className="text-[0.6875rem] text-[var(--text-tertiary)] font-mono">
          {nodes.length} node{nodes.length === 1 ? '' : 's'} · real telemetry every 3s
        </p>
      </div>

      <Canvas camera={{ position: [0, 0, 15], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <SceneRig>
          {nodes.map((node) => (
            <Node
              key={node.id}
              data={node}
              onHover={setHoveredNode}
              onUnhover={() => setHoveredNode(null)}
              onClick={(id) => setHoveredNode((prev) => prev && prev.id === id ? prev : node)}
            />
          ))}
          <Connections nodes={nodes} />
        </SceneRig>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={5}
          maxDistance={30}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
