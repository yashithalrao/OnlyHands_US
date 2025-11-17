import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getShiftApplications, approveApplication, rejectApplication } from '../../../api/shifts';

export default function ManagerApplications() {
  const { id: shiftId } = useParams();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <div className="page">Please log in.</div>;
  if (user.role !== 'manager') return <div className="page">Only managers can view applications.</div>;

  useEffect(() => { load(tab); /* eslint-disable-next-line */ }, [tab, shiftId]);

  const load = async (statusTab = '') => {
    setError(''); setLoading(true);
    try {
      const data = await getShiftApplications(shiftId, statusTab);
      setItems(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load applications');
    } finally { setLoading(false); }
  };

  const handleApprove = async (appId) => {
    setItems(prev => prev.map(it => (it._id === appId ? { ...it, _pendingAction: 'approving' } : it)));
    try { await approveApplication(appId); await load(tab); }
    catch (err) { setError(err?.response?.data?.message || err.message || 'Failed to approve'); await load(tab); }
  };

  const handleReject = async (appId) => {
    setItems(prev => prev.map(it => (it._id === appId ? { ...it, _pendingAction: 'rejecting' } : it)));
    try { await rejectApplication(appId); await load(tab); }
    catch (err) { setError(err?.response?.data?.message || err.message || 'Failed to reject'); await load(tab); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Applications</h1>
        <Link to="/shifts" className="btn btn-outline">Back to shifts</Link>
      </div>

      <div className="tabs">
        {['pending','waitlisted','approved','rejected'].map(t => (
          <button key={t} className={`tab ${tab===t?'is-active':''}`} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-danger mt-2">{error}</div>}

      {loading ? (
        <div className="mt-3">Loading…</div>
      ) : items.length === 0 ? (
        <div className="subtitle">No applications in this list.</div>
      ) : (
        <div className="grid">
          {items.map(app => (
            <div key={app._id} className="card">
              <div className="card-body card-row">
                <div>
                  <div style={{fontWeight:600}}>{app.userId?.name || app.userId?.email || 'Volunteer'}</div>
                  <div className="text-sm">Applied: {new Date(app.appliedAt).toLocaleString()}</div>
                  {app.note && <div className="mt-2">Note: {app.note}</div>}
                </div>

                <div className="text-right">
                  {tab === 'pending' && (
                    <>
                      <button
                        disabled={app._pendingAction === 'approving'}
                        onClick={() => handleApprove(app._id)}
                        className="btn btn-success"
                      >
                        {app._pendingAction === 'approving' ? 'Approving…' : 'Approve'}
                      </button>
                      <button
                        disabled={app._pendingAction === 'rejecting'}
                        onClick={() => handleReject(app._id)}
                        className="btn btn-danger"
                        style={{marginLeft:8}}
                      >
                        {app._pendingAction === 'rejecting' ? 'Rejecting…' : 'Reject'}
                      </button>
                    </>
                  )}

                  {tab === 'waitlisted' && (
                    <>
                      <button onClick={() => handleApprove(app._id)} className="btn btn-success">Promote</button>
                      <button onClick={() => handleReject(app._id)} className="btn btn-danger" style={{marginLeft:8}}>Reject</button>
                    </>
                  )}

                  {tab === 'approved' && (
                    <button onClick={() => handleReject(app._id)} className="btn btn-danger">Revoke</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
