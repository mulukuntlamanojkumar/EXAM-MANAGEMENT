import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { StatCard } from '../../components/common/StatCard';
import { Download, BarChart2, PieChart as PieIcon, Award, FileSpreadsheet } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export const ReportsAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [statsRes, subRes] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/submissions?size=500'),
        ]);
        setStats(statsRes.data);
        setSubmissions(subRes.data.content || []);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const handleExportCSV = () => {
    if (submissions.length === 0) {
      alert('No data to export');
      return;
    }
    const headers = ['ID', 'Student Name', 'Student Email', 'Exam Title', 'Exam Code', 'Score', 'Max Score', 'Percentage', 'Passed', 'Proctor Warnings', 'Status'];
    const rows = submissions.map((s) => [
      s.id,
      `"${s.studentName}"`,
      s.studentEmail,
      `"${s.examTitle}"`,
      s.examCode,
      s.totalScore,
      s.maxScore,
      s.percentage,
      s.passed ? 'PASS' : 'FAIL',
      s.proctorWarningsCount,
      s.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Exam_Performance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (submissions.length === 0) {
      alert('No data to export');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(submissions, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Exam_Submissions_Export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare score brackets distribution
  const brackets = [
    { range: '0-39% (Fail)', count: 0 },
    { range: '40-59% (Pass)', count: 0 },
    { range: '60-79% (Credit)', count: 0 },
    { range: '80-100% (Distinction)', count: 0 },
  ];

  submissions.forEach((s) => {
    const p = s.percentage;
    if (p < 40) brackets[0].count++;
    else if (p < 60) brackets[1].count++;
    else if (p < 80) brackets[2].count++;
    else brackets[3].count++;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Institutional Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export evaluation metrics, pass ratios, and score distribution data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition-colors"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Overall Pass Rate"
          value={`${stats?.passPercentage || 0}%`}
          icon={Award}
          color="emerald"
          trend="Total candidate pass threshold"
        />
        <StatCard
          title="Mean Examination Score"
          value={`${stats?.averageScore || 0}%`}
          icon={BarChart2}
          color="indigo"
          trend="Aggregated candidate percentage"
        />
        <StatCard
          title="Total Evaluated Sessions"
          value={stats?.totalSubmissions || 0}
          icon={PieIcon}
          color="blue"
          trend="Graded examination papers"
        />
      </div>

      {/* Distribution Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Grade Bracket Distribution
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={brackets} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} tickLine={false} />
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
              <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
