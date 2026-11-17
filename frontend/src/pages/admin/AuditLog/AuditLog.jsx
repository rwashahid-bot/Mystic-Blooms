import { useMemo, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import AdminPageHeader from '../../../components/admin/AdminPageHeader/AdminPageHeader';
import EmptyState from '../../../components/EmptyState/EmptyState';
import Loader from '../../../components/Loader/Loader';
import { useAsync } from '../../../hooks/useAsync';
import { adminService } from '../../../services/adminService';
import { exportCsv } from '../../../utils/exportCsv';
import { formatDateTime } from '../../../utils/format';
import './AuditLog.css';

const AuditLog = () => {
  const { data: log, loading } = useAsync(() => adminService.auditLog(), []);
  const [entity, setEntity] = useState('');
  const [q, setQ] = useState('');

  const entities = useMemo(() => [...new Set((log || []).map((l) => l.entity))].sort(), [log]);
  const list = useMemo(
    () => (log || []).filter((l) => (!entity || l.entity === entity) && (!q || `${l.actor} ${l.action} ${l.details}`.toLowerCase().includes(q.toLowerCase()))),
    [log, entity, q]
  );

  if (loading) return <Loader />;

  return (
    <div className="audit-log">
      <AdminPageHeader title="Audit Log" subtitle="A record of important changes: who did what, and when.">
        <button className="btn btn-light btn-sm" disabled={!list.length} onClick={() => exportCsv(list.map((l) => ({ Time: formatDateTime(l.at), User: l.actor, Action: l.action, Entity: l.entity, ID: l.entityId, Details: l.details })), 'audit-log.csv')}>
          <FiDownload /> Export
        </button>
      </AdminPageHeader>

      <div className="audit-log__filters">
        <input className="input" placeholder="Search user, action or details" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search log" />
        <select className="select" value={entity} onChange={(e) => setEntity(e.target.value)} aria-label="Entity">
          <option value="">All areas</option>
          {entities.map((e) => <option key={e}>{e}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <EmptyState icon="📜" title="No activity yet" message="Changes made in the admin panel will be recorded here." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Area</th><th>Details</th></tr></thead>
            <tbody>
              {list.map((l) => (
                <tr key={l._id}>
                  <td className="audit-log__time">{formatDateTime(l.at)}</td>
                  <td>{l.actor}</td>
                  <td><span className="chip">{l.action}</span></td>
                  <td>{l.entity}</td>
                  <td className="text-muted">{l.details || l.entityId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
