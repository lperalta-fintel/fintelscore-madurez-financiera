import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, TrendingUp, TrendingDown, Minus, Calendar, Building2, Mail, Phone, FileText, Eye } from 'lucide-react';
import { getClient, updateClient, getClientAssessments, type Client, type Submission } from '../../lib/adminApi';
import { levelDescriptions, questions } from '../../data/questions';
import { normalizeRawScore } from '../../utils/scoring';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export function ClientDetail() {
  const { can } = useAdminAuth();
  const canEdit = can('edit');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [assessments, setAssessments] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    const [clientData, assessmentsData] = await Promise.all([
      getClient(id),
      getClientAssessments(id),
    ]);
    setClient(clientData);
    setAssessments(assessmentsData);
    if (clientData) {
      setFormData({
        name: clientData.name,
        company: clientData.company,
        email: clientData.email,
        phone: clientData.phone,
        notes: clientData.notes,
      });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    const success = await updateClient(id, formData);
    if (success) {
      setIsEditing(false);
      loadData();
    }
    setIsSaving(false);
  };

  const getEvolutionIndicator = (index: number) => {
    if (index >= assessments.length - 1) return null;
    const current = assessments[index].final_level;
    const previous = assessments[index + 1].final_level;
    if (current > previous) {
      return { icon: TrendingUp, color: 'text-emerald-500', label: 'Mejora' };
    } else if (current < previous) {
      return { icon: TrendingDown, color: 'text-red-500', label: 'Descenso' };
    }
    return { icon: Minus, color: 'text-slate-400', label: 'Sin cambio' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Cliente no encontrado</p>
        <Link to="/admin/clients" className="text-cyan-600 hover:underline mt-2 inline-block">
          Volver a clientes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/clients')}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{client.name}</h1>
          <p className="text-slate-500">{client.company || 'Sin empresa'}</p>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        ) : canEdit ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Editar
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Informacion</h2>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {client.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{client.company}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${client.email}`} className="text-cyan-600 hover:underline">
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <a href={`tel:${client.phone}`} className="text-cyan-600 hover:underline">
                      {client.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">
                    Cliente desde {new Date(client.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {client.notes && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-500 mb-1">Notas:</p>
                    <p className="text-slate-600">{client.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-800">Historial de Assessments</h2>
              <span className="ml-auto text-sm text-slate-500">{assessments.length} assessments</span>
            </div>

            {assessments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Este cliente no tiene assessments vinculados
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment, index) => {
                  const evolution = getEvolutionIndicator(index);
                  const levelInfo = levelDescriptions[assessment.final_level as keyof typeof levelDescriptions];

                  return (
                    <div
                      key={assessment.id}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                        <span className="text-lg font-bold text-slate-700">
                          {assessment.final_level}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800">
                            Nivel {assessment.final_level}: {levelInfo?.name}
                          </p>
                          {evolution && (
                            <span className={`flex items-center gap-1 text-xs ${evolution.color}`}>
                              <evolution.icon className="w-3 h-3" />
                              {evolution.label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                          Score: {normalizeRawScore(assessment.raw_score, questions.length)}/100
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(assessment.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      <Link
                        to={`/admin/submissions/${assessment.id}`}
                        className="flex-shrink-0 p-2 text-slate-500 hover:text-cyan-600 hover:bg-white rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
