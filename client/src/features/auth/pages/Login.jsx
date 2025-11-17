// import { useState } from "react";
// import { loginApi } from "../../../api/auth";
// import { useNavigate, Link } from "react-router-dom";

// export default function Login() {
//   const [email, setEmail] = useState("manager@demo.com");
//   const [password, setPassword] = useState("pass123");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setError(""); setLoading(true);
//     try {
//       const { user } = await loginApi(email, password);
//       localStorage.setItem("user", JSON.stringify(user));
//       navigate("/dashboard");
//     } catch (e) {
//       setError(e?.response?.data?.message || "Login failed");
//     } finally { setLoading(false); }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-box card">
//         <div className="card-body">
//           <div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
//             <div className="brand-badge">HH</div>
//           </div>
//           <h1 className="login-title">Helping Hands Software</h1>
//           <h2 className="login-subtitle">Sign in to continue</h2>

//           <form className="form mt-3" onSubmit={onSubmit}>
//             <div>
//               <label>Email</label>
//               <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} />
//             </div>

//             <div>
//               <label>Password</label>
//               <input type="password" className="input" value={password} onChange={(e)=>setPassword(e.target.value)} />
//             </div>

//             {error && <div className="alert alert-danger mt-2">{error}</div>}

//             <button disabled={loading} className="btn btn-primary mt-2" style={{width:"100%"}}>
//               {loading ? "Logging in…" : "Login"}
//             </button>
//           </form>

//           <div className="text-sm" style={{textAlign:"center",marginTop:12}}>
//             <Link to="/dashboard" style={{textDecoration:"none"}}>Continue as guest (demo)</Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { loginApi } from "../../../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // --- SIMPLE VALIDATION RULES ---
  const validateEmail = (value) => {
    if (!value) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(value)) return "Invalid email format";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 5) return "Password must be at least 5 characters";
    if (value.length > 20) return "Password cannot exceed 20 characters";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Run validation before sending to backend
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr || passErr) {
      setError(emailErr || passErr);
      return;
    }

    setLoading(true);
    try {
      const { user } = await loginApi(email, password);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (e) {
      setError(e?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box card">
        <div className="card-body">
          <div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
            <div className="brand-badge">HH</div>
          </div>
          <h1 className="login-title">Helping Hands Software</h1>
          <h2 className="login-subtitle">Sign in to continue</h2>

          <form className="form mt-3" onSubmit={onSubmit}>
            
            {/* EMAIL FIELD */}
            <div>
              <label>Email</label>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD FIELD + TOGGLE */}
            <div style={{ position: "relative", marginTop: 12 }}>
              <label>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={20}
              />
              
              {/* Toggle button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: 30,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  padding: 0
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {error && (
              <div className="alert alert-danger mt-2">{error}</div>
            )}

            <button
              disabled={loading}
              className="btn btn-primary mt-2"
              style={{ width: "100%" }}
            >
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>

          <div className="text-sm" style={{ textAlign:"center", marginTop:12 }}>
            {/* <Link to="/dashboard" style={{ textDecoration:"none" }}>
              Continue as guest (demo)
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
}
