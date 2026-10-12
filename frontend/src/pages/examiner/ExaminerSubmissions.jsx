import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Eye, Edit3, CheckCircle, AlertTriangle, User } from 'lucide-react';
import dayjs from 'dayjs';

export const ExaminerSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Grade modal
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [gradingQuestion, setGradingQuestion] = useState(null);
  const [awardedMarks, setAwardedMarks] = useState(0);
  const [examinerComment, setExaminerComment] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/examiner/exams');
      const assignedExams = res.data.content || [];
      if (assignedExams.length > 0) {
        const subsPromises = assignedExams.map((e) =>
          api.get(`/examiner/exams/${e.id}/submissions?size=50`)
        );
        const results = await Promise.all(subsPromises);
        const allSubs = results.flatMap((r) => r.data.content || []);
        setSubmissions(allSubs);
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      console.error('Failed to load examiner submissions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const openEvaluation = async (sub) => {
    try {
      const res = await api.get(`/examiner/submissions/${sub.id}/result`);
      setSelectedResult(res.data);
      setGradeModalOpen(true);
    } catch (err) {
      alert('Failed to load candidate submission details');
    }
  };

  const submitManualGrade = async (questionId) => {
    setSavingGrade(true);
    try {
      await api.post(`/examiner/submissions/${selectedResult.submissionId}/grade`, {
        questionId,
        awardedMarks: parseFloat(awardedMarks),
        examinerComment,
      });

      // Refresh result
      const res = await api.get(`/examiner/submissions/${selectedResult.submissionId}/result`);
      setSelectedResult(res.data);
      setGradingQuestion(null);
      fetchSubmissions();
    } catch (err) {
      alert('Failed to save marks');
    } finally {
      setSavingGrade(false);
    }
  };

  const columns = [
    {
      header: 'Candidate',
      accessor: 'studentName',
      render: (s) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white leading-tight">{s.studentName}</p>
          <p className="text-[11px] text-slate-400">{s.studentEmail}</p>
        </div>
      ),
    },
    { header: 'Exam Paper', accessor: 'examTitle' },
    {
      header: 'Current Score',
      render: (s) => (
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {s.totalScore} / {s.maxScore} ({Math.round(s.percentage)}%)
        </span>
      ),
    },
    {
      header: 'Proctor Events',
      render: (s) => (
        <span className="font-mono text-xs text-slate-500">
          {s.proctorWarningsCount} events
        </span>
      ),
    },
    {
      header: 'Evaluation Status',
      accessor: 'status',
      render: (s) => {
        let variant = s.status === 'EVALUATED' ? 'success' : 'info';
        return <Badge variant={variant}>{s.status}</Badge>;
      },
    },
    {
      header: 'Action',
      render: (s) => (
        <button
          onClick={() => openEvaluation(s)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" /> Grade & Review
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Candidate Evaluations & Manual Grading
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Inspect candidate answers, grade descriptive questions, and provide qualitative feedback.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={submissions}
        loading={loading}
        searchPlaceholder="Search candidate or exam..."
        emptyTitle="No candidate submissions for your assigned exams"
      />

      {/* Grade and Review Modal */}
      <Modal
        isOpen={gradeModalOpen}
        onClose={() => setGradeModalOpen(false)}
        title="Candidate Answer Paper Evaluation"
        maxWidth="max-w-4xl"
      >
        {selectedResult && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedResult.studentName}</p>
                <p className="text-slate-500">{selectedResult.examTitle} ({selectedResult.examCode})</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  Total: {selectedResult.totalScore} / {selectedResult.maxScore}
                </p>
                <Badge variant={selectedResult.passed ? 'success' : 'danger'}>
                  {selectedResult.passed ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {selectedResult.questions?.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold text-slate-900 dark:text-white">
                      Q{idx + 1}. {q.title}
                    </p>
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {q.awardedMarks} / {q.maxMarks} marks
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-500 mb-1 font-semibold">Candidate Submission:</p>
                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                      {q.studentSelectedOptions?.length > 0
                        ? q.studentSelectedOptions.join(', ')
                        : q.studentTextAnswer || <span className="italic text-slate-400">No response</span>}
                    </p>
                  </div>

                  {q.type === 'DESCRIPTIVE' && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      {gradingQuestion === q.questionId ? (
                        <div className="w-full space-y-2 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                          <div className="flex items-center gap-3">
                            <label className="font-semibold">Award Marks (Max: {q.maxMarks}):</label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={q.maxMarks}
                              value={awardedMarks}
                              onChange={(e) => setAwardedMarks(e.target.value)}
                              className="w-24 px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Examiner comments / feedback..."
                              value={examinerComment}
                              onChange={(e) => setExaminerComment(e.target.value)}
                              className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setGradingQuestion(null)}
                              className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={savingGrade}
                              onClick={() => submitManualGrade(q.questionId)}
                              className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                            >
                              {savingGrade ? 'Saving...' : 'Update Marks'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] text-slate-500 italic">
                            {q.examinerComment ? `Comment: ${q.examinerComment}` : 'Pending examiner manual marks'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setGradingQuestion(q.questionId);
                              setAwardedMarks(q.awardedMarks || 0);
                              setExaminerComment(q.examinerComment || '');
                            }}
                            className="px-3 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100"
                          >
                            Grade Question
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
