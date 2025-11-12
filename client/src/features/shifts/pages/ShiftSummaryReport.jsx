import React, { useEffect, useState } from "react";
import { getShiftSummaryReport } from "../../../api/shifts";
import { Link } from "react-router-dom";

export default function ShiftSummaryReport() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return <div className="p-6">Please log in.</div>;
  if (user.role !== "manager")
    return <div className="p-6">Only managers can view the report.</div>;

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: "", to: "" });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getShiftSummaryReport(filters);
      setItems(data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Failed to load report"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    load();
  };

  const handleDownloadCSV = () => {
    if (!items.length) {
      alert("No data to export!");
      return;
    }

    const headers = ["Title", "Role", "Start", "End", "Volunteers", "Status"];
    const rows = items.map((s) => [
      `"${s.title}"`,
      `"${s.role}"`,
      `"${new Date(s.start).toLocaleString()}"`,
      `"${new Date(s.end).toLocaleString()}"`,
      s.totalVolunteers,
      s.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shift_summary_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shift Summary Report</h1>
        <Link to="/dashboard" className="text-blue-600 underline">
          Back to Dashboard
        </Link>
      </div>

      {/* Filter Form */}
      <form
        onSubmit={handleFilter}
        className="flex flex-wrap gap-2 items-center mb-4"
      >
        <label className="text-sm">
          From:
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
            className="border rounded p-1 ml-1"
          />
        </label>
        <label className="text-sm">
          To:
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
            className="border rounded p-1 ml-1"
          />
        </label>
        <button
          type="submit"
          className="bg-black text-white px-3 py-1 rounded text-sm"
        >
          Filter
        </button>

        <button
          type="button"
          onClick={handleDownloadCSV}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm ml-2"
        >
          Download CSV
        </button>
      </form>

      {/* Table */}
      {items.length === 0 ? (
        <div className="text-gray-600">No completed shifts in this range.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Title</th>
                <th className="border px-3 py-2 text-left">Role</th>
                <th className="border px-3 py-2 text-left">Start</th>
                <th className="border px-3 py-2 text-left">End</th>
                <th className="border px-3 py-2 text-left">Volunteers</th>
                <th className="border px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((shift) => (
                <tr key={shift._id}>
                  <td className="border px-3 py-2">{shift.title}</td>
                  <td className="border px-3 py-2">{shift.role}</td>
                  <td className="border px-3 py-2">
                    {new Date(shift.start).toLocaleString()}
                  </td>
                  <td className="border px-3 py-2">
                    {new Date(shift.end).toLocaleString()}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {shift.totalVolunteers}
                  </td>
                  <td className="border px-3 py-2 capitalize">
                    {shift.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
