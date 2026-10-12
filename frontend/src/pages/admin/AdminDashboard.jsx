import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { 
  Users, 
  GraduationCap, 
  Award, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  FileQuestion,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <LoadingSkeleton count={3} height="h-28" />
        <LoadingSkeleton count={2} height="h-64" />
      </div>
    );
  }

  const deptData = stats?.departmentStats
    ? Object.entries(stats.departmentStats).map(([name, count]) => ({ name, count }))
    : [];

  const pieColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Institutional Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time assessment overview, user activity, and examination metrics.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          color="indigo"
          trend="Active learners enrolled"
        />
        <StatCard
          title="Active Exams"
          value={stats?.activeExams || 0}
          icon={GraduationCap}
          color="emerald"
          trend={`${stats?.totalExams || 0} total exams configured`}
        />
        <StatCard
          title="Submissions"
          value={stats?.totalSubmissions || 0}
          icon={CheckCircle}
          color="blue"
          trend="Evaluated & active attempts"
        />
        <StatCard
          title="Overall Pass Rate"
          value={`${stats?.passPercentage || 0}%`}
          icon={Award}
          color={stats?.passPercentage >= 50 ? 'emerald' : 'amber'}
          trend={`Avg score: ${stats?.averageScore || 0}%`}
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Exams Distribution */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Examinations by Academic Department
          </h3>
          <div className="h-64 w-full">
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No department data available
              </div>
            )}
          </div>
        </div>

        {/* Overview Stats Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Assessment Health
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Faculty / Examiners</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats?.totalExaminers || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Question Repository</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats?.totalQuestions || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Average Performance</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{stats?.averageScore || 0}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp className="w-4 h-4" /> System load stable. All services responsive.
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions & Recent Exams Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Exams */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Recent Examinations
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Code</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {stats?.recentExams?.length > 0 ? (
                  stats.recentExams.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 font-medium text-slate-900 dark:text-white truncate max-w-[160px]">
                        {e.title}
                      </td>
                      <td className="py-2.5 text-slate-500 font-mono text-[11px]">{e.code}</td>
                      <td className="py-2.5">
                        <Badge variant={e.status === 'PUBLISHED' ? 'success' : e.status === 'DRAFT' ? 'default' : 'danger'}>
                          {e.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-slate-400">
                      No exams configured yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Recent Submissions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-2">Student</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {stats?.recentSubmissions?.length > 0 ? (
                  stats.recentSubmissions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 font-medium text-slate-900 dark:text-white truncate max-w-[150px]">
                        {s.studentName}
                      </td>
                      <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300">
                        {s.totalScore} / {s.maxScore} ({Math.round(s.percentage)}%)
                      </td>
                      <td className="py-2.5">
                        <Badge variant={s.passed ? 'success' : 'danger'}>
                          {s.passed ? 'PASSED' : 'FAILED'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-slate-400">
                      No student submissions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
