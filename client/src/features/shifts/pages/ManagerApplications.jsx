// client/src/features/shifts/pages/ManagerApplications.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getShiftApplications,
  approveApplication,
  rejectApplication
} from '../../../api/shifts';

export default function ManagerApplications() {
  const { id: shiftId } = useParams();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <div className="p-6">Please log in.</div>;
  if (user.role !== 'manager') return <div className="p-6">Only managers can view applications.</div>;

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line
  }, [tab, shiftId]);

  const load = async (statusTab = '') => {
    setError('');
    setLoading(true);
    try {
      const data = await getShiftApplications(shiftId, statusTab);
      setItems(data || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId) => {
    // optimistic UI: mark locally as approving
    setItems(prev => prev.map(it => (it._id === appId ? { ...it, _pendingAction: 'approving' } : it)));
    try {
      const res = await approveApplication(appId);
      // if server waitlisted due to capacity, update status accordingly
      const updated = res.application || res;
      setItems(prev => prev.map(it => (it._id === appId ? updated : it)));
      // if approved, refresh waitlist and pending to reflect promotions
      await load(tab);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || 'Failed to approve');
      // rollback
      await load(tab);
    }
  };

  const handleReject = async (appId) => {
    setItems(prev => prev.map(it => (it._id === appId ? { ...it, _pendingAction: 'rejecting' } : it)));
    try {
      const res = await rejectApplication(appId);
      // server returns { application, promoted }
      const updated = res.application || res;
      setItems(prev => prev.filter(it => it._id !== appId)); // remove from current list
      // if promoted, we may want to show change in approved list — reload both tabs
      await load(tab);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || 'Failed to reject');
      await load(tab);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Applications for Shift</h1>
        <Link to="/shifts" className="text-blue-600 underline">Back to shifts</Link>
      </div>

      <div className="mt-4 space-x-2">
        <button className={`px-3 py-1 rounded ${tab === 'pending' ? 'bg-black text-white' : 'border'}`} onClick={() => setTab('pending')}>Pending</button>
        <button className={`px-3 py-1 rounded ${tab === 'waitlisted' ? 'bg-black text-white' : 'border'}`} onClick={() => setTab('waitlisted')}>Waitlist</button>
        <button className={`px-3 py-1 rounded ${tab === 'approved' ? 'bg-black text-white' : 'border'}`} onClick={() => setTab('approved')}>Approved</button>
        <button className={`px-3 py-1 rounded ${tab === 'rejected' ? 'bg-black text-white' : 'border'}`} onClick={() => setTab('rejected')}>Rejected</button>
      </div>

      <div className="mt-4">
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="space-y-3">
            {items.length === 0 && <div className="text-gray-600">No applications in this list.</div>}

            {items.map(app => (
              <div key={app._id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{app.userId?.name || app.userId?.email || 'Volunteer'}</div>
                  <div className="text-sm text-gray-600">Applied: {new Date(app.appliedAt).toLocaleString()}</div>
                  {app.note && <div className="text-sm mt-1">Note: {app.note}</div>}
                </div>

                <div className="space-x-2">
                  {tab === 'pending' && (
                    <>
                      <button
                        disabled={app._pendingAction === 'approving'}
                        onClick={() => handleApprove(app._id)}
                        className="px-3 py-1 rounded bg-green-600 text-white"
                      >
                        {app._pendingAction === 'approving' ? 'Approving…' : 'Approve'}
                      </button>
                      <button
                        disabled={app._pendingAction === 'rejecting'}
                        onClick={() => handleReject(app._id)}
                        className="px-3 py-1 rounded bg-red-600 text-white"
                      >
                        {app._pendingAction === 'rejecting' ? 'Rejecting…' : 'Reject'}
                      </button>
                    </>
                  )}

                  {tab === 'waitlisted' && (
                    <>
                      <button
                        onClick={() => handleApprove(app._id)}
                        className="px-3 py-1 rounded bg-green-600 text-white"
                      >
                        Promote
                      </button>
                      <button
                        onClick={() => handleReject(app._id)}
                        className="px-3 py-1 rounded bg-red-600 text-white"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {tab === 'approved' && (
                    <button onClick={() => handleReject(app._id)} className="px-3 py-1 rounded bg-red-600 text-white">
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
