import { useState } from 'react';
import { applyForShift } from '../../../api/shifts';

export default function ApplyForShift({ shift, onStatusUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <div className="text-sm">Please log in to apply.</div>;
  if (user.role !== 'volunteer') return <div className="text-sm">Only volunteers can apply.</div>;

  const handleApply = async () => {
    setError(''); setSuccess(''); setLoading(true);
    try {
      onStatusUpdate?.({ ...shift, status: 'pending_approval' });
      const res = await applyForShift(shift._id);
      setSuccess(res?.message || 'Applied successfully');
      onStatusUpdate?.({ ...shift, status: res?.shift?.status || 'pending_approval' });
    } catch (err) {
      onStatusUpdate?.(shift);
      setError(err?.response?.data?.message || err?.message || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  if (shift.status === 'pending_approval') return <div className="badge badge-warning">Pending approval</div>;
  if (shift.status === 'approved') return <div className="badge badge-success">Approved</div>;
  if (shift.status === 'closed') return <div className="badge badge-danger">Closed</div>;

  return (
    <div>
      {error && <div className="alert alert-danger mt-2">{error}</div>}
      {success && <div className="alert alert-success mt-2">{success}</div>}
      <button onClick={handleApply} disabled={loading} className="btn btn-primary mt-2">
        {loading ? 'Applying…' : 'Apply'}
      </button>
    </div>
  );
}
