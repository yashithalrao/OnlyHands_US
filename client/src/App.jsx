// Route imports
import { Routes, Route, Navigate, Link } from "react-router-dom";

// Auth
import Login from "./features/auth/pages/Login.jsx";

// Shift pages
import ShiftsList from "./features/shifts/pages/ShiftsList.jsx";
import CreatePublishShift from "./features/shifts/pages/CreatePublishShift.jsx";
import ManagerApplications from "./features/shifts/pages/ManagerApplications.jsx";
import MyAppliedShifts from "./features/shifts/pages/MyAppliedShifts.jsx";

// Dashboard Component
function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Welcome, {user.name}</h2>
      <p>
        Role: <span className="font-mono">{user.role}</span>
      </p>

      {/* Everyone can view available shifts */}
      <Link className="text-blue-600 underline block" to="/shifts">
        View Available Shifts
      </Link>

      {/* Volunteers: My Applications */}
      {user.role === "volunteer" && (
        <Link className="text-blue-600 underline block" to="/my-applications">
          My Applied Shifts
        </Link>
      )}

      {/* Managers: Create New Shift */}
      {user.role === "manager" && (
        <Link className="text-blue-600 underline block" to="/shifts/new">
          Create & Publish Shift
        </Link>
      )}

      {/* Logout */}
      <Link
        className="text-blue-600 underline block"
        to="/login"
        onClick={() => localStorage.removeItem("user")}
      >
        Logout
      </Link>
    </div>
  );
}

// App Routes
export default function App() {
  return (
    <Routes>

      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Shifts */}
      <Route path="/shifts" element={<ShiftsList />} />
      <Route path="/shifts/new" element={<CreatePublishShift />} />

      {/* Manager: View applications for a shift */}
      <Route
        path="/shifts/:id/applications"
        element={<ManagerApplications />}
      />

      {/* Volunteer: View my applications */}
      <Route
        path="/my-applications"
        element={<MyAppliedShifts />}
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
