import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidentAPI } from '../../api';
import { PageLoader, StatusBadge, PriorityBadge, useToast, ToastStack, PageHeader, KpiCard } from '../../components/common';
import { fmtAgo, fmtDt } from '../../utils/helpers';

export default function EscalationsPage() {
  const navigate  = useNavigate();
  const toast     = useToast();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoad] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [es, hs] = await Promise.all([
          incidentAPI.list({ status:'ESCALATED', page:0, size:50 }),
          incidentAPI.list({ status:'HIGH', page:0, size:50 }),
        ]);
        const escalated = es.data.data?.content || [];
        const high      = hs.data.data?.content || [];
        // combine, dedupe
        const map = new Map();
        [...escalated, ...high].forEach(i => map.set(i.incidentId, i));
        setIncidents([...map.values()]);
      } catch { toast.error('Failed to load escalations'); }
      finally { setLoad(false); }
    })();
  }, []);

  const escalated = incidents.filter(i => i.status === 'ESCALATED');
  const critical  = incidents.filter(i => i.priority === 'CRITICAL');
  const breached  = incidents.filter(i => i.slaBreach);

  if (loading) return <PageLoader text="Loading escalations…" />;

  const Section = ({ title, items, color }) => (
    <div className="card" style={{ marginBottom:20 }}>
      <div className="card-header" style={{ borderLeft:`4px solid ${color}`, paddingLeft:16 }}>
        <div>
          <div className="card-title">{title}</div>
          <div className="card-subtitle">{items.length} incident{items.length!==1?'s':''}</div>
        </div>
        <span style={{ fontSize:22, fontWeight:800, color }}>{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div style={{ padding:32, textAlign:'center', color:'var(--text-m)', fontSize:13 }}>
          No incidents in this category 🎉
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Title</th><th>Priority</th><th>Status</th><th>Owner</th><th>SLA</th><th>Updated</th><th></th></tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.incidentId}>
                  <td><span className="td-link" onClick={() => navigate(`/app/incidents/${i.incidentId}`)}>#{i.incidentId}</span></td>
                  <td style={{ maxWidth:240, fontWeight:600, fontSize:13 }}>
                    <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{i.title}</div>
                  </td>
                  <td><PriorityBadge priority={i.priority} /></td>
                  <td><StatusBadge   status={i.status} /></td>
                  <td style={{ fontSize:12 }}>{i.ownerName || <span style={{ color:'var(--red-600)', fontWeight:500 }}>Unassigned</span>}</td>
                  <td>
                    {i.slaBreach
                      ? <span className="badge sla-breach">⚠️ Breached</span>
                      : <span className="badge sla-ok">✓ OK</span>}
                  </td>
                  <td style={{ fontSize:11, color:'var(--text-m)' }}>{fmtAgo(i.updatedAt)}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/app/incidents/${i.incidentId}`)}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="anim-in">
      <ToastStack toasts={toast.toasts} />

      <PageHeader
        title="🔺 Escalation Control"
        sub="Manage escalated incidents, SLA breaches and critical priority items"
        actions={<button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>↻ Refresh</button>}
      />

      <div className="kpi-grid" style={{ gridTemplateColumns:'repeat(3,1fr)', marginBottom:24 }}>
        <KpiCard label="Escalated"    value={escalated.length} icon="🔺" color="#9d174d" sub="Status = ESCALATED" />
        <KpiCard label="Critical Priority" value={critical.length}  icon="🔴" color="#dc2626" sub="Priority = CRITICAL" />
        <KpiCard label="SLA Breached"  value={breached.length}  icon="⚠️" color="#d97706" sub="SLA breach flag set" />
      </div>

      <Section title="🔺 Escalated Incidents" items={escalated} color="#9d174d" />
      <Section title="🔴 Critical Priority Incidents" items={critical} color="#dc2626" />
      <Section title="⚠️ SLA Breached" items={breached} color="#d97706" />
    </div>
  );
}
