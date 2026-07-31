import { hc } from 'hono/client';
import type { AppType } from '../api';

// --- API Client Configuration ---
const API_BASE = import.meta.env.PROD
  ? 'https://jkm-timetables-hub.wilson-b6f.workers.dev'
  : 'http://localhost:8787';

export const client = hc<AppType>(API_BASE);

// --- Token Management ---
const TOKEN_KEY = 'jkm_auth_token';
const USER_KEY = 'jkm_auth_user';
const VERSION_KEY = 'jkm_app_version';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): any | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: any): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// --- Version Management ---
export function getStoredVersion(): string | null {
  return localStorage.getItem(VERSION_KEY);
}

export function setStoredVersion(version: string): void {
  localStorage.setItem(VERSION_KEY, version);
}

// --- Auth Headers Helper ---
export function authHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// --- API Helper Functions ---

// Auth
export async function apiLogin(email: string, password: string) {
  const res = await client.api.auth.login.$post({ json: { email, password } });
  if (!res.ok) {
    const err = await res.json() as any;
    throw new Error(err.error || 'Login failed');
  }
  const data = await res.json() as any;
  setToken(data.token);
  setStoredUser(data.user);
  return data;
}

export async function apiRegister(email: string, password: string, name: string) {
  const res = await client.api.auth.register.$post({ json: { email, password, name } });
  if (!res.ok) {
    const err = await res.json() as any;
    throw new Error(err.error || 'Registration failed');
  }
  const data = await res.json() as any;
  setToken(data.token);
  setStoredUser(data.user);
  return data;
}

export async function apiGetMe() {
  const res = await client.api.auth.me.$get({ headers: authHeaders() });
  if (!res.ok) {
    clearToken();
    throw new Error('Session expired');
  }
  const data = await res.json() as any;
  setStoredUser(data.user);
  return data.user;
}

// Schedules
export async function apiGetSchedules() {
  const res = await client.api.schedules.$get({ headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch schedules');
  const data = await res.json() as any;
  return data.slots || [];
}

export async function apiGetCourses() {
  const res = await client.api.schedules.courses.$get({ headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch courses');
  const data = await res.json() as any;
  return data.courses || [];
}

// Notifications
export async function apiGetNotifications() {
  const res = await client.api.notifications.$get({ headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  const data = await res.json() as any;
  return data.notifications || [];
}

// Registrations
export async function apiGetRegistrations() {
  const res = await client.api.registrations.mine.$get({ headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch registrations');
  const data = await res.json() as any;
  return data.registrations || [];
}

export async function apiSubmitRegistration(payload: {
  baseSection: string;
  repeatCourses: string[];
  selectedAddons: Record<string, string>;
  totalCredits: number;
}) {
  const res = await client.api.registrations.$post({
    json: payload,
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json() as any;
    throw new Error(err.error || 'Failed to submit registration');
  }
  return res.json() as any;
}

export async function apiUpdateRegistration(id: string, status: string, advisorNotes?: string) {
  const res = await client.api.registrations[':id'].$patch({
    json: { status, advisorNotes },
    headers: authHeaders(),
    param: { id },
  } as any);
  if (!res.ok) throw new Error('Failed to update registration');
  return res.json() as any;
}

// Clash analysis
export async function apiAnalyzeClash(repeatCourseCodes: string[], baseSection: string) {
  const res = await client.api.clash.analyze.$post({
    json: { repeatCourseCodes, baseSection },
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to analyze clashes');
  const data = await res.json() as any;
  return data.analysis || [];
}

// Version check
export async function apiGetVersion() {
  const res = await client.api.version.$get();
  if (!res.ok) return { version: '0.0.0', env: 'unknown', deployed: 0 };
  return res.json() as Promise<{ version: string; env: string; deployed: number }>;
}

// Logout (client-side only)
export function apiLogout() {
  clearToken();
}

