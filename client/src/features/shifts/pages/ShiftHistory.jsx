import React, { useEffect, useState } from "react";
import { getCompletedShifts } from "../../../api/shifts";
import { Link } from "react-router-dom";

export default function ShiftHistory() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return <div className="page">Please log in.</div>;
  if (user.role !== "manager") return <div className="page">Only managers can view history.</div>;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try { setItems((await getCompletedShifts()) || []); }
    catch (err) { setError(err?.response?.data?.message || err.message || "Failed to load history"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="page">Loading…</div>;
  if (error) return <div className="page"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Completed Shifts</h1>
        <Link to="/shifts" className="btn btn-outline">Back to Shifts</Link>
      </div>

      {items.length === 0 ? (
        <div className="subtitle">No completed shifts recorded.</div>
      ) : (
        <div className="grid">
          {items.map(shift => (
            <div key={shift._id} className="card">
              <div className="card-body">
                <div style={{fontWeight:700,fontSize:18}}>{shift.title || shift.role}</div>
                <div className="text-sm mt-2">Start: {shift.start ? new Date(shift.start).toLocaleString() : "N/A"}</div>
                <div className="text-sm">End: {shift.end ? new Date(shift.end).toLocaleString() : "N/A"}</div>
                <div className="mt-2">Volunteers: <span className="badge badge-success">{shift.volunteerCount}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
