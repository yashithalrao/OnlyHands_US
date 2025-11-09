import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyApplications, cancelApplication } from "../../../api/shifts";

export default function MyAppliedShifts() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return <div className="p-6">Please log in.</div>;
  if (user.role !== "volunteer")
    return <div className="p-6">Only volunteers can view this page.</div>;

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load my applications
  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await getMyApplications();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Failed to load your applications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Handle cancel
  const handleCancel = async (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this application?\nThis action cannot be undone."
    );
    if (!confirmCancel) return;

    try {
      // show temporary loading on this button
      setItems(prev =>
        prev.map(a =>
          a._id === id ? { ...a, _pendingAction: "cancelling" } : a
        )
      );

      await cancelApplication(id);

      // Remove canceled item
      setItems(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Failed to cancel application"
      );
      await load();
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Applied Shifts</h1>
        <Link to="/shifts" className="text-blue-600 underline">
          Back to shifts
        </Link>
      </div>

      {/* If no applications */}
      {items.length === 0 && (
        <div className="text-gray-600">
          You have not applied to any shifts.
        </div>
      )}

      {/* List of applications */}
      <div className="space-y-3">
        {items.map(app => (
          <div
            key={app._id}
            className="border rounded p-4 flex justify-between items-center"
          >
            {/* LEFT SIDE — shift details */}
            <div>
              <div className="font-medium">
                {app?.shiftId?.title ||
                  app?.shiftId?.role ||
                  "Shift (details unavailable)"}
              </div>

              <div className="text-sm text-gray-600">
                {app?.shiftId?.start
                  ? new Date(app.shiftId.start).toLocaleString()
                  : "Shift time unavailable"}
              </div>

              <div className="mt-1">
                Status:{" "}
                <span className="font-semibold capitalize">{app.status}</span>
              </div>

              {app.note && (
                <div className="text-sm text-gray-700 mt-1">
                  Note: {app.note}
                </div>
              )}
            </div>

            {/* RIGHT SIDE — cancel action */}
            <div>
              {app.status === "pending" ? (
                <button
                  disabled={app._pendingAction === "cancelling"}
                  onClick={() => handleCancel(app._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  {app._pendingAction === "cancelling"
                    ? "Cancelling…"
                    : "Cancel"}
                </button>
              ) : (
                <span className="text-sm text-gray-500">(cannot cancel)</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

