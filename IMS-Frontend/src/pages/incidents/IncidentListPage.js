import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidentAPI } from '../../api';
import {
  StatusBadge, PriorityBadge, PageLoader, EmptyState,
  Pagination, useToast, ToastStack, PageHeader,
} from '../../components/common';
import { fmtAgo, PRIORITIES, ALL_STATUSES } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function IncidentListPage({ myOnly = false }) {
  const navigate  = useNavigate();
  const { isReporter, isManager } = useAuth();
  const toast = useToast();

  const [rows,       setRows]    = useState([]);
  const [loading,    setLoad]    = useState(true);
  const [page,       setPage]    = useState(0);
  const [totalPages, setTP]      = useState(0);
  const [total,      setTotal]   = useState(0);
  const [filters,    setFilters] = useState({ status:'', priority:'', search:'' });

  const fetchData = useCallback(async (p = 0) => {
    setLoad(true);
    try {
      const params = { page: p, size: 20 };
      if (filters.status)   params.status   = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search)   params.search   = filters.search;
      const isMyView = myOnly || isReporter;
      const res = await (isMyView ? incidentAPI.myList(params) : incidentAPI.list(params));
      const d   = res.data.data;
      setRows(d.content || []);
      setTP(d.totalPages  || 0);
      setTotal(d.totalElements || 0);
      setPage(p);
    } catch { toast.error('Failed to load incidents'); }
    finally   { setLoad(false); }
  }, [filters, myOnly, isReporter]);

  useEffect(() => { fetchData(0); }, [fetchData]);

  const sf = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const hasFilters = filters.status || filters.priority || filters.search;

  const title    = myOnly ? 'My Incidents' : isReporter ? 'My Incidents' : 'Incident Queue';
  const subtitle = `${total} incident${total !== 1 ? 's' : ''}`;

  return (
    <div className="anim-in">
      <ToastStack toasts={toast.toasts} />

      <PageHeader
        title={`📋 ${title}`}
        sub={subtitle}
        actions={<>
          <button className="btn btn-secondary btn-sm" onClick={() => fetchData(page)}>↻ Refresh</button>
          {/* Only REPORTER gets the Raise Incident button */}
          {isReporter && (
            <button className="btn btn-primary" onClick={() => navigate('/app/incidents/new')}>
              ➕ Raise Incident
            </button>
          )}
        </>}
      />

      <div className="card">
        {/* Filter bar */}
        <div className="filter-bar">
          <div className="search-wrap" style={{ flex:1, minWidth:180 }}>
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search by title…"
              value={filters.search}
              onChange={e => sf('search', e.target.value)} />
          </div>

          <select className="filter-select" value={filters.status} onChange={e => sf('status', e.target.value)}>
            <option value="">All Statuses</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>

          <select className="filter-select" value={filters.priority} onChange={e => sf('priority', e.target.value)}>
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          {hasFilters && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => setFilters({ status:'', priority:'', search:'' })}>
              ✕ Clear
            </button>
          )}

          <span style={{ marginLeft:'auto', fontSize:12, color:'var(--text-m)' }}>
            {total} result{total !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        {loading ? <PageLoader /> : rows.length === 0 ? (
          <EmptyState icon="📭" title="No incidents found"
            sub={hasFilters ? 'Try different filters or clear them.' : 'No incidents yet.'}
            action={isReporter ? (
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/app/incidents/new')}>
                Raise First Incident
              </button>
            ) : undefined}
          />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Reporter</th>
                    <th>Assigned To</th>
                    <th>SLA</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(i => (
                    <tr key={i.incidentId} style={{ cursor:'pointer' }}
                      onClick={() => navigate(`/app/incidents/${i.incidentId}`)}>
                      <td><span className="td-link">#{i.incidentId}</span></td>
                      <td style={{ maxWidth:280 }}>
                        <div style={{ fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:13 }}>
                          {i.title}
                        </div>
                      </td>
                      <td><PriorityBadge priority={i.priority} /></td>
                      <td><StatusBadge   status={i.status} /></td>
                      <td style={{ fontSize:12, color:'var(--text-m)' }}>{i.categoryName || '—'}</td>
                      <td style={{ fontSize:12 }}>{i.createdByName || '—'}</td>
                      <td style={{ fontSize:12 }}>
                        {i.ownerName || <span style={{ color:'var(--red-600)', fontWeight:500 }}>Unassigned</span>}
                      </td>
                      <td>
                        {i.slaBreach
                          ? <span className="badge sla-breach">⚠️ Breached</span>
                          : <span className="badge sla-ok">✓ OK</span>
                        }
                      </td>
                      <td style={{ fontSize:11, color:'var(--text-m)', whiteSpace:'nowrap' }}>
                        {fmtAgo(i.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={total} totalPages={totalPages} onPage={fetchData} />
          </>
        )}
      </div>
    </div>
  );
}
