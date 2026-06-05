import { supabase } from './supabase';
import type { AdminRole } from './adminAuth';

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
}

export async function getSettings(category?: string): Promise<SystemSetting[]> {
  let query = supabase
    .from('system_settings')
    .select('*')
    .order('key');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching settings:', error);
    return [];
  }
  return data;
}

export async function updateSetting(key: string, value: string): Promise<boolean> {
  const { error } = await supabase
    .from('system_settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key);

  if (error) {
    console.error('Error updating setting:', error);
    return false;
  }
  return true;
}

export async function updateSettingsBatch(
  updates: { key: string; value: string }[]
): Promise<boolean> {
  for (const { key, value } of updates) {
    const success = await updateSetting(key, value);
    if (!success) return false;
  }
  return true;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('admins')
    .select('id, username, name, role, is_active, created_at')
    .order('created_at');

  if (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
  return data;
}

export async function createAdminUser(user: {
  username: string;
  password: string;
  name: string;
  role: AdminRole;
}): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from('admins')
    .insert({
      username: user.username,
      password_hash: user.password,
      name: user.name,
      role: user.role,
      is_active: true,
    })
    .select('id, username, name, role, is_active, created_at')
    .single();

  if (error) {
    console.error('Error creating admin user:', error);
    return null;
  }
  return data;
}

export async function updateAdminUser(
  id: string,
  updates: {
    name?: string;
    role?: AdminRole;
    is_active?: boolean;
    password?: string;
  }
): Promise<boolean> {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.is_active !== undefined) payload.is_active = updates.is_active;
  if (updates.password) payload.password_hash = updates.password;

  const { error } = await supabase
    .from('admins')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('Error updating admin user:', error);
    return false;
  }
  return true;
}

export async function deleteAdminUser(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('admins')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting admin user:', error);
    return false;
  }
  return true;
}
