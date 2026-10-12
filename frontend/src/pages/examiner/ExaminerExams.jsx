import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Clock, Users, FileText, CheckCircle2 } from 'lucide-react';

export const ExaminerExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/examiner/exams?size=100');
      setExams(res.data.content || []);
    } catch (err) {
      console.error('Failed to load assigned exams', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const columns = [
    {
      header: 'Exam Paper',
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
      header: 'Scoring',
      render: (e) => (
        <span>
          Total: <strong className="text-slate-900 dark:text-white">{e.totalMarks}</strong> | Pass: <strong className="text-emerald-600">{e.passingMarks}</strong>
        </span>
      ),
    },
    {
      header: 'Questions',
      render: (e) => (
        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
          {e.questionsSnapshot?.length || e.questionIds?.length || 0} questions
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
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Assigned Examinations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Exams and assessment cohorts assigned to you for supervision and candidate evaluation.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={exams}
        loading={loading}
        searchPlaceholder="Search assigned exams..."
        emptyTitle="No examinations assigned to your account"
      />
    </div>
  );
};
