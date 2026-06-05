import { useState, useEffect } from 'react';
import { User, Lock, Save, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { updateAdminUser } from '../../../lib/settingsApi';
import { supabase } from '../../../lib/supabase';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visor',
};

export function MyProfile() {
  const { session } = useAdminAuth();
  const [storedPassword, setStoredPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(true);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase
        .from('admins')
        .select('password_hash')
        .eq('id', session.id)
        .maybeSingle();
      if (data) setStoredPassword(data.password_hash);
      setIsLoadingPassword(false);
    })();
  }, [session]);

  if (!session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!newPassword) {
      setError('Ingresa una nueva contrasena');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    setIsSubmitting(true);

    const result = await updateAdminUser(session.id, { password: newPassword });

    if (result) {
      setStoredPassword(newPassword);
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError('Error al actualizar la contrasena');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{session.name}</h2>
            <p className="text-slate-500">@{session.username}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 mt-1">
              {ROLE_LABELS[session.role] || session.role}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-800">Cambiar contrasena</h3>
        </div>

        <div className="mb-6 max-w-md">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Contrasena actual
          </label>
          <div className="relative">
            {isLoadingPassword ? (
              <div className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 text-sm">
                Cargando...
              </div>
            ) : (
              <>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={storedPassword}
                  readOnly
                  className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-default"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md" autoComplete="off">
          <input type="text" name="prevent_autofill" className="hidden" />
          <input type="password" name="prevent_autofill_pass" className="hidden" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nueva contrasena
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Minimo 6 caracteres"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirmar nueva contrasena
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4" />
              Contrasena actualizada correctamente
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
