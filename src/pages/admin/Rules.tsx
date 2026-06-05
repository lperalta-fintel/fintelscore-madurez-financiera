import { useState, useEffect } from 'react';
import { Edit2, Save, X, AlertCircle, Shield } from 'lucide-react';
import { getAnchorRules, updateAnchorRule, type AnchorRule } from '../../lib/adminApi';

export function AdminRules() {
  const [rules, setRules] = useState<AnchorRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    config: AnchorRule['config'];
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setIsLoading(true);
    const data = await getAnchorRules();
    setRules(data);
    setIsLoading(false);
  };

  const handleEdit = (rule: AnchorRule) => {
    setEditingId(rule.id);
    setEditForm({
      name: rule.name,
      description: rule.description,
      config: { ...rule.config },
    });
  };

  const handleSaveClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    if (!editingId || !editForm) return;
    setShowConfirmModal(false);
    setIsSaving(true);
    const success = await updateAnchorRule(editingId, editForm);
    if (success) {
      setEditingId(null);
      setEditForm(null);
      loadRules();
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleToggleActive = async (rule: AnchorRule) => {
    await updateAnchorRule(rule.id, { is_active: !rule.is_active });
    loadRules();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reglas de Anclaje</h1>
        <p className="text-slate-500">Configura las reglas que limitan el nivel máximo</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-800 font-medium">Advertencia</p>
          <p className="text-amber-700 text-sm">
            Las reglas de anclaje afectan el cálculo del nivel final. Los cambios solo aplicarán a los tests futuros.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${
                !rule.is_active ? 'opacity-60' : ''
              }`}
            >
              {editingId === rule.id && editForm ? (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-50 rounded-lg">
                      <Shield className="w-5 h-5 text-cyan-600" />
                    </div>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Nombre de la regla"
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-medium"
                    />
                  </div>

                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Descripción de la regla"
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Pregunta que activa
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={editForm.config.question_id}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            config: { ...editForm.config, question_id: parseInt(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nivel mínimo requerido
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={editForm.config.min_calculated_level}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            config: { ...editForm.config, min_calculated_level: parseInt(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nivel máximo resultante
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={editForm.config.max_level}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            config: { ...editForm.config, max_level: parseInt(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Valor que activa (opción)
                      </label>
                      <select
                        value={
                          editForm.config.trigger_value !== undefined
                            ? `eq:${editForm.config.trigger_value}`
                            : editForm.config.trigger_value_not !== undefined
                            ? `neq:${editForm.config.trigger_value_not}`
                            : ''
                        }
                        onChange={(e) => {
                          const [type, val] = e.target.value.split(':');
                          if (type === 'eq') {
                            setEditForm({
                              ...editForm,
                              config: {
                                ...editForm.config,
                                trigger_value: parseInt(val),
                                trigger_value_not: undefined,
                              },
                            });
                          } else if (type === 'neq') {
                            setEditForm({
                              ...editForm,
                              config: {
                                ...editForm.config,
                                trigger_value: undefined,
                                trigger_value_not: parseInt(val),
                              },
                            });
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        <option value="eq:0">Igual a A (opción 0)</option>
                        <option value="eq:1">Igual a B (opción 1)</option>
                        <option value="eq:2">Igual a C (opción 2)</option>
                        <option value="neq:0">Diferente a A (opción 0)</option>
                        <option value="neq:1">Diferente a B (opción 1)</option>
                        <option value="neq:2">Diferente a C (opción 2)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Mensaje de alerta
                    </label>
                    <textarea
                      value={editForm.config.alert_message}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          config: { ...editForm.config, alert_message: e.target.value },
                        })
                      }
                      rows={2}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveClick}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Shield className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-800">{rule.name}</h3>
                          {!rule.is_active && (
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              Inactiva
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-sm mt-1">{rule.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          rule.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {rule.is_active ? 'Activa' : 'Inactiva'}
                      </button>
                      <button
                        onClick={() => handleEdit(rule)}
                        className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-slate-50 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Pregunta</p>
                      <p className="font-medium text-slate-700">Q{rule.config.question_id}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Condición</p>
                      <p className="font-medium text-slate-700">
                        {rule.config.trigger_value !== undefined
                          ? `= Opción ${['A', 'B', 'C'][rule.config.trigger_value]}`
                          : rule.config.trigger_value_not !== undefined
                          ? `!= Opción ${['A', 'B', 'C'][rule.config.trigger_value_not]}`
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Nivel mínimo</p>
                      <p className="font-medium text-slate-700">{rule.config.min_calculated_level}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Limita a nivel</p>
                      <p className="font-medium text-slate-700">{rule.config.max_level}</p>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-700">{rule.config.alert_message}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Confirmar cambios</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Estás modificando una regla de anclaje. Los cambios afectarán el cálculo del nivel final en los tests futuros. ¿Deseas continuar?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
