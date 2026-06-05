import { useState, useEffect } from 'react';
import { Save, Building2, Globe, Calendar } from 'lucide-react';
import { getSettings, updateSettingsBatch, type SystemSetting } from '../../../lib/settingsApi';

export function GeneralSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    system_name: '',
    company_name: '',
    company_description: '',
    contact_email: '',
    calendar_url: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    const data = await getSettings('general');
    setSettings(data);
    const map: Record<string, string> = {};
    data.forEach((s) => (map[s.key] = s.value));
    setForm({
      system_name: map.system_name || '',
      company_name: map.company_name || '',
      company_description: map.company_description || '',
      contact_email: map.contact_email || '',
      calendar_url: map.calendar_url || '',
    });
    setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaved(false);
    const updates = Object.entries(form).map(([key, value]) => ({ key, value }));
    const success = await updateSettingsBatch(updates);
    setIsSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-cyan-50 rounded-lg">
            <Globe className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Informacion del sistema</h3>
            <p className="text-sm text-slate-500">Nombre y titulo del sistema</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nombre del sistema
            </label>
            <input
              type="text"
              value={form.system_name}
              onChange={(e) => setForm({ ...form, system_name: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="FINTEL Score"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email de contacto
            </label>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="contacto@fintel.do"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-cyan-50 rounded-lg">
            <Building2 className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Organizacion</h3>
            <p className="text-sm text-slate-500">Datos de la empresa</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nombre de la empresa
            </label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="FINTEL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Descripcion
            </label>
            <input
              type="text"
              value={form.company_description}
              onChange={(e) => setForm({ ...form, company_description: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Asesoria e Inteligencia Financiera"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-cyan-50 rounded-lg">
            <Calendar className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Enlaces</h3>
            <p className="text-sm text-slate-500">URLs de acciones del sistema</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            URL del calendario (CTA)
          </label>
          <input
            type="url"
            value={form.calendar_url}
            onChange={(e) => setForm({ ...form, calendar_url: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="https://web.fintel.do/CALENDARIO"
          />
          <p className="text-xs text-slate-400 mt-1">
            Se usa en el boton "Agendar Sesion Estrategica" del dashboard de resultados.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 font-medium"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {saved && (
          <span className="text-sm text-emerald-600 font-medium">
            Cambios guardados correctamente
          </span>
        )}
      </div>
    </form>
  );
}
