import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
  AlertCircle
} from 'lucide-react';

import LoginCanvasBackground from './LoginCanvasBackground';
import { loginUser, registerUser } from '../services/api.js';

export default function LoginPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const goHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('locationchange'));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        await registerUser(username || email.split('@')[0], email, password);
        setSuccessMsg('Account created successfully! Logging you in...');

        const loginData = await loginUser(email, password);
        localStorage.setItem('access_token', loginData.access_token);
        localStorage.setItem('user', JSON.stringify(loginData.user));

        setTimeout(() => {
          window.history.pushState({}, '', '/options');
          window.dispatchEvent(new Event('locationchange'));
        }, 800);
      } else {
        const data = await loginUser(email, password);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        window.history.pushState({}, '', '/options');
        window.dispatchEvent(new Event('locationchange'));
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onPopState = () => window.dispatchEvent(new Event('locationchange'));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center lg:justify-end px-4 sm:px-8 lg:px-24 bg-slate-950 text-white font-sans overflow-hidden selection:bg-cyan-500/30">
      {/* 300 Video Frames Canvas Background */}
      <LoginCanvasBackground />

      {/* Atmospheric Soft Radial Glow */}
      <div className="fixed top-1/4 right-10 w-[500px] h-[500px] bg-cyan-600/10 blur-[160px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-32 w-[450px] h-[450px] bg-blue-600/10 blur-[160px] rounded-full pointer-events-none z-0" />

      {/* Right-Aligned Login Panel Container */}
      <main className="relative z-10 w-full max-w-md my-auto py-8">
        <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/75 p-8 sm:p-10 shadow-[0_0_60px_rgba(8,145,178,0.25)] backdrop-blur-2xl transition-all duration-300 hover:border-cyan-500/50 relative overflow-hidden">
          
          {/* Brand Logo Header */}
          <div className="flex flex-col items-center mb-6 text-center">
            <img
              src="/logo.png"
              alt="Stock Vista Logo"
              className="w-16 h-16 object-contain rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.4)] border border-cyan-500/30 mb-3"
            />
            <h1 className="text-2xl font-black bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent tracking-tight">
              Stock Vista
            </h1>
            <p className="text-xs text-cyan-300/80 font-medium tracking-wide">
              AI-POWERED STOCK ANALYTICS
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800/80 mb-8">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                !isRegisterMode
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                isRegisterMode
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* FULL NAME (Only in Sign Up Mode) */}
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={isRegisterMode}
                    className="w-full pl-10 pr-4 py-3.5 text-sm rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3.5 text-sm rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <LockKeyhole size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-11 py-3.5 text-sm rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* REMEMBER ME */}
            {!isRegisterMode && (
              <div className="flex items-center text-xs text-slate-300 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-slate-950"
                  />
                  <span>Remember me</span>
                </label>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-400 text-white hover:from-blue-500 hover:to-cyan-400 shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(56,189,248,0.7)] transition-all transform active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <>
                  <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}