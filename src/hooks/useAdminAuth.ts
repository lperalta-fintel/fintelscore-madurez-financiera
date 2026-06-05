import { useState, useEffect, useCallback } from 'react';
import { getAdminSession, logoutAdmin, hasPermission, type AdminSession, type AdminRole } from '../lib/adminAuth';

export function useAdminAuth() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentSession = getAdminSession();
    setSession(currentSession);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    logoutAdmin();
    setSession(null);
  }, []);

  const can = useCallback(
    (action: 'view' | 'edit' | 'manage_users' | 'manage_config' | 'manage_questions') => {
      if (!session) return false;
      return hasPermission(session.role, action);
    },
    [session]
  );

  const role: AdminRole = session?.role ?? 'viewer';

  return {
    session,
    isLoggedIn: session !== null,
    isLoading,
    role,
    can,
    logout,
  };
}
