import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { ShieldCheck, Activity } from 'lucide-react';
import dayjs from 'dayjs';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/audit-logs?size=100');
        setLogs(res.data.content || []);
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      render: (l) => (
        <span className="font-mono text-slate-500 text-[11px]">
          {dayjs(l.timestamp).format('YYYY-MM-DD HH:mm:ss')}
        </span>
      ),
    },
    {
      header: 'Actor',
      accessor: 'username',
      render: (l) => <span className="font-bold text-slate-900 dark:text-white font-mono">{l.username || 'SYSTEM'}</span>,
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (l) => <Badge variant="primary">{l.action}</Badge>,
    },
    { header: 'Details', accessor: 'details' },
    {
      header: 'IP Address',
      accessor: 'ipAddress',
      render: (l) => <span className="font-mono text-[11px] text-slate-400">{l.ipAddress || '127.0.0.1'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          System Audit Logs
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Security trail recording administrator and examiner activities.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchPlaceholder="Filter audit events..."
        emptyTitle="No audit records yet"
      />
    </div>
  );
};
