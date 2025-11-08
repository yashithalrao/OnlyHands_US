// client/src/features/shifts/pages/ApplyForShift.jsx
import { useState } from 'react';
import { applyForShift } from '../../../api/shifts'; // relative path may vary

export default function ApplyForShift({ shift, onStatusUpdate }) {
  // shift: object with _id, title, status, published ...
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <div className="p-4">Please log in to apply.</div>;
  if (user.role !== 'volunteer') return <div className="p-4">Only volunteers can apply.</div>;

  const handleApply = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // optimistic UI: immediately tell parent to mark pending
      onStatusUpdate?.({ ...shift, status: 'pending_approval' });

      const res = await applyForShift(shift._id);

      setSuccess(res?.message || 'Applied successfully');
      // server returns shift status; ensure UI reflects server
      onStatusUpdate?.({ ...shift, status: res?.shift?.status || 'pending_approval' });
    } catch (err) {
      // rollback optimistic update on error
      onStatusUpdate?.(shift);
      const msg = err?.response?.data?.message || err?.message || 'Failed to apply';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // If already pending/approved/rejected, show label instead of apply
  if (shift.status === 'pending_approval') {
    return <div className="p-3 rounded border text-sm font-medium">Pending approval</div>;
  }
  if (shift.status === 'approved') {
    return <div className="p-3 rounded border text-sm font-medium">Approved</div>;
  }
  if (shift.status === 'closed') {
    return <div className="p-3 rounded border text-sm font-medium">Closed</div>;
  }

  return (
    <div className="space-y-2">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-700 text-sm">{success}</div>}

      <button
        onClick={handleApply}
        disabled={loading}
        className="bg-blue-600 text-white px-3 py-1 rounded"
      >
        {loading ? 'Applying…' : 'Apply'}
      </button>
    </div>
  );
}
