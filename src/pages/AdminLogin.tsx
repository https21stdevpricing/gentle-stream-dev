import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { login } from '@/utils/api';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (isAdmin) { navigate('/admin', { replace: true }); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const res = await login(username, password);
      loginAdmin(res.data.token, res.data.username);
      toast.success('Welcome back!');
      navigate('/admin', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-sw-offwhite flex items-center justify-center px-4" data-testid="admin-login-page">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-block mb-3">
            <span className="font-bold text-3xl text-sw-black">SW</span>
          </div>
          <h1 className="font-bold text-sw-black text-xl tracking-tight">Stone World</h1>
          <p className="text-sw-gray text-xs mt-1">Admin Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.06)' }}>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="admin-login-form">
            <div>
              <label className="text-xs text-sw-gray uppercase tracking-[0.1em] block mb-2">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sw-gray" strokeWidth={1.5} />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="admin" data-testid="admin-username-input"
                  className="w-full pl-10 pr-4 py-3 bg-sw-offwhite border border-transparent rounded-xl text-sm text-sw-black focus:outline-none focus:border-sw-black/15 transition-colors" />
              </div>
            </div>

            <div>
              <label className="text-xs text-sw-gray uppercase tracking-[0.1em] block mb-2">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sw-gray" strokeWidth={1.5} />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password" data-testid="admin-password-input"
                  className="w-full pl-10 pr-12 py-3 bg-sw-offwhite border border-transparent rounded-xl text-sm text-sw-black focus:outline-none focus:border-sw-black/15 transition-colors" />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sw-gray hover:text-sw-black transition-colors">
                  {showPw ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} data-testid="admin-login-btn"
              className="btn-primary w-full py-3.5 mt-2 disabled:opacity-50">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 p-3 bg-sw-offwhite rounded-xl">
            <p className="text-xs text-sw-gray text-center">
              Default: <span className="text-sw-black font-medium">admin</span> / <span className="text-sw-black font-medium">StoneWorld@2024</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
