const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `API Error: ${res.status}`);
  }

  return res.json();
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  org_id: string;
  org_name: string;
  avatar_url?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Server {
  id: string;
  name: string;
  ip_address: string;
  connection_type: 'ssh' | 'prometheus';
  port?: number;
  status?: string;
  cpu?: number;
  memory?: number;
  disk?: number;
  latency_ms?: number | null;
  last_seen?: string | null;
}

export interface ServerPayload {
  name: string;
  ip_address: string;
  connection_type: 'ssh' | 'prometheus';
  port: number;
  username?: string | null;
  password?: string | null;
  private_key?: string | null;
}

export interface AnalyzeResult {
  server_name?: string;
  explanation: string;
  remediation_script?: string;
  confidence?: number;
  [key: string]: unknown;
}

export interface RemediationResult {
  status: string;
  exit_code: number | null;
  stdout: string;
  stderr: string;
  [key: string]: unknown;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchApi<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (email: string, password: string, name: string, org_name?: string) =>
    fetchApi<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name, org_name }) }),

  getMe: (token: string) =>
    fetchApi<unknown>('/auth/me', { token }),

  // Dashboard
  getOverview: (token: string) =>
    fetchApi<unknown>('/dashboard/overview', { token }),

  getRecentAlerts: (token: string) =>
    fetchApi<unknown>('/dashboard/recent-alerts', { token }),

  getRecentDeployments: (token: string) =>
    fetchApi<unknown>('/dashboard/recent-deployments', { token }),

  // Services
  getServices: (token: string) =>
    fetchApi<unknown[]>('/services/', { token }),

  getTopology: (token: string) =>
    fetchApi<unknown>('/services/topology', { token }),

  getService: (token: string, id: string) =>
    fetchApi<unknown>(`/services/${id}`, { token }),

  // Incidents
  getIncidents: (token: string) =>
    fetchApi<unknown[]>('/incidents/', { token }),

  getIncident: (token: string, id: string) =>
    fetchApi<unknown>(`/incidents/${id}`, { token }),

  getIncidentTimeline: (token: string, id: string) =>
    fetchApi<unknown>(`/incidents/${id}/timeline`, { token }),

  // Cost
  getCostOverview: (token: string) =>
    fetchApi<unknown>('/cost/overview', { token }),

  // Security
  getSecurityOverview: (token: string) =>
    fetchApi<unknown>('/security/overview', { token }),

  // Simulations
  getSimulations: (token: string) =>
    fetchApi<unknown[]>('/simulations/', { token }),

  runSimulation: (token: string, data: Record<string, unknown>) =>
    fetchApi<unknown>('/simulations/run', { method: 'POST', body: JSON.stringify(data), token }),

  // Automation
  getRunbooks: (token: string) =>
    fetchApi<unknown[]>('/automation/runbooks', { token }),

  // AI
  aiChat: (token: string, message: string) =>
    fetchApi<unknown>('/ai/chat', { method: 'POST', body: JSON.stringify({ message }), token }),

  aiAnalyze: (token: string, data: Record<string, unknown>) =>
    fetchApi<unknown>('/ai/analyze', { method: 'POST', body: JSON.stringify(data), token }),

  // AI RCA
  aiAnalyzeLog: (data: Record<string, unknown>) =>
    fetchApi<AnalyzeResult>('/ai/analyze-log', { method: 'POST', body: JSON.stringify(data) }),

  executeRemediation: (data: Record<string, unknown>) =>
    fetchApi<RemediationResult>('/ai/execute-remediation', { method: 'POST', body: JSON.stringify(data) }),

  // Servers
  getServers: () => fetchApi<Server[]>('/servers/'),
  addServer: (data: ServerPayload) => fetchApi<Server>('/servers/', { method: 'POST', body: JSON.stringify(data) }),
  deleteServer: (id: string) => fetchApi<unknown>(`/servers/${id}`, { method: 'DELETE' }),
};
