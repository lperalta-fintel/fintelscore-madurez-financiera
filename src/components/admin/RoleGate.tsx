import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface RoleGateProps {
  permission: 'view' | 'edit' | 'manage_users' | 'manage_config' | 'manage_questions';
  children: React.ReactNode;
}

export function RoleGate({ permission, children }: RoleGateProps) {
  const { can, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!can(permission)) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
