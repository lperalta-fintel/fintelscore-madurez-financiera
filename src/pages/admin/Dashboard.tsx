import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, TrendingUp, Calendar, Eye, Trash2, Search } from 'lucide-react';
import { getDashboardStats, getSubmissions, deleteSubmission, type Submission } from '../../lib/adminApi';
import { levelDescriptions, questions } from '../../data/questions';
import { normalizeRawScore } from '../../utils/scoring';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface Stats {
  totalTests: number;
  averageScore: number;
  testsThisMonth: number;
  totalClients: number;
}

export function AdminDashboard() {
  const { can } = useAdminAuth();
  const canEdit = can('edit');
  const [stats, setStats] = useState<Stats | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<{ id: string; leadId: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [page, search]);

  const loadData = async () => {
    setIsLoading(true);
    const [statsData, submissionsData] = await Promise.all([
      getDashboardStats(),
      getSubmissions(page, 10, search),
    ]);
    setStats(statsData);
    setSubmissions(submissionsData.data);
    setTotalCount(submissionsData.count);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteSubmission(deleteId.id, deleteId.leadId);
    setDeleteId(null);
    loadData();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Vista general de assessments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Total Assessments"
          value={stats?.totalTests || 0}
          color="cyan"
        />
        <StatCard
          icon={TrendingUp}
          label="Score Promedio"
          value={stats?.averageScore || 0}
          suffix="/100"
          color="teal"
        />
        <StatCard
          icon={Calendar}
          label="Este Mes"
          value={stats?.testsThisMonth || 0}
          color="emerald"
        />
        <StatCard
          icon={Users}
          label="Clientes"
          value={stats?.totalClients || 0}
          color="blue"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Últimos Assessments</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o empresa..."
                  className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-64"
                />
              </div>
            </form>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No se encontraron assessments
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Nivel
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-800">{submission.lead.name}</p>
                          <p className="text-sm text-slate-500">{submission.lead.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{submission.lead.company}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(submission.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800">
                          {normalizeRawScore(submission.raw_score, questions.length)}/100
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700">
                          Nivel {submission.final_level} - {levelDescriptions[submission.final_level as keyof typeof levelDescriptions]?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/submissions/${submission.id}`}
                            className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {canEdit && (
                            <button
                              onClick={() => setDeleteId({ id: submission.id, leadId: submission.lead_id })}
                              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Mostrando {((page - 1) * 10) + 1}-{Math.min(page * 10, totalCount)} de {totalCount}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Confirmar eliminación
            </h3>
            <p className="text-slate-600 mb-6">
              Esta acción eliminará permanentemente este assessment y los datos del lead asociado.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  color: 'cyan' | 'teal' | 'emerald' | 'blue';
}) {
  const colorClasses = {
    cyan: 'bg-cyan-50 text-cyan-600',
    teal: 'bg-teal-50 text-teal-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-800">
            {value}{suffix}
          </p>
        </div>
      </div>
    </div>
  );
}
