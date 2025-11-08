

// import { Routes, Route, Navigate, Link } from 'react-router-dom';
// import Login from './features/auth/pages/Login.jsx';
// import CreatePublishShift from './features/shifts/pages/CreatePublishShift.jsx'; // ⬅️ add

// function Dashboard() {
//   const user = JSON.parse(localStorage.getItem('user') || 'null');
//   if (!user) return <Navigate to="/login" replace />;
//   return (
//     <div className="p-6 space-y-4">
//       <h2 className="text-2xl font-semibold">Welcome, {user.name}</h2>
//       <p>Role: <span className="font-mono">{user.role}</span></p>

//       {user.role === 'manager' && (
//         <Link className="text-blue-600 underline" to="/shifts/new">
//           Create & Publish Shift
//         </Link>
//       )}

//       <Link className="text-blue-600 underline block" to="/login" onClick={() => localStorage.removeItem('user')}>
//         Logout
//       </Link>
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <Routes>
//       <Route path="/login" element={<Login />} />
//       <Route path="/dashboard" element={<Dashboard />} />
//       <Route path="/shifts/new" element={<CreatePublishShift />} /> {/* ⬅️ add */}
//       <Route path="*" element={<Navigate to="/login" replace />} />
//     </Routes>
//   );
// }

import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './features/auth/pages/Login.jsx';
import CreatePublishShift from './features/shifts/pages/CreatePublishShift.jsx';
import ShiftsList from './features/shifts/pages/ShiftsList.jsx'; // NEW

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Welcome, {user.name}</h2>
      <p>Role: <span className="font-mono">{user.role}</span></p>

      {/* everyone can view available shifts */}
      <Link className="text-blue-600 underline block" to="/shifts">
        View Available Shifts
      </Link>

      {user.role === 'manager' && (
        <Link className="text-blue-600 underline" to="/shifts/new">
          Create & Publish Shift
        </Link>
      )}

      <Link className="text-blue-600 underline block" to="/login" onClick={() => localStorage.removeItem('user')}>
        Logout
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/shifts" element={<ShiftsList />} />         {/* ← new */}
      <Route path="/shifts/new" element={<CreatePublishShift />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

