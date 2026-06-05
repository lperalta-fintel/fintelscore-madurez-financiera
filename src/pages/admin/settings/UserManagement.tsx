import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Shield, Eye, Pencil, UserCheck, UserX } from 'lucide-react';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  type AdminUser,
} from '../../../lib/settingsApi';
import type { AdminRole } from '../../../lib/adminAuth';
import { useAdminAuth } from '../../../hooks/useAdminAuth';

const ROLE_CONFIG: Record<AdminRole, { label: string; color: string; bgColor: string; description: string }> = {
  admin: {
    label: 'Administrador',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    description: 'Acceso total: usuarios, preguntas, reglas y configuracion',
  },
  editor: {
    label: 'Editor',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    description: 'Puede gestionar clientes y submissions. Sin acceso a config',
  },
  viewer: {
    label: 'Visor',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    description: 'Solo lectura: dashboard, clientes y submissions',
  },
};

export function UserManagement() {
  const { session } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await getAdminUsers();
    setUsers(data);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-slate-800">Roles del sistema</h3>
            <p className="text-sm text-slate-500">Permisos asignados a cada rol</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(ROLE_CONFIG) as [AdminRole, typeof ROLE_CONFIG.admin][]).map(
            ([role, config]) => (
              <div key={role} className={`rounded-lg p-4 border border-slate-100 ${config.bgColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  {role === 'admin' && <Shield className="w-4 h-4 text-red-600" />}
                  {role === 'editor' && <Pencil className="w-4 h-4 text-cyan-600" />}
                  {role === 'viewer' && <Eye className="w-4 h-4 text-slate-500" />}
                  <span className={`font-medium ${config.color}`}>{config.label}</span>
                </div>
                <p className="text-xs text-slate-600">{config.description}</p>
                <div className="mt-3 space-y-1">
                  {role === 'admin' && (
                    <>
                      <PermRow label="Dashboard" />
                      <PermRow label="Clientes (CRUD)" />
                      <PermRow label="Submissions (CRUD)" />
                      <PermRow label="Preguntas y Reglas" />
                      <PermRow label="Configuracion" />
                      <PermRow label="Gestion de usuarios" />
                    </>
                  )}
                  {role === 'editor' && (
                    <>
                      <PermRow label="Dashboard" />
                      <PermRow label="Clientes (CRUD)" />
                      <PermRow label="Submissions (CRUD)" />
                      <PermRow label="Preguntas y Reglas" denied />
                      <PermRow label="Configuracion" denied />
                      <PermRow label="Gestion de usuarios" denied />
                    </>
                  )}
                  {role === 'viewer' && (
                    <>
                      <PermRow label="Dashboard" />
                      <PermRow label="Clientes (lectura)" />
                      <PermRow label="Submissions (lectura)" />
                      <PermRow label="Preguntas y Reglas" denied />
                      <PermRow label="Configuracion" denied />
                      <PermRow label="Gestion de usuarios" denied />
                    </>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-800">Usuarios ({users.length})</h3>
            <p className="text-sm text-slate-500">Administra los usuarios del sistema</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nuevo usuario
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {users.map((user) => {
            const rc = ROLE_CONFIG[user.role] || ROLE_CONFIG.viewer;
            const isSelf = user.id === session?.id;
            return (
              <div key={user.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                    <span className="text-sm font-semibold text-slate-600">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800">{user.name}</p>
                      {isSelf && (
                        <span className="text-xs bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded font-medium">Tu</span>
                      )}
                      {!user.is_active && (
                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">Inactivo</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">@{user.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${rc.bgColor} ${rc.color}`}>
                    {rc.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditUser(user)}
                      className="inline-flex items-center justify-center w-9 h-9 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(user)}
                        className="inline-flex items-center justify-center w-9 h-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadUsers();
          }}
        />
      )}

      {editUser && (
        <EditUserModal
          user={editUser}
          isSelf={editUser.id === session?.id}
          onClose={() => setEditUser(null)}
          onSaved={() => {
            setEditUser(null);
            loadUsers();
          }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Eliminar usuario</h3>
            <p className="text-slate-600 mb-6">
              Se eliminara permanentemente a <span className="font-medium">{deleteTarget.name}</span> (@{deleteTarget.username}).
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setIsSubmitting(true);
                  await deleteAdminUser(deleteTarget.id);
                  setDeleteTarget(null);
                  setIsSubmitting(false);
                  loadUsers();
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PermRow({ label, denied }: { label: string; denied?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {denied ? (
        <X className="w-3 h-3 text-slate-400" />
      ) : (
        <UserCheck className="w-3 h-3 text-emerald-500" />
      )}
      <span className={denied ? 'text-slate-400' : 'text-slate-600'}>{label}</span>
    </div>
  );
}

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'viewer' as AdminRole,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }
    if (!form.username.trim() || !form.name.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setIsSubmitting(true);
    const result = await createAdminUser({
      username: form.username.trim().toLowerCase(),
      name: form.name.trim(),
      password: form.password,
      role: form.role,
    });

    if (result) {
      onCreated();
    } else {
      setError('Error al crear usuario. El nombre de usuario puede estar en uso.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-800">Nuevo usuario</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <input type="text" name="prevent_autofill" className="hidden" />
          <input type="password" name="prevent_autofill_pass" className="hidden" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoComplete="off"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de usuario</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoComplete="off"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="viewer">Visor (solo lectura)</option>
              <option value="editor">Editor (clientes y submissions)</option>
              <option value="admin">Administrador (acceso total)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contrasena</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar contrasena</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              autoComplete="new-password"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({
  user,
  isSelf,
  onClose,
  onSaved,
}: {
  user: AdminUser;
  isSelf: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: user.name,
    role: user.role as AdminRole,
    is_active: user.is_active,
    newPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.newPassword && form.newPassword.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);
    const updates: Parameters<typeof updateAdminUser>[1] = {
      name: form.name.trim(),
      role: form.role,
      is_active: form.is_active,
    };
    if (form.newPassword) {
      updates.password = form.newPassword;
    }

    const success = await updateAdminUser(user.id, updates);
    if (success) {
      onSaved();
    } else {
      setError('Error al guardar cambios');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-800">Editar usuario</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <input type="text" name="prevent_autofill" className="hidden" />
          <input type="password" name="prevent_autofill_pass" className="hidden" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoComplete="off"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}
              disabled={isSelf}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="viewer">Visor</option>
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
            {isSelf && (
              <p className="text-xs text-slate-400 mt-1">No puedes cambiar tu propio rol</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Estado de la cuenta</label>
            <button
              type="button"
              onClick={() => !isSelf && setForm({ ...form, is_active: !form.is_active })}
              disabled={isSelf}
              className="flex items-center gap-2 disabled:opacity-50"
            >
              {form.is_active ? (
                <>
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-emerald-600 font-medium">Activo</span>
                </>
              ) : (
                <>
                  <UserX className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-600 font-medium">Inactivo</span>
                </>
              )}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nueva contrasena <span className="text-slate-400 font-normal">(dejar vacio para no cambiar)</span>
            </label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              autoComplete="new-password"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              minLength={6}
              placeholder="Minimo 6 caracteres"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
