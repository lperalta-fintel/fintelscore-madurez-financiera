import { supabase } from './supabase';

const AUTH_KEY = 'fintel_admin_session';

export type AdminRole = 'admin' | 'editor' | 'viewer';

export interface AdminSession {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
  timestamp: number;
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from('admins')
    .select('id, username, password_hash, name, role, is_active')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    return { success: false, error: 'Error de conexion' };
  }

  if (!data) {
    return { success: false, error: 'Usuario no encontrado' };
  }

  if (!data.is_active) {
    return { success: false, error: 'Cuenta desactivada' };
  }

  if (data.password_hash !== password) {
    return { success: false, error: 'Contrasena incorrecta' };
  }

  const session: AdminSession = {
    id: data.id,
    username: data.username,
    name: data.name || 'Admin',
    role: data.role || 'viewer',
    timestamp: Date.now(),
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return { success: true };
}

export function getAdminSession(): AdminSession | null {
  const stored = localStorage.getItem(AUTH_KEY);
  if (!stored) return null;

  try {
    const session: AdminSession = JSON.parse(stored);
    const oneDay = 24 * 60 * 60 * 1000;
    if (Date.now() - session.timestamp > oneDay) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    if (!session.role) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function logoutAdmin(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isAdminLoggedIn(): boolean {
  return getAdminSession() !== null;
}

export function hasPermission(
  role: AdminRole,
  action: 'view' | 'edit' | 'manage_users' | 'manage_config' | 'manage_questions'
): boolean {
  const permissions: Record<AdminRole, Set<string>> = {
    admin: new Set(['view', 'edit', 'manage_users', 'manage_config', 'manage_questions']),
    editor: new Set(['view', 'edit']),
    viewer: new Set(['view']),
  };
  return permissions[role]?.has(action) ?? false;
}
