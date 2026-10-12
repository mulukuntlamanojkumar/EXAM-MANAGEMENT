import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { 
  Plus, 
  Send, 
  XOctagon, 
  UserCheck, 
  FileText, 
  Trash2, 
  Clock, 
  CheckSquare, 
  Calendar,
  Layers
} from 'lucide-react';

export const ExamManager = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [confirmPublishOpen, setConfirmPublishOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  // Form states
  const [examForm, setExamForm] = useState({
    title: '',
    code: '',
    description: '',
    instructions: '1. Maintain fullscreen focus.\n2. Do not switch browser tabs.\n3. Exam will auto-submit when timer expires.',
    subjectId: '',
    durationMinutes: 60,
    passingMarks: 40.0,
    startTime: '',
    endTime: '',
    shuffleQuestions: false,
    showResultsImmediately: true,
    allowReview: true,
    maxAttempts: 1,
    selectedQuestionIds: [],
  });

  const [assignedExaminerIds, setAssignedExaminerIds] = useState([]);
  const [enrolledStudentIds, setEnrolledStudentIds] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examsRes, subsRes, quesRes, exRes, stRes] = await Promise.all([
        api.get('/admin/exams?size=100'),
        api.get('/admin/subjects'),
        api.get('/admin/questions?size=100'),
        api.get('/admin/examiners'),
        api.get('/admin/students'),
      ]);
      setExams(examsRes.data.content || []);
      setSubjects(subsRes.data || []);
      setQuestions(quesRes.data.content || []);
      setExaminers(exRes.data || []);
      setStudents(stRes.data || []);
    } catch (err) {
      console.error('Failed to load exam manager data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (examForm.selectedQuestionIds.length === 0) {
      alert('Please select at least one question for the exam from the question bank.');
      return;
    }

    try {
      await api.post('/admin/exams', {
        title: examForm.title,
        code: examForm.code,
        description: examForm.description,
        instructions: examForm.instructions,
        subjectId: examForm.subjectId,
        durationMinutes: parseInt(examForm.durationMinutes),
        passingMarks: parseFloat(examForm.passingMarks),
        startTime: examForm.startTime ? new Date(examForm.startTime).toISOString() : null,
        endTime: examForm.endTime ? new Date(examForm.endTime).toISOString() : null,
        questionIds: examForm.selectedQuestionIds,
        shuffleQuestions: examForm.shuffleQuestions,
        showResultsImmediately: examForm.showResultsImmediately,
        allowReview: examForm.allowReview,
        maxAttempts: parseInt(examForm.maxAttempts),
      });

      setCreateModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create exam');
    }
  };

  const handlePublishExam = async () => {
    try {
      await api.post(`/admin/exams/${selectedExam.id}/publish`);
      setConfirmPublishOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish exam');
    }
  };

  const handleCancelExam = async (exam) => {
    if (window.confirm(`Cancel examination "${exam.title}"?`)) {
      try {
        await api.post(`/admin/exams/${exam.id}/cancel`);
        fetchData();
      } catch (err) {
        alert('Failed to cancel exam');
      }
    }
  };

  const handleSaveExaminers = async () => {
    try {
      await api.post(`/admin/exams/${selectedExam.id}/assign-examiners`, assignedExaminerIds);
      setAssignModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to update examiners');
    }
  };

  const handleSaveEnrollments = async () => {
    try {
      await api.post(`/admin/exams/${selectedExam.id}/enroll-students`, enrolledStudentIds);
      setEnrollModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to update enrollments');
    }
  };

  const toggleQuestionSelection = (qId) => {
    setExamForm((prev) => {
      const exists = prev.selectedQuestionIds.includes(qId);
      return {
        ...prev,
        selectedQuestionIds: exists
          ? prev.selectedQuestionIds.filter((id) => id !== qId)
          : [...prev.selectedQuestionIds, qId],
      };
    });
  };

  const columns = [
    {
      header: 'Exam Title',
      accessor: 'title',
      render: (e) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white leading-tight">{e.title}</p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{e.code}</p>
        </div>
      ),
    },
    { header: 'Subject', accessor: 'subjectName' },
    {
      header: 'Duration',
      accessor: 'durationMinutes',
      render: (e) => (
        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" /> {e.durationMinutes} mins
        </span>
      ),
    },
    {
      header: 'Total / Passing',
      render: (e) => (
        <span>
          {e.totalMarks} / <span className="font-bold text-emerald-600">{e.passingMarks}</span>
        </span>
      ),
    },
    {
      header: 'Questions',
      render: (e) => (
        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
          {e.questionsSnapshot?.length || 0} questions
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (e) => {
        let variant = 'default';
        if (e.status === 'PUBLISHED') variant = 'success';
        if (e.status === 'CANCELLED') variant = 'danger';
        return <Badge variant={variant}>{e.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      render: (e) => (
        <div className="flex items-center gap-1">
          {e.status === 'DRAFT' && (
            <button
              onClick={() => {
                setSelectedExam(e);
                setConfirmPublishOpen(true);
              }}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Publish Exam"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
          {e.status === 'PUBLISHED' && (
            <button
              onClick={() => handleCancelExam(e)}
              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Cancel Exam"
            >
              <XOctagon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              setSelectedExam(e);
              setAssignedExaminerIds(e.assignedExaminerIds || []);
              setAssignModalOpen(true);
            }}
            className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Assign Examiners"
          >
            <UserCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedExam(e);
              setEnrolledStudentIds(e.enrolledStudentIds || []);
              setEnrollModalOpen(true);
            }}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Enroll Students"
          >
            <CheckSquare className="w-4 h-4" />
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
            Examinations & Scheduling
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create assessment papers, set timers, assemble questions, and publish exams.
          </p>
        </div>
        <button
          onClick={() => {
            setExamForm({
              title: '',
              code: 'EXAM-' + Date.now().toString().slice(-4),
              description: '',
              instructions: '1. Maintain fullscreen focus.\n2. Do not switch browser tabs.\n3. Exam will auto-submit when timer expires.',
              subjectId: subjects[0]?.id || '',
              durationMinutes: 60,
              passingMarks: 40.0,
              startTime: '',
              endTime: '',
              shuffleQuestions: false,
              showResultsImmediately: true,
              allowReview: true,
              maxAttempts: 1,
              selectedQuestionIds: questions.map((q) => q.id),
            });
            setCreateModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Create Exam
        </button>
      </div>

      <DataTable
        columns={columns}
        data={exams}
        loading={loading}
        searchPlaceholder="Search exams by title, code, subject..."
        emptyTitle="No exams configured yet"
      />

      {/* Create Exam Wizard Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule & Configure Examination"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Exam Title *</label>
              <input
                type="text"
                required
                value={examForm.title}
                onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                placeholder="e.g. Midterm Assessment: Computer Networks"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Exam Code * (Unique)</label>
              <input
                type="text"
                required
                value={examForm.code}
                onChange={(e) => setExamForm({ ...examForm, code: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Subject *</label>
              <select
                required
                value={examForm.subjectId}
                onChange={(e) => setExamForm({ ...examForm, subjectId: e.target.value })}
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
              <label className="block text-xs font-semibold mb-1">Duration (Minutes) *</label>
              <input
                type="number"
                min={5}
                required
                value={examForm.durationMinutes}
                onChange={(e) => setExamForm({ ...examForm, durationMinutes: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Passing Marks *</label>
              <input
                type="number"
                min={1}
                required
                value={examForm.passingMarks}
                onChange={(e) => setExamForm({ ...examForm, passingMarks: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Candidate Instructions</label>
            <textarea
              rows={2}
              value={examForm.instructions}
              onChange={(e) => setExamForm({ ...examForm, instructions: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Question Selection Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Select Questions ({examForm.selectedQuestionIds.length} chosen)
              </span>
              <span className="text-[11px] text-slate-500">
                Total marks will be auto-calculated from selected items
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {questions.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No questions in Question Bank</p>
              ) : (
                questions.map((q) => {
                  const selected = examForm.selectedQuestionIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestionSelection(q.id)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selected
                          ? 'bg-indigo-50/80 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{q.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">{q.type}</span>
                          <span>•</span>
                          <span>Marks: {q.marks}</span>
                          <span>•</span>
                          <span>Subject: {q.subjectName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700">
              Save Exam Draft
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Examiners Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Examiners to ${selectedExam?.title}`}
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-500">Select faculty members authorized to review and evaluate this exam:</p>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {examiners.map((ex) => {
              const checked = assignedExaminerIds.includes(ex.id);
              return (
                <label
                  key={ex.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs cursor-pointer hover:bg-indigo-50/40"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setAssignedExaminerIds((prev) =>
                          checked ? prev.filter((id) => id !== ex.id) : [...prev, ex.id]
                        );
                      }}
                      className="rounded text-indigo-600"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{ex.fullName}</p>
                      <p className="text-[11px] text-slate-400">{ex.email}</p>
                    </div>
                  </div>
                  <Badge variant="warning">Faculty</Badge>
                </label>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveExaminers}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
            >
              Save Assignment
            </button>
          </div>
        </div>
      </Modal>

      {/* Enroll Students Modal */}
      <Modal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        title={`Enroll Students for ${selectedExam?.title}`}
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-500">Select enrolled students or leave empty for open cohort access:</p>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {students.map((st) => {
              const checked = enrolledStudentIds.includes(st.id);
              return (
                <label
                  key={st.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs cursor-pointer hover:bg-indigo-50/40"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setEnrolledStudentIds((prev) =>
                          checked ? prev.filter((id) => id !== st.id) : [...prev, st.id]
                        );
                      }}
                      className="rounded text-indigo-600"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{st.fullName}</p>
                      <p className="text-[11px] text-slate-400">{st.studentId || st.email}</p>
                    </div>
                  </div>
                  <Badge variant="primary">Student</Badge>
                </label>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setEnrollModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEnrollments}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
            >
              Save Enrollment
            </button>
          </div>
        </div>
      </Modal>

      {/* Publish Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmPublishOpen}
        onClose={() => setConfirmPublishOpen(false)}
        onConfirm={handlePublishExam}
        title="Publish Examination"
        message={`Are you ready to publish "${selectedExam?.title}"? Once published, registered students will be able to start their attempt according to the exam schedule.`}
        confirmText="Publish Live"
      />
    </div>
  );
};
