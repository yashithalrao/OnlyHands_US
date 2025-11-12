import React, { useEffect, useState } from "react";
import { getCompletedShifts } from "../../../api/shifts";
import { Link } from "react-router-dom";

export default function ShiftHistory() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return <div className="p-6">Please log in.</div>;
  if (user.role !== "manager")
    return <div className="p-6">Only managers can view history.</div>;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCompletedShifts();
      setItems(data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Completed Shifts</h1>
        <Link to="/shifts" className="text-blue-600 underline">
          Back to Shifts
        </Link>
      </div>

      {items.length === 0 && (
        <div className="text-gray-600">No completed shifts recorded.</div>
      )}

      <div className="space-y-3">
        {items.map((shift) => (
          <div
            key={shift._id}
            className="border rounded p-4 flex justify-between items-start"
          >
            <div>
              <div className="font-medium text-lg">
                {shift.title || shift.role}
              </div>

              <div className="text-sm text-gray-600">
                Start:{" "}
                {shift.start
                  ? new Date(shift.start).toLocaleString()
                  : "N/A"}
              </div>

              <div className="text-sm text-gray-600">
                End:{" "}
                {shift.end ? new Date(shift.end).toLocaleString() : "N/A"}
              </div>

              <div className="mt-1">
                Volunteers:{" "}
                <span className="font-semibold">{shift.volunteerCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
