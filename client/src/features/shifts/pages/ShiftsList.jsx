import React, { useEffect, useState } from "react";
import { getShifts, completeShift } from "../../../api/shifts";
import ApplyForShift from "./ApplyForShift";
import { Link } from "react-router-dom";

export default function ShiftsList() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getShifts();
        if (!cancelled) setShifts(data || []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load shifts"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const onStatusUpdate = (updatedShift) => {
    setShifts((prev) =>
      prev.map((s) => (s._id === updatedShift._id ? updatedShift : s))
    );
  };

  if (loading) return <div className="page">Loading shifts…</div>;
  if (error) return <div className="page alert alert-danger">{error}</div>;
  if (!shifts.length) return <div className="page">No shifts available.</div>;

  return (
    <div className="page">
      <div className="page-title">Available Shifts</div>
      <div className="subtitle">Find and apply for active volunteer shifts</div>

      <div className="grid" style={{ marginTop: 20 }}>
        {user?.role === "manager" && (
          <Link to="/shifts/new" className="btn btn-primary" style={{ width: "180px" }}>
            + Create Shift
          </Link>
        )}
      </div>

      <div className="grid" style={{ marginTop: 22, gap: "20px" }}>
        {shifts.map((shift) => (
          <ShiftCard
            key={shift._id}
            shift={shift}
            onStatusUpdate={onStatusUpdate}
            user={user}
          />
        ))}
      </div>
    </div>
  );
}

function ShiftCard({ shift, onStatusUpdate, user }) {
  const handleComplete = async () => {
    try {
      const res = await completeShift(shift._id);
      onStatusUpdate(res.shift);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to complete shift");
    }
  };

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="card-body">
        <div className="card-row">
          <div>
            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>
              {shift.title || shift.role}
            </h3>

            <div className="mt-2">
              <span className="badge badge-primary">Visible</span>{" "}
              <span
                className={
                  shift.status === "completed"
                    ? "badge badge-success"
                    : shift.status === "open"
                    ? "badge badge-warning"
                    : "badge badge-muted"
                }
              >
                {formatStatus(shift.status)}
              </span>
            </div>

            <div className="text-sm mt-2">
              Start:{" "}
              {shift.start ? new Date(shift.start).toLocaleString() : "N/A"}
            </div>
            <div className="text-sm">
              End: {shift.end ? new Date(shift.end).toLocaleString() : "N/A"}
            </div>
          </div>

          <div className="text-right">
            {/* Volunteer actions */}
            {user?.role === "volunteer" && (
              <ApplyForShift shift={shift} onStatusUpdate={onStatusUpdate} />
            )}

            {/* Manager actions */}
            {user?.role === "manager" && (
              <>
                <Link
                  to={`/shifts/${shift._id}/applications`}
                  className="btn btn-outline mt-2"
                  style={{ display: "inline-block" }}
                >
                  View Applications
                </Link>

                {shift.status !== "completed" && (
                  <button
                    onClick={handleComplete}
                    className="btn btn-success mt-2"
                  >
                    Mark as Completed
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatStatus(status) {
  if (!status) return "Open";
  if (status === "pending_approval") return "Pending Approval";
  if (status === "open") return "Open";
  if (status === "closed") return "Closed";
  if (status === "completed") return "Completed";
  return status;
}
