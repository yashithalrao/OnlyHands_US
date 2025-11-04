import { useState } from 'react';
import { createShift, publishShift, getShifts } from "../../../api/shifts";
import { useNavigate } from 'react-router-dom';

export default function CreatePublishShift() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <div className="p-6">Please log in.</div>;
  if (user.role !== 'manager') return <div className="p-6">Only managers can create shifts.</div>;

  const [form, setForm] = useState({
    title: '',
    role: '',
    date: '',
    startTime: '',
    endTime: '',
    headcount: 1,
    allowance: 0,
    publishNow: false,
  });
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateClient = () => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.role.trim()) return 'Role is required';
    if (!form.date || !form.startTime || !form.endTime) return 'Pick date, start, end';
    if (+form.headcount < 1) return 'Headcount must be ≥ 1';
    if (+form.allowance < 0) return 'Allowance must be ≥ 0';

    const start = new Date(`${form.date}T${form.startTime}:00`);
    const end = new Date(`${form.date}T${form.endTime}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Invalid date/time';
    if (start.getTime() < Date.now()) return 'Start cannot be in the past';
    if (end <= start) return 'End must be after start';
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validateClient();
    if (v) return setError(v);
    setError('');
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        role: form.role,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        headcount: Number(form.headcount),
        allowance: Number(form.allowance),
        published: Boolean(form.publishNow),
      };
      const doc = await createShift(payload);
      setCreated(doc);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create shift');
    } finally {
      setLoading(false);
    }
  };

  const doPublish = async () => {
    if (!created) return;
    setLoading(true);
    try {
      const upd = await publishShift(created._id);
      setCreated(upd);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to publish');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create & Publish Shift</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Title</label>
          <input className="border p-2 w-full" name="title" value={form.title} onChange={onChange} />
        </div>

        <div>
          <label className="block text-sm">Role</label>
          <input className="border p-2 w-full" name="role" value={form.role} onChange={onChange} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm">Date</label>
            <input type="date" className="border p-2 w-full" name="date" value={form.date} onChange={onChange} />
          </div>
          <div>
            <label className="block text-sm">Start</label>
            <input type="time" className="border p-2 w-full" name="startTime" value={form.startTime} onChange={onChange} />
          </div>
          <div>
            <label className="block text-sm">End</label>
            <input type="time" className="border p-2 w-full" name="endTime" value={form.endTime} onChange={onChange} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Headcount</label>
            <input type="number" min="1" className="border p-2 w-full" name="headcount" value={form.headcount} onChange={onChange} />
          </div>
          <div>
            <label className="block text-sm">Allowance</label>
            <input type="number" min="0" className="border p-2 w-full" name="allowance" value={form.allowance} onChange={onChange} />
          </div>
        </div>

        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="publishNow" checked={form.publishNow} onChange={onChange} />
          <span>Publish immediately</span>
        </label>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button disabled={loading} className="bg-black text-white px-4 py-2 rounded">
          {loading ? 'Saving…' : 'Create shift'}
        </button>
      </form>

      {created && (
        <div className="border rounded p-4 space-y-2">
          <div className="font-medium">Created: {created.title}</div>
          <div>Status: {created.published ? 'Published' : 'Unpublished'}</div>
          {!created.published && (
            <button onClick={doPublish} disabled={loading} className="bg-green-600 text-white px-3 py-1 rounded">
              {loading ? 'Publishing…' : 'Publish now'}
            </button>
          )}
          <button onClick={() => navigate('/dashboard')} className="ml-2 underline">Back to Dashboard</button>
        </div>
      )}
    </div>
  );
}
