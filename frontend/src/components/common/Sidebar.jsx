import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileQuestion, 
  ClipboardCheck, 
  BarChart3, 
  Bell, 
  ShieldAlert, 
  PenTool, 
  Award,
  ChevronLeft
} from 'lucide-react';

export const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { isAdmin, isExaminer, isStudent } = useAuth();

  const adminLinks = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', to: '/admin/users', icon: Users },
    { name: 'Academics & Courses', to: '/admin/academics', icon: BookOpen },
    { name: 'Exams & Scheduling', to: '/admin/exams', icon: GraduationCap },
    { name: 'Question Bank', to: '/admin/questions', icon: FileQuestion },
    { name: 'Submissions & Grading', to: '/admin/submissions', icon: ClipboardCheck },
    { name: 'Reports & Analytics', to: '/admin/reports', icon: BarChart3 },
    { name: 'Announcements', to: '/admin/announcements', icon: Bell },
    { name: 'Audit Logs', to: '/admin/audit-logs', icon: ShieldAlert },
  ];

  const examinerLinks = [
    { name: 'Dashboard', to: '/examiner/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Exams', to: '/examiner/exams', icon: GraduationCap },
    { name: 'Question Bank', to: '/examiner/questions', icon: FileQuestion },
    { name: 'Evaluate Submissions', to: '/examiner/submissions', icon: ClipboardCheck },
  ];

  const studentLinks = [
    { name: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Available Exams', to: '/student/exams', icon: PenTool },
    { name: 'My Results & Scorecards', to: '/student/submissions', icon: Award },
  ];

  let currentLinks = [];
  if (isAdmin) currentLinks = adminLinks;
  else if (isExaminer) currentLinks = examinerLinks;
  else if (isStudent) currentLinks = studentLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar sidebar element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              Navigation
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {currentLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer badge */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-200">System Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">All services operational</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
