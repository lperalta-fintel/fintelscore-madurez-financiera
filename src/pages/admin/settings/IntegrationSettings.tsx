import { useState, useEffect } from 'react';
import { Save, Code2, Webhook, BarChart3, ToggleLeft, ToggleRight } from 'lucide-react';
import { getSettings, updateSettingsBatch, type SystemSetting } from '../../../lib/settingsApi';

export function IntegrationSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    facebook_pixel_id: '',
    google_analytics_id: '',
    webhook_url: '',
    webhook_enabled: 'false',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    const data = await getSettings('integrations');
    const map: Record<string, string> = {};
    data.forEach((s) => (map[s.key] = s.value));
    setForm({
      facebook_pixel_id: map.facebook_pixel_id || '',
      google_analytics_id: map.google_analytics_id || '',
      webhook_url: map.webhook_url || '',
      webhook_enabled: map.webhook_enabled || 'false',
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

  const webhookOn = form.webhook_enabled === 'true';

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
          <div className="p-2 bg-blue-50 rounded-lg">
            <Code2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Facebook Pixel</h3>
            <p className="text-sm text-slate-500">Seguimiento de conversiones y audiencias</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Pixel ID
          </label>
          <input
            type="text"
            value={form.facebook_pixel_id}
            onChange={(e) => setForm({ ...form, facebook_pixel_id: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
            placeholder="123456789012345"
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Ingresa tu Facebook Pixel ID. Se inyectara automaticamente en el quiz publico.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Google Analytics</h3>
            <p className="text-sm text-slate-500">Analisis de trafico y comportamiento</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Measurement ID
          </label>
          <input
            type="text"
            value={form.google_analytics_id}
            onChange={(e) => setForm({ ...form, google_analytics_id: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
            placeholder="G-XXXXXXXXXX"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Webhook className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Webhook</h3>
              <p className="text-sm text-slate-500">Enviar datos de quizzes a un endpoint externo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setForm({ ...form, webhook_enabled: webhookOn ? 'false' : 'true' })
            }
            className="flex items-center gap-2"
          >
            {webhookOn ? (
              <ToggleRight className="w-8 h-8 text-cyan-500" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-300" />
            )}
            <span className={`text-sm font-medium ${webhookOn ? 'text-cyan-700' : 'text-slate-400'}`}>
              {webhookOn ? 'Activo' : 'Inactivo'}
            </span>
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            URL del webhook
          </label>
          <input
            type="url"
            value={form.webhook_url}
            onChange={(e) => setForm({ ...form, webhook_url: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
            placeholder="https://hooks.example.com/quiz-results"
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Se enviara un POST con los datos del lead y resultado del quiz cada vez que se complete un assessment.
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
