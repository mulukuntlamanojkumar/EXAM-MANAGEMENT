import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Award,
  ShieldAlert
} from 'lucide-react';
import dayjs from 'dayjs';

export const SubmissionsManager = ({ isExaminer = false }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Result modal state
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const url = isExaminer ? '/examiner/submissions?size=100' : '/admin/submissions?size=100';
      const res = await api.get(url);
      setSubmissions(res.data.content || []);
    } catch (err) {
      console.error('Failed to load submissions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [isExaminer]);

  const viewResult = async (sub) => {
    setResultLoading(true);
    setResultModalOpen(true);
    try {
      const basePath = isExaminer ? '/examiner' : '/admin';
      const res = await api.get(`${basePath}/submissions/${sub.id}/result`);
      setSelectedResult(res.data);
    } catch (err) {
      alert('Failed to load submission result');
      setResultModalOpen(false);
    } finally {
      setResultLoading(false);
    }
  };

  const columns = [
    {
      header: 'Student',
      accessor: 'studentName',
      render: (s) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white leading-tight">{s.studentName}</p>
          <p className="text-[11px] text-slate-400">{s.studentEmail}</p>
        </div>
      ),
    },
    { header: 'Exam', accessor: 'examTitle' },
    {
      header: 'Submitted At',
      render: (s) => (
        <span className="text-slate-500 text-[11px]">
          {s.submitTime ? dayjs(s.submitTime).format('MMM D, YYYY h:mm A') : 'In Progress'}
        </span>
      ),
    },
    {
      header: 'Score',
      render: (s) => (
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {s.totalScore} / {s.maxScore} ({Math.round(s.percentage)}%)
        </span>
      ),
    },
    {
      header: 'Proctor Warnings',
      accessor: 'proctorWarningsCount',
      render: (s) => (
        <span className={`inline-flex items-center gap-1 font-mono text-xs font-semibold ${
          s.proctorWarningsCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
        }`}>
          {s.proctorWarningsCount > 0 && <AlertTriangle className="w-3.5 h-3.5" />}
          {s.proctorWarningsCount} events
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (s) => {
        let variant = 'default';
        if (s.status === 'EVALUATED') variant = s.passed ? 'success' : 'danger';
        else if (s.status === 'SUBMITTED') variant = 'info';
        return <Badge variant={variant}>{s.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      render: (s) => (
        <button
          onClick={() => viewResult(s)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> View Scorecard
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Submissions & Results
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review all candidate exam sessions, automatic marks, anti-cheat proctoring events, and scores.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={submissions}
        loading={loading}
        searchPlaceholder="Search submissions by student, exam title..."
        emptyTitle="No submissions recorded yet"
      />

      {/* Scorecard Modal */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title="Candidate Scorecard & Evaluation"
        maxWidth="max-w-4xl"
      >
        {resultLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading candidate scorecard...</div>
        ) : selectedResult ? (
          <div className="space-y-6">
            {/* Summary card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">{selectedResult.examTitle}</h3>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Candidate: {selectedResult.studentName} • Code: {selectedResult.examCode}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold mb-1">
                    {selectedResult.passed ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> PASSED
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> FAILED
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-black">{selectedResult.totalScore} / {selectedResult.maxScore}</p>
                  <p className="text-[11px] text-indigo-200">
                    {Math.round(selectedResult.percentage)}% (Passing: {selectedResult.passingMarks})
                  </p>
                </div>
              </div>

              {selectedResult.proctorWarningsCount > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-amber-300">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>
                    Warning: Candidate logged {selectedResult.proctorWarningsCount} anti-cheat proctoring events (tab switches / blur).
                  </span>
                </div>
              )}
            </div>

            {/* Questions Detailed Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Question Breakdown ({selectedResult.questions?.length} items)
              </h4>

              {selectedResult.questions?.map((q, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-xs transition-all ${
                    q.correct
                      ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50'
                      : 'bg-rose-50/40 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-bold text-slate-900 dark:text-white">
                      Q{idx + 1}. {q.title}
                    </p>
                    <span className="font-mono font-bold text-xs shrink-0">
                      {q.awardedMarks} / {q.maxMarks} marks
                    </span>
                  </div>

                  {/* Candidate Answer */}
                  <div className="mt-2 text-xs space-y-1">
                    <p className="text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Candidate Answer: </span>
                      {q.studentSelectedOptions?.length > 0
                        ? q.studentSelectedOptions.join(', ')
                        : q.studentTextAnswer || <span className="italic text-slate-400">No response provided</span>}
                    </p>

                    {q.correctAnswers?.length > 0 && (
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Correct Answer: </span>
                        {q.correctAnswers.join(', ')}
                      </p>
                    )}

                    {q.explanation && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 p-2 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
                        <span className="font-semibold">Explanation: </span>
                        {q.explanation}
                      </p>
                    )}

                    {q.examinerComment && (
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 italic">
                        Feedback: {q.examinerComment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
