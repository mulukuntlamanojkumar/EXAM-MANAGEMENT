import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { 
  PenTool, 
  Award, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  BookOpen, 
  FileText,
  AlertCircle
} from 'lucide-react';
import dayjs from 'dayjs';

export const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [availableExams, setAvailableExams] = useState([]);
  const [pastSubmissions, setPastSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, examsRes, subsRes] = await Promise.all([
          api.get('/student/analytics'),
          api.get('/student/exams?size=20'),
          api.get('/student/submissions?size=20'),
        ]);
        setStats(statsRes.data);
        setAvailableExams(examsRes.data.content || []);
        setPastSubmissions(subsRes.data.content || []);
      } catch (err) {
        console.error('Failed to load student dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold">Student Dashboard</h1>
        <LoadingSkeleton count={3} height="h-28" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Student Assessment Dashboard
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enrolled examinations, live test schedules, and personal academic scorecards.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Available Tests"
          value={availableExams.length}
          icon={PenTool}
          color="indigo"
          trend="Scheduled papers open for attempts"
        />
        <StatCard
          title="Completed Exams"
          value={pastSubmissions.length}
          icon={CheckCircle}
          color="blue"
          trend="Past examination submissions"
        />
        <StatCard
          title="Personal Pass Rate"
          value={`${stats?.passPercentage || 0}%`}
          icon={Award}
          color="emerald"
          trend={`Average Score: ${stats?.averageScore || 0}%`}
        />
      </div>

      {/* Available Exams Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" /> Active & Scheduled Examinations
        </h2>

        {availableExams.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-400">
            No examinations are currently active or published for your cohort.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableExams.map((exam) => (
              <div
                key={exam.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="primary">{exam.subjectName}</Badge>
                    <span className="font-mono text-[11px] text-slate-400">{exam.code}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {exam.description || 'Institutional examination paper.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 mb-4">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {exam.durationMinutes} mins
                    </span>
                    <span>•</span>
                    <span className="font-semibold">
                      Total: {exam.totalMarks} marks
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-600">
                      Pass: {exam.passingMarks} marks
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/student/exam/${exam.id}`)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all"
                >
                  Start Examination <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Submissions & Results */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" /> Completed Examinations & Scorecards
        </h2>

        {pastSubmissions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-400">
            You haven't completed any examinations yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 font-semibold">
                  <th className="px-4 py-3">Exam Paper</th>
                  <th className="px-4 py-3">Completed On</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {pastSubmissions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {s.examTitle}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {s.submitTime ? dayjs(s.submitTime).format('MMM D, YYYY h:mm A') : 'In progress'}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                      {s.totalScore} / {s.maxScore} ({Math.round(s.percentage)}%)
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={s.passed ? 'success' : 'danger'}>
                        {s.passed ? 'PASSED' : 'FAILED'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/student/result/${s.id}`)}
                        className="font-bold text-indigo-600 hover:text-indigo-700"
                      >
                        View Scorecard →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
