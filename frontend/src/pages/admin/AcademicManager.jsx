import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Plus, Edit, Trash2, BookOpen, Layers } from 'lucide-react';

export const AcademicManager = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editItem, setEditItem] = useState(null);

  // Form states
  const [deptForm, setDeptForm] = useState({ code: '', name: '', description: '' });
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    departmentId: '',
    credits: 3,
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, subRes] = await Promise.all([
        api.get('/admin/departments'),
        api.get('/admin/subjects'),
      ]);
      setDepartments(deptRes.data || []);
      setSubjects(subRes.data || []);
    } catch (err) {
      console.error('Failed to load academic data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveDept = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/admin/departments/${editItem.id}`, deptForm);
      } else {
        await api.post('/admin/departments', deptForm);
      }
      setDeptModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/admin/subjects/${editItem.id}`, subjectForm);
      } else {
        await api.post('/admin/subjects', subjectForm);
      }
      setSubjectModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      if (activeTab === 'departments') {
        await api.delete(`/admin/departments/${itemToDelete.id}`);
      } else {
        await api.delete(`/admin/subjects/${itemToDelete.id}`);
      }
      setDeleteConfirmOpen(false);
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const deptColumns = [
    {
      header: 'Code',
      accessor: 'code',
      render: (d) => <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{d.code}</span>,
    },
    { header: 'Department Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Actions',
      render: (d) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setEditItem(d);
              setDeptForm({ code: d.code, name: d.name, description: d.description || '' });
              setDeptModalOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setItemToDelete(d);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const subjectColumns = [
    {
      header: 'Code',
      accessor: 'code',
      render: (s) => <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{s.code}</span>,
    },
    { header: 'Subject Title', accessor: 'name' },
    { header: 'Department', accessor: 'departmentName' },
    { header: 'Credits', accessor: 'credits' },
    {
      header: 'Actions',
      render: (s) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setEditItem(s);
              setSubjectForm({
                code: s.code,
                name: s.name,
                departmentId: s.departmentId,
                credits: s.credits,
                description: s.description || '',
              });
              setSubjectModalOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setItemToDelete(s);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Trash2 className="w-4 h-4" />
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
            Academics & Courses
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure institutional departments, subjects, and curricula.
          </p>
        </div>

        <button
          onClick={() => {
            setEditItem(null);
            if (activeTab === 'departments') {
              setDeptForm({ code: '', name: '', description: '' });
              setDeptModalOpen(true);
            } else {
              setSubjectForm({
                code: '',
                name: '',
                departmentId: departments[0]?.id || '',
                credits: 3,
                description: '',
              });
              setSubjectModalOpen(true);
            }
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Add {activeTab === 'departments' ? 'Department' : 'Subject'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'departments'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Departments ({departments.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'subjects'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Subjects & Courses ({subjects.length})
        </button>
      </div>

      {/* Tables */}
      {activeTab === 'departments' ? (
        <DataTable
          columns={deptColumns}
          data={departments}
          loading={loading}
          searchPlaceholder="Search departments..."
          emptyTitle="No departments found"
        />
      ) : (
        <DataTable
          columns={subjectColumns}
          data={subjects}
          loading={loading}
          searchPlaceholder="Search subjects..."
          emptyTitle="No subjects found"
        />
      )}

      {/* Department Modal */}
      <Modal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title={editItem ? 'Edit Department' : 'Create Department'}
      >
        <form onSubmit={handleSaveDept} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Code * (e.g. CSE, IT, MECH)</label>
            <input
              type="text"
              required
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea
              rows={3}
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setDeptModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl">
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Subject Modal */}
      <Modal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        title={editItem ? 'Edit Subject' : 'Create Subject'}
      >
        <form onSubmit={handleSaveSubject} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Subject Code * (e.g. CS201)</label>
              <input
                type="text"
                required
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Credits</label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={subjectForm.credits}
                onChange={(e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Subject Title *</label>
            <input
              type="text"
              required
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Department *</label>
            <select
              required
              value={subjectForm.departmentId}
              onChange={(e) => setSubjectForm({ ...subjectForm, departmentId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea
              rows={3}
              value={subjectForm.description}
              onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setSubjectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl">
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"?`}
        danger={true}
      />
    </div>
  );
};
