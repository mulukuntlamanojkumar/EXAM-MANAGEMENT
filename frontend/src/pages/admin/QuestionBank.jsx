import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { 
  Plus, 
  Trash2, 
  Edit, 
  FileQuestion, 
  CheckCircle, 
  X, 
  HelpCircle,
  Tag
} from 'lucide-react';

export const QuestionBank = ({ isExaminer = false }) => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Question Form
  const [formData, setFormData] = useState({
    subjectId: '',
    type: 'MCQ_SINGLE',
    title: '',
    options: ['', '', '', ''],
    correctAnswers: [],
    explanation: '',
    marks: 2.0,
    negativeMarks: 0.5,
    difficulty: 'MEDIUM',
    tags: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const basePath = isExaminer ? '/examiner' : '/admin';
      const [qRes, sRes] = await Promise.all([
        api.get(`${basePath}/questions?size=100`),
        api.get(`${basePath}/subjects`),
      ]);
      setQuestions(qRes.data.content || []);
      setSubjects(sRes.data || []);
      if (!formData.subjectId && sRes.data?.length > 0) {
        setFormData((prev) => ({ ...prev, subjectId: sRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isExaminer]);

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (
      (formData.type === 'MCQ_SINGLE' || formData.type === 'MCQ_MULTIPLE') &&
      formData.correctAnswers.length === 0
    ) {
      alert('Please select at least one correct answer.');
      return;
    }

    const payload = {
      subjectId: formData.subjectId,
      type: formData.type,
      title: formData.title,
      options:
        formData.type === 'TRUE_FALSE'
          ? ['True', 'False']
          : formData.type === 'SHORT_ANSWER' || formData.type === 'DESCRIPTIVE'
          ? []
          : formData.options.filter((o) => o.trim() !== ''),
      correctAnswers: formData.correctAnswers,
      explanation: formData.explanation,
      marks: parseFloat(formData.marks),
      negativeMarks: parseFloat(formData.negativeMarks),
      difficulty: formData.difficulty,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
    };

    try {
      const basePath = isExaminer ? '/examiner' : '/admin';
      if (selectedQuestion) {
        await api.put(`${basePath}/questions/${selectedQuestion.id}`, payload);
      } else {
        await api.post(`${basePath}/questions`, payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save question');
    }
  };

  const handleDelete = async () => {
    try {
      const basePath = isExaminer ? '/examiner' : '/admin';
      await api.delete(`${basePath}/questions/${selectedQuestion.id}`);
      setDeleteConfirmOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to delete question');
    }
  };

  const openCreateModal = () => {
    setSelectedQuestion(null);
    setFormData({
      subjectId: subjects[0]?.id || '',
      type: 'MCQ_SINGLE',
      title: '',
      options: ['', '', '', ''],
      correctAnswers: [],
      explanation: '',
      marks: 2.0,
      negativeMarks: 0.5,
      difficulty: 'MEDIUM',
      tags: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (q) => {
    setSelectedQuestion(q);
    setFormData({
      subjectId: q.subjectId,
      type: q.type,
      title: q.title,
      options: q.options?.length > 0 ? q.options : ['', '', '', ''],
      correctAnswers: q.correctAnswers || [],
      explanation: q.explanation || '',
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      difficulty: q.difficulty,
      tags: q.tags?.join(', ') || '',
    });
    setModalOpen(true);
  };

  const handleOptionChange = (index, value) => {
    const updated = [...formData.options];
    updated[index] = value;
    setFormData({ ...formData, options: updated });
  };

  const toggleCorrectAnswer = (answerValue) => {
    if (formData.type === 'MCQ_SINGLE' || formData.type === 'TRUE_FALSE') {
      setFormData({ ...formData, correctAnswers: [answerValue] });
    } else if (formData.type === 'MCQ_MULTIPLE') {
      const exists = formData.correctAnswers.includes(answerValue);
      setFormData({
        ...formData,
        correctAnswers: exists
          ? formData.correctAnswers.filter((a) => a !== answerValue)
          : [...formData.correctAnswers, answerValue],
      });
    }
  };

  const filteredQuestions =
    selectedSubject === 'ALL'
      ? questions
      : questions.filter((q) => q.subjectId === selectedSubject);

  const columns = [
    {
      header: 'Question Title',
      accessor: 'title',
      render: (q) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white line-clamp-2">{q.title}</p>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
            <span>Subject: {q.subjectName}</span>
            <span>•</span>
            <span>Creator: {q.creatorName}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (q) => <Badge variant="primary">{q.type.replace('_', ' ')}</Badge>,
    },
    {
      header: 'Difficulty',
      accessor: 'difficulty',
      render: (q) => {
        let variant = 'default';
        if (q.difficulty === 'EASY') variant = 'success';
        if (q.difficulty === 'MEDIUM') variant = 'warning';
        if (q.difficulty === 'HARD') variant = 'danger';
        return <Badge variant={variant}>{q.difficulty}</Badge>;
      },
    },
    {
      header: 'Marks (+ / -)',
      render: (q) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          +{q.marks} / -{q.negativeMarks}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (q) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEditModal(q)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedQuestion(q);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Question Bank
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create and maintain questions, answer keys, scoring rules, and explanations.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* Subject Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedSubject('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedSubject === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Subjects ({questions.length})
        </button>
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSubject(s.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedSubject === s.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {s.name} ({s.code})
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredQuestions}
        loading={loading}
        searchPlaceholder="Search questions..."
        emptyTitle="No questions found in repository"
      />

      {/* Create / Edit Question Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedQuestion ? 'Edit Question' : 'Create Question'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Subject *</label>
              <select
                required
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Question Type *</label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const t = e.target.value;
                  let initialAnswers = [];
                  if (t === 'TRUE_FALSE') initialAnswers = ['True'];
                  setFormData({
                    ...formData,
                    type: t,
                    correctAnswers: initialAnswers,
                  });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="MCQ_SINGLE">Multiple Choice (Single Answer)</option>
                <option value="MCQ_MULTIPLE">Multiple Choice (Multiple Answers)</option>
                <option value="TRUE_FALSE">True / False</option>
                <option value="SHORT_ANSWER">Short Answer</option>
                <option value="DESCRIPTIVE">Descriptive / Essay</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Question Content / Problem Statement *</label>
            <textarea
              required
              rows={3}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="State the question clearly..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Options for MCQ */}
          {(formData.type === 'MCQ_SINGLE' || formData.type === 'MCQ_MULTIPLE') && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Options & Answer Key</span>
                <span className="text-[11px] text-slate-500">
                  Select checkbox for the correct answer(s)
                </span>
              </div>
              {formData.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type={formData.type === 'MCQ_SINGLE' ? 'radio' : 'checkbox'}
                    name="correctRadio"
                    checked={formData.correctAnswers.includes(opt) && opt.trim() !== ''}
                    onChange={() => opt.trim() && toggleCorrectAnswer(opt)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              ))}
            </div>
          )}

          {/* True / False Selection */}
          {formData.type === 'TRUE_FALSE' && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-2">Correct Answer:</span>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="tfChoice"
                    checked={formData.correctAnswers.includes('True')}
                    onChange={() => setFormData({ ...formData, correctAnswers: ['True'] })}
                  />
                  True
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="tfChoice"
                    checked={formData.correctAnswers.includes('False')}
                    onChange={() => setFormData({ ...formData, correctAnswers: ['False'] })}
                  />
                  False
                </label>
              </div>
            </div>
          )}

          {/* Short Answer Key */}
          {formData.type === 'SHORT_ANSWER' && (
            <div>
              <label className="block text-xs font-semibold mb-1">Accepted Correct Answer(s) (comma separated)</label>
              <input
                type="text"
                required
                value={formData.correctAnswers.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    correctAnswers: e.target.value.split(',').map((s) => s.trim()),
                  })
                }
                placeholder="e.g. Stack, stack, LIFO"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          )}

          {/* Descriptive Answer Key Guide */}
          {formData.type === 'DESCRIPTIVE' && (
            <div>
              <label className="block text-xs font-semibold mb-1">Evaluation Key / Rubric for Examiners</label>
              <textarea
                rows={2}
                value={formData.correctAnswers[0] || ''}
                onChange={(e) => setFormData({ ...formData, correctAnswers: [e.target.value] })}
                placeholder="Mention expected key points and marking guidelines..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Marks (+)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Negative Penalty (-)</label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={formData.negativeMarks}
                onChange={(e) => setFormData({ ...formData, negativeMarks: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Detailed Explanation / Rationale</label>
            <textarea
              rows={2}
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Explanation displayed to candidates during review..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700">
              Save Question
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Question"
        message="Are you sure you want to permanently delete this question from the bank?"
        danger={true}
      />
    </div>
  );
};
