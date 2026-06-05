import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Trash2, X } from 'lucide-react';
import { getSubmissions, deleteSubmission, type Submission } from '../../lib/adminApi';
import { levelDescriptions, questions } from '../../data/questions';
import { normalizeRawScore } from '../../utils/scoring';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export function AdminSubmissions() {
  const { can } = useAdminAuth();
  const canEdit = can('edit');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<{ id: string; leadId: string } | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, [page, search]);

  const loadSubmissions = async () => {
    setIsLoading(true);
    const data = await getSubmissions(page, 10, search);
    setSubmissions(data.data);
    setTotalCount(data.count);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteSubmission(deleteId.id, deleteId.leadId);
    setDeleteId(null);
    loadSubmissions();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Submissions</h1>
        <p className="text-slate-500">Todos los assessments completados</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o empresa..."
                className="w-full pl-9 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {search ? 'No se encontraron resultados para la búsqueda' : 'No hay submissions'}
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
                      Cargo
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
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Vinculado
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
                      <td className="px-4 py-3 text-slate-600">{submission.lead.position}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(submission.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800">
                          {normalizeRawScore(submission.raw_score, questions.length)}
                        </span>
                        <span className="text-slate-400">/100</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700">
                          {submission.final_level} - {levelDescriptions[submission.final_level as keyof typeof levelDescriptions]?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {submission.lead.client_id ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                            Si
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/submissions/${submission.id}`}
                            className="inline-flex items-center justify-center w-9 h-9 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => setDeleteId({ id: submission.id, leadId: submission.lead_id })}
                              className="inline-flex items-center justify-center w-9 h-9 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
