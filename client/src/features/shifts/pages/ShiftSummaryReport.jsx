import React, { useEffect, useState } from "react";
import { getShiftSummaryReport } from "../../../api/shifts";
import { Link } from "react-router-dom";

export default function ShiftSummaryReport() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return <div className="page">Please log in.</div>;
  if (user.role !== "manager") return <div className="page">Only managers can view the report.</div>;

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: "", to: "" });

  const load = async () => {
    setLoading(true); setError("");
    try { setItems((await getShiftSummaryReport(filters)) || []); }
    catch (err) { setError(err?.response?.data?.message || err.message || "Failed to load report"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleFilter = (e) => { e.preventDefault(); load(); };

  const handleDownloadCSV = () => {
    if (!items.length) { alert("No data to export!"); return; }
    const headers = ["Title","Role","Start","End","Volunteers","Status"];
    const rows = items.map(s => [
      `"${s.title}"`,`"${s.role}"`,`"${new Date(s.start).toLocaleString()}"`,
      `"${new Date(s.end).toLocaleString()}"`, s.totalVolunteers, s.status,
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shift_summary_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="page">Loading…</div>;
  if (error) return <div className="page"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Shift Summary Report</h1>
        <Link to="/dashboard" className="btn btn-outline">Back to Dashboard</Link>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleFilter} style={{display:"flex",flexWrap:"wrap",gap:10,alignItems:"center"}}>
            <label>From
              <input type="date" value={filters.from} onChange={(e)=>setFilters(f=>({ ...f, from:e.target.value}))} className="input" />
            </label>
            <label>To
              <input type="date" value={filters.to} onChange={(e)=>setFilters(f=>({ ...f, to:e.target.value}))} className="input" />
            </label>
            <button type="submit" className="btn btn-primary">Filter</button>
            <button type="button" onClick={handleDownloadCSV} className="btn btn-success">Download CSV</button>
          </form>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="subtitle mt-3">No completed shifts in this range.</div>
      ) : (
        <div className="table-wrap mt-3">
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Role</th><th>Start</th><th>End</th><th>Volunteers</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(shift => (
                <tr key={shift._id}>
                  <td>{shift.title}</td>
                  <td>{shift.role}</td>
                  <td>{new Date(shift.start).toLocaleString()}</td>
                  <td>{new Date(shift.end).toLocaleString()}</td>
                  <td style={{textAlign:"center"}}>{shift.totalVolunteers}</td>
                  <td style={{textTransform:"capitalize"}}>{shift.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
