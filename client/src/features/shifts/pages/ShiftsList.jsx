// client/src/features/shifts/pages/ShiftsList.jsx
import React, { useEffect, useState } from 'react';
import { getShifts } from '../../../api/shifts'; // adjust path if needed
import ApplyForShift from './ApplyForShift'; // same dir as earlier created file

export default function ShiftsList() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getShifts();
        if (!cancelled) setShifts(data || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(err?.response?.data?.message || err.message || 'Failed to load shifts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // optimistic update handler: replaces the shift in local array
  const onStatusUpdate = (updatedShift) => {
    setShifts(prev => prev.map(s => (s._id === updatedShift._id ? updatedShift : s)));
  };

  if (loading) return <div className="p-6">Loading shifts…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!shifts.length) return <div className="p-6">No shifts available.</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Available Shifts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shifts.map(shift => (
          <ShiftCard key={shift._id} shift={shift} onStatusUpdate={onStatusUpdate} />
        ))}
      </div>
    </div>
  );
}

/* Small presentational card that uses ApplyForShift */
function ShiftCard({ shift, onStatusUpdate }) {
  return (
    <div className="border rounded p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-medium">{shift.title || shift.role}</h2>
          <p className="text-sm text-gray-600">
            {shift.published ? 'Visible' : 'Draft'} • Status: <span className="font-semibold">{formatStatus(shift.status)}</span>
          </p>
          <p className="text-sm mt-2">Start: {shift.start ? new Date(shift.start).toLocaleString() : 'N/A'}</p>
          <p className="text-sm">End: {shift.end ? new Date(shift.end).toLocaleString() : 'N/A'}</p>
        </div>

        <div>
          {/* place apply button / label */}
          <ApplyForShift shift={shift} onStatusUpdate={onStatusUpdate} />
        </div>
      </div>
    </div>
  );
}

function formatStatus(status) {
  if (!status) return 'open';
  if (status === 'pending_approval') return 'Pending approval';
  if (status === 'open') return 'Open';
  if (status === 'closed') return 'Closed';
  return status;
}
