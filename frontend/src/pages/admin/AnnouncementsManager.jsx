import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Plus, Trash2, Bell, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';

export const AnnouncementsManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRole: 'ALL',
    priority: 'MEDIUM',
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/announcements?size=100');
      setAnnouncements(res.data.content || []);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/announcements', formData);
      setCreateModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to publish announcement');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/announcements/${selectedAnn.id}`);
      setDeleteConfirmOpen(false);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to delete announcement');
    }
  };

  const columns = [
    {
      header: 'Announcement',
      accessor: 'title',
      render: (a) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white leading-tight">{a.title}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{a.content}</p>
        </div>
      ),
    },
    {
      header: 'Target Audience',
      accessor: 'targetRole',
      render: (a) => (
        <Badge variant={a.targetRole === 'ALL' ? 'default' : 'primary'}>
          {a.targetRole.replace('ROLE_', '')}
        </Badge>
      ),
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (a) => {
        let variant = 'default';
        if (a.priority === 'HIGH' || a.priority === 'URGENT') variant = 'danger';
        else if (a.priority === 'MEDIUM') variant = 'warning';
        return <Badge variant={variant}>{a.priority}</Badge>;
      },
    },
    { header: 'Author', accessor: 'authorName' },
    {
      header: 'Date',
      render: (a) => (
        <span className="text-[11px] text-slate-400">
          {dayjs(a.createdAt).format('MMM D, YYYY h:mm A')}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (a) => (
        <button
          onClick={() => {
            setSelectedAnn(a);
            setDeleteConfirmOpen(true);
          }}
          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Announcements & Notices
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish institutional alerts, schedule updates, and proctoring rules.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ title: '', content: '', targetRole: 'ALL', priority: 'MEDIUM' });
            setCreateModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Post Notice
        </button>
      </div>

      <DataTable
        columns={columns}
        data={announcements}
        loading={loading}
        searchPlaceholder="Search announcements..."
        emptyTitle="No announcements posted"
      />

      {/* Post Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Publish Announcement">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Midterm Examination Hall Tickets Released"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Target Audience</label>
              <select
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="ALL">All Users</option>
                <option value="ROLE_STUDENT">Students Only</option>
                <option value="ROLE_EXAMINER">Examiners Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Notice Body / Message *</label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700">
              Publish Notice
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Notice"
        message={`Delete "${selectedAnn?.title}"?`}
        danger={true}
      />
    </div>
  );
};
