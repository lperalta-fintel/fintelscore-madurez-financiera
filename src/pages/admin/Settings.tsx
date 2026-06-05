import { useState } from 'react';
import { Settings as SettingsIcon, Globe, Puzzle, Users, User } from 'lucide-react';
import { GeneralSettings } from './settings/GeneralSettings';
import { IntegrationSettings } from './settings/IntegrationSettings';
import { UserManagement } from './settings/UserManagement';
import { MyProfile } from './settings/MyProfile';
import { useAdminAuth } from '../../hooks/useAdminAuth';

type Tab = 'profile' | 'general' | 'integrations' | 'users';

const TABS: { id: Tab; label: string; icon: typeof Globe; permission?: 'manage_config' | 'manage_users' }[] = [
  { id: 'profile', label: 'Mi cuenta', icon: User },
  { id: 'general', label: 'General', icon: Globe, permission: 'manage_config' },
  { id: 'integrations', label: 'Integraciones', icon: Puzzle, permission: 'manage_config' },
  { id: 'users', label: 'Usuarios', icon: Users, permission: 'manage_users' },
];

export function AdminSettings() {
  const { can } = useAdminAuth();
  const availableTabs = TABS.filter((t) => !t.permission || can(t.permission));
  const [activeTab, setActiveTab] = useState<Tab>(availableTabs[0]?.id || 'profile');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-cyan-50 rounded-lg">
          <SettingsIcon className="w-6 h-6 text-cyan-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Configuracion</h1>
          <p className="text-slate-500">
            {can('manage_config') ? 'Ajustes generales, integraciones y gestion de usuarios' : 'Gestiona tu cuenta'}
          </p>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex gap-1">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'profile' && <MyProfile />}
        {activeTab === 'general' && can('manage_config') && <GeneralSettings />}
        {activeTab === 'integrations' && can('manage_config') && <IntegrationSettings />}
        {activeTab === 'users' && can('manage_users') && <UserManagement />}
      </div>
    </div>
  );
}
