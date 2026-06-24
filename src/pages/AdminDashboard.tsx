import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: string; plotId: string; block: string; dimensions: string;
  area: number; customerName: string; customerPhone: string;
  customerEmail: string; customerGender?: string; customerAddress?: string;
  federation?: string; leader?: string; leaderPhone?: string; amount?: string;
  notes: string; paymentMethod: string; screenshot: string;
  transactionId: string; status: 'pending' | 'accepted' | 'rejected';
  bookedAt: string; approvedAt?: string; rejectedAt?: string;
}

interface Plot {
  id: string; block: string; dimensions: string;
  area: number; status: string; facing: string; number?: string; type?: string;
}

type View = 'overview' | 'requests' | 'booked' | 'history';

const API = import.meta.env.VITE_API_URL ?? '';
const token = () => sessionStorage.getItem('adminToken') || '';
const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });
const fmtDate = (d: string) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  overview:  'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  requests:  'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2',
  booked:    'M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7',
  history:   'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',

  logout:    'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  check:     'M20 6L9 17l-5-5',
  x:         'M18 6L6 18M6 6l12 12',
  trash:     'M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  eye:       'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  refresh:   'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  menu:      'M3 12h18M3 6h18M3 18h18',
  close:     'M6 18L18 6M6 6l12 12',
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const Badge = ({ s }: { s: string }) => {
  const map: Record<string, [string, string]> = {
    pending:   ['#fef3c7', '#92400e'],
    accepted:  ['#d1fae5', '#065f46'],
    rejected:  ['#fee2e2', '#991b1b'],
    booked:    ['#d1fae5', '#065f46'],
    available: ['#dbeafe', '#1e40af'],
    blocked:   ['#fef3c7', '#92400e'],
  };
  const [bg, color] = map[s] || ['#f1f5f9', '#475569'];
  return (
    <span style={{
      background: bg, color, padding: '0.2rem 0.65rem',
      borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700,
      textTransform: 'capitalize', letterSpacing: '0.02em'
    }}>{s}</span>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const Empty = ({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
  <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
    <div style={{ width: 56, height: 56, background: '#f1f5f9', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
      <Icon d={icon} size={22} />
    </div>
    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem', marginBottom: '0.35rem' }}>{title}</div>
    <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{desc}</div>
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) => (
  <div style={{
    background: '#fff', borderRadius: '1rem', padding: '1.25rem 1.5rem',
    border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    borderLeft: `4px solid ${accent}`
  }}>
    <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>{label}</div>
    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.4rem' }}>{sub}</div>}
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<Booking | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);


  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/bookings`, { headers: auth() });
      if (res.status === 401) { navigate('/admin-login'); return; }
      const data = await res.json();
      setBookings(data.bookings || []);
      setPlots(data.plots || []);
    } catch { showToast('Failed to load data.', 'error'); }
    finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => {
    if (!token()) { navigate('/admin-login'); return; }
    fetchData();
  }, [fetchData, navigate]);

  const handleApprove = async (id: string) => {
    setActionLoading(id + '_a');
    try {
      const r = await fetch(`${API}/api/admin/bookings/approve`, { method: 'POST', headers: auth(), body: JSON.stringify({ bookingId: id }) });
      const d = await r.json();
      if (d.success) { showToast('Booking approved!'); fetchData(); } else showToast(d.message, 'error');
    } catch { showToast('Action failed', 'error'); } finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reject this booking?')) return;
    setActionLoading(id + '_r');
    try {
      const r = await fetch(`${API}/api/admin/bookings/reject`, { method: 'POST', headers: auth(), body: JSON.stringify({ bookingId: id }) });
      const d = await r.json();
      if (d.success) { showToast('Booking rejected.'); fetchData(); } else showToast(d.message, 'error');
    } catch { showToast('Action failed', 'error'); } finally { setActionLoading(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    setActionLoading(id + '_d');
    try {
      const r = await fetch(`${API}/api/admin/bookings/delete`, { method: 'POST', headers: auth(), body: JSON.stringify({ bookingId: id }) });
      const d = await r.json();
      if (d.success) { showToast('Record deleted.'); fetchData(); } else showToast(d.message, 'error');
    } catch { showToast('Action failed', 'error'); } finally { setActionLoading(null); }
  };

  const handleLogout = () => { sessionStorage.removeItem('adminToken'); navigate('/admin-login'); };

  const pending      = bookings.filter(b => b.status === 'pending');
  const accepted     = bookings.filter(b => b.status === 'accepted');
  const bookedPlots  = plots.filter(p => p.status === 'booked');
  const availPlots   = plots.filter(p => p.status === 'available');

  const NAV: { view: View; label: string; icon: keyof typeof ICONS; badge?: number }[] = [
    { view: 'overview', label: 'Overview',         icon: 'overview' },
    { view: 'requests', label: 'Booking Requests', icon: 'requests', badge: pending.length },
    { view: 'booked',   label: 'Booked Plots',     icon: 'booked',  badge: bookedPlots.length },
    { view: 'history',  label: 'Payment History',  icon: 'history' },

  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Loading dashboard…</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#f8fafc', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 240 : 64, flexShrink: 0,
        background: 'linear-gradient(180deg, #0c1a12 0%, #0f2318 100%)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden', position: 'relative', zIndex: 40
      }}>
        {/* Brand */}
        <div style={{ padding: sidebarOpen ? '1.5rem 1.25rem 1rem' : '1.5rem 0 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{
            width: 36, height: 36, flexShrink: 0, borderRadius: '10px',
            background: 'linear-gradient(135deg, #0d9488, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(13,148,136,0.35)',
            margin: sidebarOpen ? '0' : '0 auto'
          }}>
            <Icon d={ICONS.overview} size={17} />
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>PlotAdmin</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Madurai</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          {NAV.map(n => {
            const active = view === n.view;
            return (
              <button key={n.view} onClick={() => setView(n.view)} title={!sidebarOpen ? n.label : undefined} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: sidebarOpen ? '0.65rem 0.85rem' : '0.65rem 0',
                borderRadius: '0.6rem', border: 'none', cursor: 'pointer',
                background: active ? 'rgba(13,148,136,0.2)' : 'transparent',
                color: active ? '#34d399' : 'rgba(255,255,255,0.45)',
                fontWeight: active ? 700 : 500, fontSize: '0.82rem',
                transition: 'all 0.15s', width: '100%', textAlign: 'left',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                boxShadow: active ? 'inset 0 0 0 1px rgba(13,148,136,0.25)' : 'none'
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; } }}
              >
                <span style={{ flexShrink: 0 }}><Icon d={ICONS[n.icon]} size={17} /></span>
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap', flex: 1 }}>{n.label}</span>}
                {sidebarOpen && n.badge != null && n.badge > 0 && (
                  <span style={{ background: '#ef4444', color: '#fff', borderRadius: '9999px', fontSize: '0.62rem', fontWeight: 700, padding: '0.1rem 0.45rem', marginLeft: 'auto' }}>{n.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleLogout} title={!sidebarOpen ? 'Logout' : undefined} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: sidebarOpen ? '0.65rem 0.85rem' : '0.65rem 0',
            width: '100%', border: 'none', cursor: 'pointer', borderRadius: '0.6rem',
            background: 'transparent', color: 'rgba(255,100,100,0.6)', fontSize: '0.82rem',
            fontWeight: 500, justifyContent: sidebarOpen ? 'flex-start' : 'center',
            transition: 'all 0.15s'
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,100,100,0.6)'; }}
          >
            <Icon d={ICONS.logout} size={17} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: 60, background: '#fff', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)', flexShrink: 0
        }}>
          <button onClick={() => setSidebarOpen(s => !s)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
            display: 'flex', alignItems: 'center', padding: '0.3rem', borderRadius: '0.4rem'
          }}>
            <Icon d={sidebarOpen ? ICONS.close : ICONS.menu} size={20} />
          </button>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
              {NAV.find(n => n.view === view)?.label ?? 'Dashboard'}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>Madurai Plot Booking · Admin</div>
          </div>

          <button onClick={fetchData} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: '#f8fafc', border: '1px solid #e2e8f0',
            color: '#475569', padding: '0.45rem 0.9rem', borderRadius: '0.5rem',
            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s'
          }}>
            <Icon d={ICONS.refresh} size={14} /> Refresh
          </button>
        </header>

        {/* Scrollable content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '1.75rem' }}>

          {/* ── Overview ── */}
          {view === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard label="Total Plots"       value={String(plots.length)}     sub={`${availPlots.length} available`}         accent="#2563eb" />
                <StatCard label="Booked Plots"      value={String(bookedPlots.length)} sub={`${((bookedPlots.length/Math.max(plots.length,1))*100).toFixed(0)}% occupancy`} accent="#059669" />
                <StatCard label="Pending Requests"  value={String(pending.length)}   sub="Awaiting approval"                        accent="#f59e0b" />
              </div>

              {/* Recent pending */}
              <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Recent Booking Requests</div>
                  {pending.length > 0 && (
                    <button onClick={() => setView('requests')} style={{ background: 'none', border: 'none', color: '#0d9488', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>View all →</button>
                  )}
                </div>
                {pending.length === 0 ? (
                  <Empty icon={ICONS.requests} title="No pending requests" desc="All booking requests have been processed." />
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {['Plot', 'Customer', 'Date', 'Status', ''].map(h => (
                          <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pending.slice(0, 5).map(b => (
                        <tr key={b.id} style={{ borderTop: '1px solid #f8fafc' }}>
                          <td style={{ padding: '0.85rem 1rem' }}><span style={{ fontWeight: 700, color: '#0f172a' }}>Plot {b.plotId}</span></td>
                          <td style={{ padding: '0.85rem 1rem' }}><div style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>{b.customerName}</div><div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{b.customerPhone}</div></td>
                          <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.78rem' }}>{fmtDate(b.bookedAt)}</td>
                          <td style={{ padding: '0.85rem 1rem' }}><Badge s={b.status} /></td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <Btn color="#059669" onClick={() => handleApprove(b.id)} disabled={!!actionLoading} loading={actionLoading === b.id + '_a'} label="Approve" size="sm" />
                              <Btn color="#ef4444" onClick={() => handleReject(b.id)} disabled={!!actionLoading} loading={actionLoading === b.id + '_r'} label="Reject" size="sm" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── Booking Requests ── */}
          {view === 'requests' && (
            <div>
              {pending.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                  <Empty icon={ICONS.requests} title="No pending requests" desc="All booking requests have been processed." />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: '1rem' }}>
                  {pending.map(b => <RequestCard key={b.id} b={b} onApprove={handleApprove} onReject={handleReject} actionLoading={actionLoading} onDetail={setDetailModal} onLightbox={setLightbox} />)}
                </div>
              )}
            </div>
          )}

          {/* ── Booked Plots ── */}
          {view === 'booked' && (
            <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
              {bookedPlots.length === 0 ? (
                <Empty icon={ICONS.booked} title="No booked plots yet" desc="Approved bookings will appear here." />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {['Plot', 'Buyer', 'Phone', 'Amount', 'Approved', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.67rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookedPlots.map((p, i) => {
                        const bk = accepted.find(b => b.plotId === p.id);
                        return (
                          <tr key={p.id} style={{ borderTop: '1px solid #f8fafc', background: i % 2 ? '#fafafa' : '#fff' }}>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>#{p.id}</td>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#334155', fontSize: '0.82rem' }}>{bk?.customerName ?? '—'}</td>
                            <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.78rem' }}>{bk?.customerPhone ?? '—'}</td>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#059669', fontSize: '0.82rem' }}>{bk?.amount ? `₹${bk.amount}` : '—'}</td>
                            <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{bk?.approvedAt ? fmtDate(bk.approvedAt) : '—'}</td>
                            <td style={{ padding: '0.85rem 1rem' }}><Badge s="booked" /></td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                {bk && (
                                  <button
                                    onClick={() => setDetailModal(bk)}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                                      background: '#eff6ff', border: '1px solid #bfdbfe',
                                      color: '#1d4ed8', padding: '0.3rem 0.65rem',
                                      borderRadius: '0.4rem', cursor: 'pointer',
                                      fontSize: '0.72rem', fontWeight: 600
                                    }}
                                  >
                                    <Icon d={ICONS.eye} size={12} /> View
                                  </button>
                                )}
                                {bk && (
                                  <button
                                    onClick={async () => {
                                      if (!confirm(`Delete booking for Plot #${p.id} (${bk.customerName})?\n\nThis will free the plot for others to book.`)) return;
                                      setActionLoading(bk.id + '_d');
                                      try {
                                        const r = await fetch(`${API}/api/admin/bookings/delete`, { method: 'POST', headers: auth(), body: JSON.stringify({ bookingId: bk.id }) });
                                        const d = await r.json();
                                        if (d.success) { showToast('Booking deleted. Plot is now available.'); fetchData(); }
                                        else showToast(d.message, 'error');
                                      } catch { showToast('Action failed', 'error'); }
                                      finally { setActionLoading(null); }
                                    }}
                                    disabled={!!actionLoading}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                                      background: '#fff0f0', border: '1px solid #fecaca',
                                      color: '#dc2626', padding: '0.3rem 0.65rem',
                                      borderRadius: '0.4rem', cursor: 'pointer',
                                      fontSize: '0.72rem', fontWeight: 600,
                                      opacity: actionLoading === bk.id + '_d' ? 0.6 : 1
                                    }}
                                  >
                                    <Icon d={ICONS.trash} size={12} /> Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Payment History ── */}
          {view === 'history' && (
            <div>
              {bookings.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                  <Empty icon={ICONS.history} title="No payment records" desc="Transaction history will appear here." />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[...bookings].reverse().map(b => (
                    <div key={b.id} style={{
                      background: '#fff', border: '1px solid #f1f5f9', borderRadius: '0.875rem',
                      padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}>
                      {b.screenshot ? (
                        <img src={b.screenshot} alt="pay" onClick={() => setLightbox(b.screenshot)}
                          style={{ width: 56, height: 48, objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #e2e8f0', cursor: 'zoom-in', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 56, height: 48, background: '#f1f5f9', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#94a3b8' }}>
                          <Icon d={ICONS.history} size={18} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>Plot {b.plotId}</span>
                          <Badge s={b.status} />
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {b.customerName} · {b.customerPhone} · {b.paymentMethod}
                          {b.amount && <> · <strong style={{ color: '#059669' }}>₹{b.amount}</strong></>}
                          {b.transactionId && <> · Txn: <strong style={{ color: '#334155' }}>{b.transactionId}</strong></>}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>{fmtDate(b.bookedAt)}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => setDetailModal(b)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '0.25rem 0.6rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>Details</button>
                          <button onClick={() => handleDelete(b.id)} disabled={!!actionLoading} style={{ background: 'none', border: '1px solid #fecaca', color: '#ef4444', padding: '0.25rem 0.6rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === 'success' ? '#059669' : '#ef4444',
          color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
          fontWeight: 600, fontSize: '0.83rem', boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          animation: 'slideIn 0.25s ease-out'
        }}>
          <Icon d={toast.type === 'success' ? ICONS.check : ICONS.x} size={15} />
          {toast.msg}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000, cursor: 'zoom-out' }}>
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <img src={lightbox} alt="payment" style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: '0.75rem', border: '3px solid #fff', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }} />
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: '#fff', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Icon d={ICONS.close} size={16} /> Close
            </button>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {detailModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetailModal(null)}>
          <div className="modal-content" style={{ maxWidth: 500, padding: 0 }}>
            <div style={{ background: 'linear-gradient(135deg, #0d9488, #059669)', padding: '1.25rem 1.5rem', borderRadius: '1.25rem 1.25rem 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Booking Details</div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem', marginTop: '0.1rem' }}>Plot {detailModal.plotId}</div>
              </div>
              <button onClick={() => setDetailModal(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon d={ICONS.close} size={15} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <DS title="Plot Info">
                <DR label="Plot" value={`Plot ${detailModal.plotId}`} />
              </DS>
              <DS title="Customer Info">
                <DR label="Name"    value={detailModal.customerName} />
                <DR label="Phone"   value={detailModal.customerPhone} />
                <DR label="Email"   value={detailModal.customerEmail} />
                {detailModal.customerGender  && <DR label="Gender"  value={detailModal.customerGender} />}
                {detailModal.customerAddress && <DR label="Address" value={detailModal.customerAddress} />}
                {detailModal.federation      && <DR label="Federation"   value={detailModal.federation} />}
                {detailModal.leader          && <DR label="Leader"        value={detailModal.leader} />}
                {detailModal.leaderPhone     && <DR label="Leader Phone"  value={detailModal.leaderPhone} />}
                {detailModal.amount          && <DR label="Amount"        value={`₹${detailModal.amount}`} hi />}
              </DS>
              <DS title="Payment">
                <DR label="Method"    value={detailModal.paymentMethod} />
                <DR label="Txn ID"    value={detailModal.transactionId} />
                <DR label="Status"    value={detailModal.status.toUpperCase()} />
                <DR label="Submitted" value={fmtDate(detailModal.bookedAt)} />
                {detailModal.approvedAt && <DR label="Approved" value={fmtDate(detailModal.approvedAt)} />}
                {detailModal.rejectedAt && <DR label="Rejected" value={fmtDate(detailModal.rejectedAt)} />}
              </DS>
              {detailModal.screenshot && (
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Screenshot</div>
                  <img src={detailModal.screenshot} alt="payment" onClick={() => setLightbox(detailModal.screenshot)} style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: '0.5rem', border: '1px solid #e2e8f0', cursor: 'zoom-in' }} />
                </div>
              )}
              {detailModal.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button onClick={() => { handleApprove(detailModal.id); setDetailModal(null); }} style={{ flex: 1, padding: '0.7rem', borderRadius: '0.65rem', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#047857)', color: '#fff', fontWeight: 700 }}>Approve</button>
                  <button onClick={() => { handleReject(detailModal.id); setDetailModal(null); }} style={{ flex: 1, padding: '0.7rem', borderRadius: '0.65rem', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontWeight: 700 }}>Reject</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────────────────────

const Btn = ({ color, onClick, disabled, loading, label, size = 'md' }: { color: string; onClick: () => void; disabled: boolean; loading: boolean; label: string; size?: 'sm' | 'md' }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: color, color: '#fff', border: 'none',
    padding: size === 'sm' ? '0.3rem 0.65rem' : '0.55rem 1rem',
    borderRadius: '0.45rem', cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: size === 'sm' ? '0.72rem' : '0.8rem', fontWeight: 700,
    opacity: disabled ? 0.6 : 1, transition: 'opacity 0.15s', whiteSpace: 'nowrap'
  }}>
    {loading ? '...' : label}
  </button>
);

const RequestCard = ({ b, onApprove, onReject, actionLoading, onDetail, onLightbox }: {
  b: Booking; onApprove: (id: string) => void; onReject: (id: string) => void;
  actionLoading: string | null; onDetail: (b: Booking) => void; onLightbox: (src: string) => void;
}) => (
  <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
          <span style={{ fontWeight: 800, color: '#0f172a' }}>Plot {b.plotId}</span>
          <Badge s={b.status} />
        </div>
      </div>
      <button onClick={() => onDetail(b)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.45rem', padding: '0.3rem 0.65rem', cursor: 'pointer', fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>Details</button>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1rem', background: '#f8fafc', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '0.85rem' }}>
      {[['Name', b.customerName], ['Phone', b.customerPhone], ['Email', b.customerEmail], ['Payment', b.paymentMethod], ['Txn ID', b.transactionId], ['Date', fmtDate(b.bookedAt)], ...(b.federation ? [['Federation', b.federation]] : []), ...(b.leader ? [['Leader', b.leader]] : []), ...(b.leaderPhone ? [['Leader Phone', b.leaderPhone]] : []), ...(b.amount ? [['Amount', `₹${b.amount}`]] : [])].map(([l, v]) => (
        <div key={l}>
          <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
          <div style={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 600, wordBreak: 'break-all' }}>{v}</div>
        </div>
      ))}
    </div>
    {b.screenshot && (
      <div style={{ marginBottom: '0.85rem' }}>
        <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Payment Screenshot</div>
        <img src={b.screenshot} alt="payment" onClick={() => onLightbox(b.screenshot)} style={{ height: 56, width: 'auto', maxWidth: '100%', borderRadius: '0.45rem', border: '1px solid #e2e8f0', cursor: 'zoom-in', objectFit: 'cover' }} />
      </div>
    )}
    <div style={{ display: 'flex', gap: '0.65rem' }}>
      <Btn color="#059669" onClick={() => onApprove(b.id)} disabled={!!actionLoading} loading={actionLoading === b.id + '_a'} label="✓ Approve" />
      <Btn color="#ef4444" onClick={() => onReject(b.id)} disabled={!!actionLoading} loading={actionLoading === b.id + '_r'} label="✕ Reject" />
    </div>
  </div>
);

const DS = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '1rem' }}>
    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>{title}</div>
    <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.65rem 0.85rem', border: '1px solid #f1f5f9' }}>{children}</div>
  </div>
);

const DR = ({ label, value, hi }: { label: string; value: string; hi?: boolean }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid #f1f5f9' }}>
    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
    <span style={{ fontSize: '0.8rem', color: hi ? '#059669' : '#0f172a', fontWeight: hi ? 800 : 500 }}>{value}</span>
  </div>
);
