// App.jsx
import { Routes, Route, Navigate, Link, Outlet } from "react-router-dom";
import "./styles/ui.css";

import Login from "./features/auth/pages/Login.jsx";
import ShiftsList from "./features/shifts/pages/ShiftsList.jsx";
import CreatePublishShift from "./features/shifts/pages/CreatePublishShift.jsx";
import ManagerApplications from "./features/shifts/pages/ManagerApplications.jsx";
import MyAppliedShifts from "./features/shifts/pages/MyAppliedShifts.jsx";
import ShiftHistory from "./features/shifts/pages/ShiftHistory.jsx";
import ShiftSummaryReport from "./features/shifts/pages/ShiftSummaryReport.jsx";

/* ---------- Brand Header ---------- */
function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/dashboard" className="brand">
          <div className="brand-badge">HH</div>
          <div>
            <div className="brand-title">Helping Hands Software</div>
            <div style={{fontSize:12,opacity:.85}}>Volunteer Shift Management</div>
          </div>
        </Link>
      </div>
    </header>
  );
}

/* ---------- Layout (adds Header to pages) ---------- */
function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

/* ---------- Dashboard (single grid with 5 options) ---------- */
function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="page">
      <h2 className="page-title" style={{textAlign:"center",marginBottom:24}}>
        Welcome, {user.name}
      </h2>

      <div className="dashboard-grid">
        {/* Everyone */}
        <DashLink to="/shifts" title="View Available Shifts" desc="Browse and apply for open shifts">
          <CalendarIcon/>
        </DashLink>

        {/* Volunteer-only */}
        {user.role === "volunteer" && (
          <DashLink to="/my-applications" title="My Applied Shifts" desc="Track your application status">
            <ClipboardIcon/>
          </DashLink>
        )}

        {/* Manager-only */}
        {user.role === "manager" && (
          <>
            <DashLink to="/shifts/new" title="Create & Publish Shift" desc="Create new shifts and publish">
              <SparkIcon/>
            </DashLink>
            <DashLink to="/shifts/history" title="Completed Shifts" desc="See all finished shifts">
              <ChartIcon/>
            </DashLink>
            <DashLink to="/shifts/summary" title="Summary Report" desc="Analyze participation metrics">
              <ReportIcon/>
            </DashLink>
          </>
        )}
      </div>

      <div style={{marginTop:28,textAlign:"center"}}>
        <button
          className="btn btn-outline"
          onClick={() => { localStorage.removeItem("user"); window.location.href = "/login"; }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

/* ---------- Dashboard helper components ---------- */
function DashLink({to, title, desc, children}) {
  return (
    <Link to={to} className="dash-card">
      <div className="dash-icon">{children}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </Link>
  );
}

/* Simple inline SVG icons (pure CSS/HTML, no libs) */
function CalendarIcon(){return(
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="16" rx="3" stroke="#1f3a8a" strokeWidth="1.6"/>
    <path d="M8 2v4M16 2v4M3 9h18" stroke="#1f3a8a" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)}
function ClipboardIcon(){return(
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="6" y="4" width="12" height="16" rx="2" stroke="#1f3a8a" strokeWidth="1.6"/>
    <path d="M9 7h6M8 11h8M8 15h8" stroke="#1f3a8a" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)}
function SparkIcon(){return(
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2z" stroke="#1f3a8a" strokeWidth="1.6" fill="none"/>
  </svg>
)}
function ChartIcon(){return(
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M4 20V6M10 20V10M16 20V4M22 20H2" stroke="#1f3a8a" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)}
function ReportIcon(){return(
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="3" width="16" height="18" rx="2" stroke="#1f3a8a" strokeWidth="1.6"/>
    <path d="M8 8h8M8 12h8M8 16h5" stroke="#1f3a8a" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)}

/* ---------- Routes ---------- */
export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Private (with header) */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/shifts" element={<ShiftsList />} />
        <Route path="/shifts/new" element={<CreatePublishShift />} />
        <Route path="/shifts/history" element={<ShiftHistory />} />
        <Route path="/shifts/summary" element={<ShiftSummaryReport />} />
        <Route path="/shifts/:id/applications" element={<ManagerApplications />} />
        <Route path="/my-applications" element={<MyAppliedShifts />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
