import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  HelpCircle,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import type { AdminRole } from '../../lib/adminAuth';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
  requiredPermission?: 'view' | 'edit' | 'manage_questions' | 'manage_config';
}

const ROLE_LABELS: Record<AdminRole, string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Visor',
};

const navItems: NavItem[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/submissions', icon: FileText, label: 'Submissions' },
  { to: '/admin/clients', icon: Users, label: 'Clientes' },
  { to: '/admin/questions', icon: HelpCircle, label: 'Preguntas', requiredPermission: 'manage_questions' },
  { to: '/admin/rules', icon: Shield, label: 'Reglas', requiredPermission: 'manage_questions' },
  { to: '/admin/settings', icon: Settings, label: 'Configuracion' },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { session, role, can, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const visibleItems = navItems.filter(
    (item) => !item.requiredPermission || can(item.requiredPermission)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-slate-100">
          <img src="/logo_fintel.png" alt="FINTEL" className="h-8" />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-cyan-50 text-cyan-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-sm font-medium text-slate-600">
                {session?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">
                {session?.name || 'Admin'}
              </p>
              <p className="text-xs text-slate-400">{ROLE_LABELS[role]}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar sesion</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
