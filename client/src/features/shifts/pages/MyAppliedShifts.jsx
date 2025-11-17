import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyApplications, cancelApplication } from "../../../api/shifts";

export default function MyAppliedShifts() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return <div className="page">Please log in.</div>;
  if (user.role !== "volunteer") return <div className="page">Only volunteers can view this page.</div>;

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setError(""); setLoading(true);
    try { setItems(Array.isArray(await getMyApplications()) ? await getMyApplications() : []); }
    catch (err) { setError(err?.response?.data?.message || err.message || "Failed to load your applications"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this application?")) return;
    try {
      setItems(prev => prev.map(a => a._id===id ? { ...a, _pendingAction:"cancelling" } : a));
      await cancelApplication(id);
      setItems(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to cancel application");
      await load();
    }
  };

  if (loading) return <div className="page">Loading…</div>;
  if (error) return <div className="page"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Applied Shifts</h1>
        <Link to="/shifts" className="btn btn-outline">Back to shifts</Link>
      </div>

      {items.length === 0 ? (
        <div className="subtitle">You have not applied to any shifts.</div>
      ) : (
        <div className="grid">
          {items.map(app => (
            <div key={app._id} className="card">
              <div className="card-body card-row">
                <div>
                  <div style={{fontWeight:600}}>
                    {app?.shiftId?.title || app?.shiftId?.role || "Shift (details unavailable)"}
                  </div>
                  <div className="text-sm">
                    {app?.shiftId?.start ? new Date(app.shiftId.start).toLocaleString() : "Shift time unavailable"}
                  </div>
                  <div className="mt-2">Status: <span className="badge badge-primary" style={{textTransform:"capitalize"}}>{app.status}</span></div>
                  {app.note && <div className="mt-2">Note: {app.note}</div>}
                </div>

                <div className="text-right">
                  {app.status === "pending" ? (
                    <button
                      disabled={app._pendingAction === "cancelling"}
                      onClick={() => handleCancel(app._id)}
                      className="btn btn-danger"
                    >
                      {app._pendingAction === "cancelling" ? "Cancelling…" : "Cancel"}
                    </button>
                  ) : (
                    <span className="text-sm">(cannot cancel)</span>
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
