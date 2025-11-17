// import { useState } from 'react';
// import { createShift, publishShift } from "../../../api/shifts";
// import { useNavigate } from 'react-router-dom';

// export default function CreatePublishShift() {
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem('user') || 'null');
//   if (!user) return <div className="page">Please log in.</div>;
//   if (user.role !== 'manager') return <div className="page">Only managers can create shifts.</div>;

//   const [form, setForm] = useState({
//     title:'', role:'', date:'', startTime:'', endTime:'', headcount:1, allowance:0, publishNow:false
//   });
//   const [error, setError] = useState('');
//   const [created, setCreated] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const onChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
//   };

//   const validateClient = () => {
//     if (!form.title.trim()) return 'Title is required';
//     if (!form.role.trim()) return 'Role is required';
//     if (!form.date || !form.startTime || !form.endTime) return 'Pick date, start, end';
//     if (+form.headcount < 1) return 'Headcount must be ≥ 1';
//     if (+form.allowance < 0) return 'Allowance must be ≥ 0';
//     const start = new Date(`${form.date}T${form.startTime}:00`);
//     const end = new Date(`${form.date}T${form.endTime}:00`);
//     if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Invalid date/time';
//     if (start.getTime() < Date.now()) return 'Start cannot be in the past';
//     if (end <= start) return 'End must be after start';
//     return '';
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     const v = validateClient();
//     if (v) return setError(v);
//     setError(''); setLoading(true);
//     try {
//       const payload = {
//         title: form.title, role: form.role, date: form.date,
//         startTime: form.startTime, endTime: form.endTime,
//         headcount: Number(form.headcount), allowance: Number(form.allowance),
//         published: Boolean(form.publishNow),
//       };
//       const doc = await createShift(payload);
//       setCreated(doc);
//     } catch (err) {
//       setError(err?.response?.data?.message || err.message || 'Failed to create shift');
//     } finally { setLoading(false); }
//   };

//   const doPublish = async () => {
//     if (!created) return;
//     setLoading(true);
//     try {
//       const upd = await publishShift(created._id);
//       setCreated(upd);
//     } catch (err) {
//       setError(err?.response?.data?.message || err.message || 'Failed to publish');
//     } finally { setLoading(false); }
//   };

//   return (
//     <div className="page">
//       <div className="page-header">
//         <h1 className="page-title">Create &amp; Publish Shift</h1>
//       </div>

//       <div className="card">
//         <div className="card-body">
//           <form onSubmit={onSubmit} className="form">
//             <div>
//               <label>Title</label>
//               <input className="input" name="title" value={form.title} onChange={onChange} />
//             </div>

//             <div>
//               <label>Role</label>
//               <input className="input" name="role" value={form.role} onChange={onChange} />
//             </div>

//             <div className="form-row">
//               <div>
//                 <label>Date</label>
//                 <input type="date" className="input" name="date" value={form.date} onChange={onChange} />
//               </div>
//               <div>
//                 <label>Start</label>
//                 <input type="time" className="input" name="startTime" value={form.startTime} onChange={onChange} />
//               </div>
//               <div>
//                 <label>End</label>
//                 <input type="time" className="input" name="endTime" value={form.endTime} onChange={onChange} />
//               </div>
//             </div>

//             <div className="form-row form-row-2">
//               <div>
//                 <label>Headcount</label>
//                 <input type="number" min="1" className="input" name="headcount" value={form.headcount} onChange={onChange} />
//               </div>
//               <div>
//                 <label>Allowance</label>
//                 <input type="number" min="0" className="input" name="allowance" value={form.allowance} onChange={onChange} />
//               </div>
//             </div>

//             <label style={{display:"flex",alignItems:"center"}}>
//               <input type="checkbox" className="checkbox" name="publishNow" checked={form.publishNow} onChange={onChange} />
//               Publish immediately
//             </label>

//             {error && <div className="alert alert-danger">{error}</div>}

//             <button disabled={loading} className="btn btn-primary">
//               {loading ? 'Saving…' : 'Create shift'}
//             </button>
//           </form>
//         </div>
//       </div>

//       {created && (
//         <div className="card mt-4">
//           <div className="card-body">
//             <div style={{fontWeight:600}}>Created: {created.title}</div>
//             <div className="mt-2">Status: {created.published ? 'Published' : 'Unpublished'}</div>
//             <div className="mt-3">
//               {!created.published && (
//                 <button onClick={doPublish} disabled={loading} className="btn btn-success">
//                   {loading ? 'Publishing…' : 'Publish now'}
//                 </button>
//               )}
//               <button onClick={() => navigate('/dashboard')} className="btn btn-ghost" style={{marginLeft:8}}>
//                 Back to Dashboard
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState } from 'react';
import { createShift, publishShift } from "../../../api/shifts";
import { useNavigate } from 'react-router-dom';

