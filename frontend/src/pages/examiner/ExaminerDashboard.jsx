import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { GraduationCap, ClipboardCheck, Award, FileQuestion, ArrowRight } from 'lucide-react';

export const ExaminerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/examiner/analytics');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load examiner stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold">Examiner Dashboard</h1>
        <LoadingSkeleton count={3} height="h-28" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Examiner Assessment Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your assigned papers, question pools, and candidate evaluations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Exams"
          value={stats?.totalExams || 0}
          icon={GraduationCap}
          color="amber"
          trend={`${stats?.activeExams || 0} currently active`}
        />
        <StatCard
          title="Submissions Received"
          value={stats?.totalSubmissions || 0}
          icon={ClipboardCheck}
          color="indigo"
          trend="Candidate papers for your courses"
        />
        <StatCard
          title="Cohort Pass Rate"
          value={`${stats?.passPercentage || 0}%`}
          icon={Award}
          color="emerald"
          trend="Successful candidate threshold"
        />
      </div>

      {/* Assigned Exams Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Your Assigned Examination Papers
          </h3>
          <Link
            to="/examiner/exams"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="pb-2.5">Title</th>
                <th className="pb-2.5">Code</th>
                <th className="pb-2.5">Subject</th>
                <th className="pb-2.5">Duration</th>
                <th className="pb-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {stats?.recentExams?.length > 0 ? (
                stats.recentExams.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">{e.title}</td>
                    <td className="py-3 font-mono text-slate-500 text-[11px]">{e.code}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{e.subjectName}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{e.durationMinutes} mins</td>
                    <td className="py-3">
                      <Badge variant={e.status === 'PUBLISHED' ? 'success' : 'default'}>
                        {e.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400">
                    No examination papers currently assigned to your account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
