import { useState } from 'react';
import { loginApi } from '../../../api/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('manager@demo.com');
  const [password, setPassword] = useState('pass123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await loginApi(email, password);
      // store minimal session in memory/localStorage for UI
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (e) {
      setError(e?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border p-6 rounded-xl">
        <h1 className="text-2xl font-semibold text-center">Shift Scheduler Login</h1>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full border rounded p-2" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input className="w-full border rounded p-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="w-full rounded p-2 bg-black text-white">
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