export default function CreatePublishShift() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <div className="page">Please log in.</div>;
  if (user.role !== 'manager') return <div className="page">Only managers can create shifts.</div>;

  const [form, setForm] = useState({
    title: '', role: '', date: '', startTime: '', endTime: '', headcount: 1, allowance: 0, publishNow: false
  });
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    // keep numbers as strings in state (HTML inputs behave this way) but validator will coerce
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateClient = () => {
    // Title length
    const title = String(form.title || '').trim();
    if (!title) return 'Title is required';
    if (title.length < 4) return 'Title must be at least 4 characters';
    if (title.length > 50) return 'Title cannot exceed 50 characters';

    // Role length
    const role = String(form.role || '').trim();
    if (!role) return 'Role is required';
    if (role.length < 3) return 'Role must be at least 3 characters';
    if (role.length > 50) return 'Role cannot exceed 50 characters';

    // Date and times
    if (!form.date || !form.startTime || !form.endTime) return 'Pick date, start, and end time';

    // headcount
    const headcountNum = Number(form.headcount);
    if (!Number.isFinite(headcountNum) || !Number.isInteger(headcountNum)) return 'Headcount must be an integer';
    if (headcountNum < 1) return 'Headcount must be ≥ 1';

    // allowance
    const allowanceNum = Number(form.allowance);
    if (!Number.isFinite(allowanceNum)) return 'Allowance must be a number';
    if (allowanceNum < 0) return 'Allowance must be ≥ 0';

    // Build Date objects (local)
    const start = new Date(`${form.date}T${form.startTime}:00`);
    const end = new Date(`${form.date}T${form.endTime}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Invalid date/time';
    if (start.getTime() < Date.now()) return 'Start cannot be in the past';
    if (end.getTime() <= start.getTime()) return 'End must be after start';

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
        title: String(form.title).trim(),
        role: String(form.role).trim(),
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
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Create &amp; Publish Shift</h1>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={onSubmit} className="form">
            <div>
              <label>Title</label>
              <input
                className="input"
                name="title"
                value={form.title}
                onChange={onChange}
                maxLength={50}
                placeholder="Shift title (4-50 chars)"
              />
            </div>

            <div>
              <label>Role</label>
              <input
                className="input"
                name="role"
                value={form.role}
                onChange={onChange}
                maxLength={50}
                placeholder="Role (3-50 chars)"
              />
            </div>

            <div className="form-row">
              <div>
                <label>Date</label>
                <input type="date" className="input" name="date" value={form.date} onChange={onChange} />
              </div>
              <div>
                <label>Start</label>
                <input type="time" className="input" name="startTime" value={form.startTime} onChange={onChange} />
              </div>
              <div>
                <label>End</label>
                <input type="time" className="input" name="endTime" value={form.endTime} onChange={onChange} />
              </div>
            </div>

            <div className="form-row form-row-2">
              <div>
                <label>Headcount</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="input"
                  name="headcount"
                  value={form.headcount}
                  onChange={onChange}
                />
              </div>
              <div>
                <label>Allowance</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input"
                  name="allowance"
                  value={form.allowance}
                  onChange={onChange}
                />
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center" }}>
              <input type="checkbox" className="checkbox" name="publishNow" checked={form.publishNow} onChange={onChange} />
              Publish immediately
            </label>

            {error && <div className="alert alert-danger">{error}</div>}

            <button disabled={loading} className="btn btn-primary">
              {loading ? 'Saving…' : 'Create shift'}
            </button>
          </form>
        </div>
      </div>

      {created && (
        <div className="card mt-4">
          <div className="card-body">
            <div style={{ fontWeight: 600 }}>Created: {created.title}</div>
            <div className="mt-2">Status: {created.published ? 'Published' : 'Unpublished'}</div>
            <div className="mt-3">
              {!created.published && (
                <button onClick={doPublish} disabled={loading} className="btn btn-success">
                  {loading ? 'Publishing…' : 'Publish now'}
                </button>
              )}
              <button onClick={() => navigate('/dashboard')} className="btn btn-ghost" style={{ marginLeft: 8 }}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
