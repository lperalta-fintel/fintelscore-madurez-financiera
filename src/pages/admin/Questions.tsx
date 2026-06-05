import { useState, useEffect, useCallback } from 'react';
import {
  Edit2,
  ChevronUp,
  ChevronDown,
  Save,
  X,
  AlertCircle,
  Plus,
  Trash2,
  Shield,
  Info,
  Calculator,
  Link2,
} from 'lucide-react';
import {
  getQuestions,
  updateQuestion,
  reorderQuestions,
  createQuestion,
  deleteQuestion,
  getAnchorRules,
  type QuestionConfig,
  type AnchorRule,
} from '../../lib/adminApi';
import { getPointsPerQuestion, getOptionPoints } from '../../utils/scoring';

interface ScoringDistribution {
  questionCount: number;
  pointsPerQuestion: number;
  optionA: number;
  optionB: number;
  optionC: number;
  total: number;
}

function computeScoringInfo(questionCount: number): ScoringDistribution {
  const ppq = getPointsPerQuestion(questionCount);
  const opts = getOptionPoints(questionCount);
  return {
    questionCount,
    pointsPerQuestion: ppq,
    optionA: opts.a,
    optionB: opts.b,
    optionC: opts.c,
    total: 100,
  };
}

export function AdminQuestions() {
  const [questions, setQuestions] = useState<QuestionConfig[]>([]);
  const [rules, setRules] = useState<AnchorRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    question_text: string;
    category: string;
    options: string[];
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<QuestionConfig | null>(null);
  const [affectedRules, setAffectedRules] = useState<AnchorRule[]>([]);
  const [reorderTarget, setReorderTarget] = useState<{
    index: number;
    direction: 'up' | 'down';
    affected: AnchorRule[];
  } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [questionsData, rulesData] = await Promise.all([
      getQuestions(),
      getAnchorRules(),
    ]);
    setQuestions(questionsData);
    setRules(rulesData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getRulesForQuestion = useCallback(
    (orderNum: number) => rules.filter((r) => r.config.question_id === orderNum),
    [rules]
  );

  const getRulesAffectedByReorder = useCallback(
    (indexA: number, indexB: number) => {
      const orderA = questions[indexA]?.order_num;
      const orderB = questions[indexB]?.order_num;
      return rules.filter(
        (r) => r.config.question_id === orderA || r.config.question_id === orderB
      );
    },
    [questions, rules]
  );

  const ruleDependencyMap = new Map<number, AnchorRule[]>();
  for (const rule of rules) {
    const qId = rule.config.question_id;
    if (!ruleDependencyMap.has(qId)) {
      ruleDependencyMap.set(qId, []);
    }
    ruleDependencyMap.get(qId)!.push(rule);
  }

  const handleEdit = (question: QuestionConfig) => {
    setEditingId(question.id);
    setEditForm({
      question_text: question.question_text,
      category: question.category,
      options: [...question.options],
    });
  };

  const handleSave = async () => {
    if (!editingId || !editForm) return;
    setIsSaving(true);
    const success = await updateQuestion(editingId, editForm);
    if (success) {
      setEditingId(null);
      setEditForm(null);
      loadData();
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleToggleActive = async (question: QuestionConfig) => {
    await updateQuestion(question.id, { is_active: !question.is_active });
    loadData();
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const affected = getRulesAffectedByReorder(index, index - 1);
    if (affected.length > 0) {
      setReorderTarget({ index, direction: 'up', affected });
    } else {
      executeReorder(index, 'up');
    }
  };

  const handleMoveDown = (index: number) => {
    if (index === questions.length - 1) return;
    const affected = getRulesAffectedByReorder(index, index + 1);
    if (affected.length > 0) {
      setReorderTarget({ index, direction: 'down', affected });
    } else {
      executeReorder(index, 'down');
    }
  };

  const executeReorder = async (index: number, direction: 'up' | 'down') => {
    const otherIndex = direction === 'up' ? index - 1 : index + 1;
    const newQuestions = [...questions];
    const temp = newQuestions[index].order_num;
    newQuestions[index].order_num = newQuestions[otherIndex].order_num;
    newQuestions[otherIndex].order_num = temp;

    await reorderQuestions([
      { id: newQuestions[index].id, order_num: newQuestions[index].order_num },
      { id: newQuestions[otherIndex].id, order_num: newQuestions[otherIndex].order_num },
    ]);
    loadData();
  };

  const handleConfirmReorder = async () => {
    if (!reorderTarget) return;
    await executeReorder(reorderTarget.index, reorderTarget.direction);
    setReorderTarget(null);
  };

  const handleDeleteClick = (question: QuestionConfig) => {
    const affected = getRulesForQuestion(question.order_num);
    setAffectedRules(affected);
    setDeleteTarget(question);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);

    const deletedOrder = deleteTarget.order_num;
    const success = await deleteQuestion(deleteTarget.id);

    if (success) {
      const toReorder = questions
        .filter((q) => q.order_num > deletedOrder)
        .map((q) => ({ id: q.id, order_num: q.order_num - 1 }));

      if (toReorder.length > 0) {
        await reorderQuestions(toReorder);
      }

      loadData();
    }

    setDeleteTarget(null);
    setAffectedRules([]);
    setIsSaving(false);
  };

  const handleOptionChange = (optionIndex: number, value: string) => {
    if (!editForm) return;
    const newOptions = [...editForm.options];
    newOptions[optionIndex] = value;
    setEditForm({ ...editForm, options: newOptions });
  };

  const activeQuestions = questions.filter((q) => q.is_active);
  const scoring = computeScoringInfo(activeQuestions.length);
  const newScoring = computeScoringInfo(activeQuestions.length + 1);
  const removedScoring =
    activeQuestions.length > 1 ? computeScoringInfo(activeQuestions.length - 1) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Editor de Preguntas</h1>
        <p className="text-slate-500">Configura las preguntas del assessment</p>
      </div>

      <ScoringInfoHeader
        scoring={scoring}
        newScoring={newScoring}
        removedScoring={removedScoring}
        ruleDependencyMap={ruleDependencyMap}
        totalQuestions={questions.length}
      />

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-800 font-medium">Nota importante</p>
          <p className="text-amber-700 text-sm">
            Los cambios en las preguntas solo aplicarán a los tests futuros. Los tests ya completados mantendrán las preguntas originales.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Agregar pregunta
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
          </div>
        ) : questions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No hay preguntas configuradas
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {questions.map((question, index) => (
              <div key={question.id} className={`p-4 ${!question.is_active ? 'opacity-50' : ''}`}>
                {editingId === question.id && editForm ? (
                  <EditQuestionForm
                    orderNum={question.order_num}
                    editForm={editForm}
                    isSaving={isSaving}
                    onFormChange={setEditForm}
                    onOptionChange={handleOptionChange}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                ) : (
                  <QuestionRow
                    question={question}
                    index={index}
                    totalCount={questions.length}
                    linkedRules={getRulesForQuestion(question.order_num)}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onToggleActive={handleToggleActive}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateQuestionModal
          nextOrderNum={questions.length + 1}
          currentScoring={scoring}
          newScoring={newScoring}
          onClose={() => setShowCreateModal(false)}
          onCreated={loadData}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          question={deleteTarget}
          affectedRules={affectedRules}
          currentScoring={scoring}
          removedScoring={removedScoring}
          isSaving={isSaving}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteTarget(null);
            setAffectedRules([]);
          }}
        />
      )}

      {reorderTarget && (
        <ReorderConfirmModal
          affectedRules={reorderTarget.affected}
          onConfirm={handleConfirmReorder}
          onCancel={() => setReorderTarget(null)}
        />
      )}
    </div>
  );
}

function fmt(n: number): string {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

function ScoringInfoHeader({
  scoring,
  newScoring,
  removedScoring,
  ruleDependencyMap,
  totalQuestions,
}: {
  scoring: ScoringDistribution;
  newScoring: ScoringDistribution;
  removedScoring: ScoringDistribution | null;
  ruleDependencyMap: Map<number, AnchorRule[]>;
  totalQuestions: number;
}) {
  const questionsWithRules = Array.from(ruleDependencyMap.entries());

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <Info className="w-5 h-5 text-cyan-600" />
          <h2 className="font-semibold text-slate-800">Distribución de puntuación (Total: 100 pts)</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">El puntaje se normaliza automáticamente a 100 puntos sin importar la cantidad de preguntas.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-600">Distribución actual</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{totalQuestions} preguntas</p>
            <p className="text-sm text-cyan-700 font-medium mt-1">
              {fmt(scoring.pointsPerQuestion)} pts / pregunta
            </p>
            <div className="flex gap-3 mt-2 text-xs text-slate-500">
              <span>A={fmt(scoring.optionA)}</span>
              <span>B={fmt(scoring.optionB)}</span>
              <span>C={fmt(scoring.optionC)}</span>
            </div>
          </div>

          <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Si se agrega una pregunta</span>
            </div>
            <p className="text-lg font-bold text-emerald-800">{newScoring.questionCount} preguntas</p>
            <p className="text-sm text-emerald-600 mt-1">
              {fmt(newScoring.pointsPerQuestion)} pts / pregunta
            </p>
            <div className="flex gap-3 mt-2 text-xs text-emerald-600">
              <span>A={fmt(newScoring.optionA)}</span>
              <span>B={fmt(newScoring.optionB)}</span>
              <span>C={fmt(newScoring.optionC)}</span>
            </div>
          </div>

          <div className="bg-red-50/50 rounded-lg p-4 border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">Si se elimina una pregunta</span>
            </div>
            {removedScoring ? (
              <>
                <p className="text-lg font-bold text-red-800">{removedScoring.questionCount} preguntas</p>
                <p className="text-sm text-red-600 mt-1">
                  {fmt(removedScoring.pointsPerQuestion)} pts / pregunta
                </p>
                <div className="flex gap-3 mt-2 text-xs text-red-500">
                  <span>A={fmt(removedScoring.optionA)}</span>
                  <span>B={fmt(removedScoring.optionB)}</span>
                  <span>C={fmt(removedScoring.optionC)}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-red-600">No se puede eliminar la última pregunta</p>
            )}
          </div>
        </div>
      </div>

      {questionsWithRules.length > 0 && (
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-slate-700">
              Preguntas vinculadas a reglas de anclaje
            </span>
          </div>
          <div className="space-y-2">
            {questionsWithRules.map(([qNum, qRules]) => (
              <div
                key={qNum}
                className="flex items-start gap-3 p-3 bg-amber-50/60 rounded-lg border border-amber-100"
              >
                <Link2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">
                    Pregunta Q{qNum}
                  </p>
                  <div className="mt-1 space-y-1">
                    {qRules.map((rule) => (
                      <p key={rule.id} className="text-xs text-amber-700">
                        {rule.name} {!rule.is_active && '(inactiva)'}
                      </p>
                    ))}
                  </div>
                </div>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium flex-shrink-0">
                  {qRules.length} {qRules.length === 1 ? 'regla' : 'reglas'}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-600 mt-3">
            Eliminar o reordenar estas preguntas puede afectar la lógica de negocio del sistema.
          </p>
        </div>
      )}
    </div>
  );
}

function QuestionRow({
  question,
  index,
  totalCount,
  linkedRules,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  question: QuestionConfig;
  index: number;
  totalCount: number;
  linkedRules: AnchorRule[];
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onEdit: (question: QuestionConfig) => void;
  onDelete: (question: QuestionConfig) => void;
  onToggleActive: (question: QuestionConfig) => void;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-sm">
          {question.order_num}
        </span>
        <button
          onClick={() => onMoveDown(index)}
          disabled={index === totalCount - 1}
          className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-medium text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">
            {question.category}
          </span>
          {!question.is_active && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Inactiva
            </span>
          )}
          {linkedRules.length > 0 && (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {linkedRules.length} {linkedRules.length === 1 ? 'regla vinculada' : 'reglas vinculadas'}
            </span>
          )}
        </div>
        <p className="text-slate-800 mb-3">{question.question_text}</p>
        <div className="space-y-1.5">
          {question.options.map((option, optIndex) => (
            <div key={optIndex} className="flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 w-5 h-5 rounded bg-slate-100 text-slate-500 flex items-center justify-center text-xs">
                {['A', 'B', 'C'][optIndex]}
              </span>
              <span className="text-slate-600">{option}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onToggleActive(question)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            question.is_active
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {question.is_active ? 'Activa' : 'Inactiva'}
        </button>
        <button
          onClick={() => onEdit(question)}
          className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(question)}
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function EditQuestionForm({
  orderNum,
  editForm,
  isSaving,
  onFormChange,
  onOptionChange,
  onSave,
  onCancel,
}: {
  orderNum: number;
  editForm: { question_text: string; category: string; options: string[] };
  isSaving: boolean;
  onFormChange: (form: { question_text: string; category: string; options: string[] }) => void;
  onOptionChange: (index: number, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-semibold">
          {orderNum}
        </span>
        <input
          type="text"
          value={editForm.category}
          onChange={(e) => onFormChange({ ...editForm, category: e.target.value })}
          placeholder="Categoría"
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
        />
      </div>

      <textarea
        value={editForm.question_text}
        onChange={(e) => onFormChange({ ...editForm, question_text: e.target.value })}
        placeholder="Texto de la pregunta"
        rows={2}
        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
      />

      <div className="space-y-2">
        {editForm.options.map((option, optIndex) => (
          <div key={optIndex} className="flex items-center gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-medium">
              {['A', 'B', 'C'][optIndex]}
            </span>
            <input
              type="text"
              value={option}
              onChange={(e) => onOptionChange(optIndex, e.target.value)}
              placeholder={`Opción ${optIndex + 1}`}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}

function CreateQuestionModal({
  nextOrderNum,
  currentScoring,
  newScoring,
  onClose,
  onCreated,
}: {
  nextOrderNum: number;
  currentScoring: ScoringDistribution;
  newScoring: ScoringDistribution;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    question_text: '',
    category: '',
    options: ['', '', ''],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question_text.trim() || !form.category.trim()) return;
    if (form.options.some((o) => !o.trim())) return;

    setIsSubmitting(true);
    const result = await createQuestion({
      ...form,
      order_num: nextOrderNum,
    });

    if (result) {
      onCreated();
      onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Agregar nueva pregunta</h3>
        <p className="text-sm text-slate-500 mb-4">Se asignará como pregunta #{nextOrderNum}</p>

        <div className="bg-cyan-50 border border-cyan-100 rounded-lg p-3 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-medium text-cyan-800">Impacto en el scoring</span>
          </div>
          <p className="text-xs text-cyan-700">
            Cada pregunta pasará de {fmt(currentScoring.pointsPerQuestion)} a {fmt(newScoring.pointsPerQuestion)} puntos máximos.
            El total se mantiene en 100 puntos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Ej: Contabilidad, Presupuesto..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pregunta</label>
            <textarea
              value={form.question_text}
              onChange={(e) => setForm({ ...form, question_text: e.target.value })}
              placeholder="Escribe la pregunta..."
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Opciones de respuesta</label>
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-medium">
                    {['A', 'B', 'C'][i]}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...form.options];
                      newOpts[i] = e.target.value;
                      setForm({ ...form, options: newOpts });
                    }}
                    placeholder={
                      i === 0
                        ? 'Nivel básico...'
                        : i === 1
                        ? 'Nivel intermedio...'
                        : 'Nivel avanzado...'
                    }
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              A = {fmt(newScoring.optionA)} pts, B = {fmt(newScoring.optionB)} pts, C = {fmt(newScoring.optionC)} pts
            </p>
          </div>
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
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creando...' : 'Crear pregunta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  question,
  affectedRules,
  currentScoring,
  removedScoring,
  isSaving,
  onConfirm,
  onCancel,
}: {
  question: QuestionConfig;
  affectedRules: AnchorRule[];
  currentScoring: ScoringDistribution;
  removedScoring: ScoringDistribution | null;
  isSaving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Confirmar eliminación</h3>
        </div>

        <p className="text-slate-600 mb-4">
          Vas a eliminar la pregunta Q{question.order_num}: <span className="font-medium">"{question.question_text}"</span>
        </p>

        {affectedRules.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-800">
                Reglas de negocio afectadas
              </span>
            </div>
            <div className="space-y-2">
              {affectedRules.map((rule) => (
                <div key={rule.id} className="text-sm text-red-700 pl-6">
                  <p className="font-medium">{rule.name}</p>
                  <p className="text-xs text-red-600">{rule.description}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-red-700 mt-3 font-medium">
              Estas reglas dejarán de funcionar correctamente. Deberás actualizarlas manualmente en la sección de Reglas.
            </p>
          </div>
        )}

        {removedScoring && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Impacto en el scoring</span>
            </div>
            <p className="text-xs text-amber-700">
              Cada pregunta restante pasará de {fmt(currentScoring.pointsPerQuestion)} a {fmt(removedScoring.pointsPerQuestion)} puntos máximos.
              El total se mantiene en 100 puntos. Las preguntas posteriores se renumerarán.
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isSaving}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Eliminando...' : 'Eliminar pregunta'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReorderConfirmModal({
  affectedRules,
  onConfirm,
  onCancel,
}: {
  affectedRules: AnchorRule[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-full">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Confirmar reorden</h3>
        </div>

        <p className="text-slate-600 mb-4">
          Este cambio de orden afectará las siguientes reglas de anclaje:
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="space-y-2">
            {affectedRules.map((rule) => (
              <div key={rule.id} className="text-sm text-amber-800">
                <p className="font-medium">{rule.name}</p>
                <p className="text-xs text-amber-600">
                  Referencia a Q{rule.config.question_id} -- la regla seguirá apuntando al mismo número de pregunta, pero el contenido de esa posición cambiará.
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Después del reorden, verifica que las reglas de anclaje sigan apuntando a las preguntas correctas.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Confirmar reorden
          </button>
        </div>
      </div>
    </div>
  );
}
