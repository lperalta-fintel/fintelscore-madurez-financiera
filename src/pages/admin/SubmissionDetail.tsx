import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building2, Briefcase, Calendar, AlertTriangle, UserPlus, Link2 } from 'lucide-react';
import { getSubmission, getClients, linkSubmissionToClient, createClient, type Submission, type Client } from '../../lib/adminApi';
import { questions, levelDescriptions } from '../../data/questions';
import { normalizeRawScore } from '../../utils/scoring';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Speedometer } from '../../components/Speedometer';
import { Pyramid } from '../../components/Pyramid';

export function SubmissionDetail() {
  const { can } = useAdminAuth();
  const canEdit = can('edit');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    const [submissionData, clientsData] = await Promise.all([
      getSubmission(id),
      getClients(),
    ]);
    setSubmission(submissionData);
    setClients(clientsData);
    setSelectedClientId(submissionData?.lead.client_id || '');
    setIsLoading(false);
  };

  const handleLinkClient = async () => {
    if (!submission) return;
    await linkSubmissionToClient(submission.lead_id, selectedClientId || null);
    setShowLinkModal(false);
    loadData();
  };

  const handleCreateClientFromLead = async () => {
    if (!submission) return;
    setIsCreatingClient(true);
    const newClient = await createClient({
      name: submission.lead.name,
      company: submission.lead.company,
      email: submission.lead.email,
      phone: submission.lead.whatsapp,
      notes: `Creado desde assessment del ${new Date(submission.created_at).toLocaleDateString('es-ES')}`,
    });
    if (newClient) {
      await linkSubmissionToClient(submission.lead_id, newClient.id);
      navigate(`/admin/clients/${newClient.id}`);
    }
    setIsCreatingClient(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Assessment no encontrado</p>
        <Link to="/admin" className="text-cyan-600 hover:underline mt-2 inline-block">
          Volver al dashboard
        </Link>
      </div>
    );
  }

  const levelInfo = levelDescriptions[submission.final_level as keyof typeof levelDescriptions];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Detalle del Assessment</h1>
          <p className="text-slate-500">
            {new Date(submission.created_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Informacion del Lead</h2>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-slate-800">{submission.lead.name}</p>
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{submission.lead.position}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{submission.lead.company}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${submission.lead.email}`} className="text-cyan-600 hover:underline">
                    {submission.lead.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a href={`tel:${submission.lead.whatsapp}`} className="text-cyan-600 hover:underline">
                    {submission.lead.whatsapp}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">
                    {new Date(submission.lead.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Vincular a Cliente</h2>
            {submission.lead.client_id ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">Este assessment esta vinculado a:</p>
                <Link
                  to={`/admin/clients/${submission.lead.client_id}`}
                  className="flex items-center gap-2 text-cyan-600 hover:underline font-medium"
                >
                  <Link2 className="w-4 h-4" />
                  Ver perfil del cliente
                </Link>
                {canEdit && (
                  <button
                    onClick={() => setShowLinkModal(true)}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Cambiar vinculacion
                  </button>
                )}
              </div>
            ) : canEdit ? (
              <div className="space-y-3">
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                  Vincular a cliente existente
                </button>
                <button
                  onClick={handleCreateClientFromLead}
                  disabled={isCreatingClient}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  {isCreatingClient ? 'Creando...' : 'Crear cliente desde este lead'}
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No vinculado</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Resultado del Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <Speedometer score={normalizeRawScore(submission.raw_score, questions.length)} />
              <div className="flex justify-center">
                <div className="w-48">
                  <Pyramid activeLevel={submission.final_level} />
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-lg font-semibold text-slate-800">
                Nivel {submission.final_level}: {levelInfo?.name}
              </p>
              <p className="text-slate-600 mt-1">{levelInfo?.description}</p>
            </div>
          </div>

          {submission.alerts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-semibold text-amber-800">Alertas de Anclaje</h2>
              </div>
              <ul className="space-y-2">
                {submission.alerts.map((alert, index) => (
                  <li key={index} className="text-amber-700 text-sm">
                    {alert}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Respuestas Detalladas</h2>
            <div className="space-y-4">
              {questions.map((question) => {
                const answerIndex = submission.answers[`q${question.id}`];
                const answerText = answerIndex !== undefined ? question.options[answerIndex] : 'Sin respuesta';
                const optionLabel = ['A', 'B', 'C'][answerIndex] || '-';

                return (
                  <div key={question.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                        {question.id}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500 mb-1">{question.category}</p>
                        <p className="text-slate-800 mb-2">{question.question}</p>
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs font-medium rounded">
                            {optionLabel}
                          </span>
                          <p className="text-sm text-slate-600">{answerText}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Vincular a Cliente
            </h3>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent mb-6"
            >
              <option value="">Sin vincular</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.company}
                </option>
              ))}
            </select>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLinkClient}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
