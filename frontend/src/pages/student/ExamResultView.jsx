import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Badge } from '../../components/common/Badge';
import { 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Award, 
  Clock, 
  AlertTriangle,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import dayjs from 'dayjs';

export const ExamResultView = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/student/submissions/${submissionId}/result`);
        setResult(res.data);

        // Fire celebration confetti if student passed!
        if (res.data.passed) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch (err) {
        alert('Failed to load examination result');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [submissionId]);

  if (loading || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 px-4">
      {/* Top back button */}
      <div>
        <button
          onClick={() => navigate('/student/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      {/* Main Scorecard Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
          <div>
            <span className="font-mono text-xs text-indigo-300 font-bold uppercase tracking-wider">
              {result.examCode}
            </span>
            <h1 className="text-xl sm:text-2xl font-black mt-1">{result.examTitle}</h1>
            <p className="text-xs text-indigo-200 mt-1">
              Candidate: {result.studentName} • Completed {dayjs(result.submitTime).format('MMM D, YYYY h:mm A')}
            </p>
          </div>

          <div className="flex flex-col sm:items-end">
            <div
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-2 ${
                result.passed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              }`}
            >
              {result.passed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {result.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
            </div>
            <p className="text-3xl sm:text-4xl font-black tracking-tight">
              {result.totalScore} <span className="text-lg font-semibold text-indigo-200">/ {result.maxScore}</span>
            </p>
            <p className="text-xs text-indigo-300 mt-0.5">
              Percentage: {Math.round(result.percentage)}% (Passing mark: {result.passingMarks})
            </p>
          </div>
        </div>

        {result.proctorWarningsCount > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Proctor Note: {result.proctorWarningsCount} focus loss/tab events were flagged during the examination.
            </span>
          </div>
        )}
      </div>

      {/* Question Breakdown and Review */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-indigo-600" /> Question-by-Question Review ({result.questions?.length} items)
        </h2>

        {result.questions?.map((q, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border text-xs transition-all ${
              q.correct
                ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-950/80 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-950/80 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                    q.correct ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {idx + 1}
                </span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{q.title}</p>
              </div>
              <span className="font-mono font-bold text-xs shrink-0 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                {q.awardedMarks} / {q.maxMarks} marks
              </span>
            </div>

            {/* Answer details */}
            <div className="mt-3 pl-8 space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-500 block mb-0.5">Your Answer:</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {q.studentSelectedOptions?.length > 0
                    ? q.studentSelectedOptions.join(', ')
                    : q.studentTextAnswer || <span className="italic text-slate-400">No response provided</span>}
                </p>
              </div>

              {q.correctAnswers?.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-0.5">Correct Answer:</span>
                  <p className="font-bold text-emerald-900 dark:text-emerald-200">
                    {q.correctAnswers.join(', ')}
                  </p>
                </div>
              )}

              {q.explanation && (
                <div className="p-3 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-400 block mb-0.5">Explanation & Rationale:</span>
                  <p>{q.explanation}</p>
                </div>
              )}

              {q.examinerComment && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                  Examiner feedback: {q.examinerComment}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
