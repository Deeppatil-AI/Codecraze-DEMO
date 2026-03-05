import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash,
  FaCheckCircle, FaCar,
} from 'react-icons/fa';
import { requestSignupOtp, verifySignupOtp } from '../services/api';

const perks = [
  { icon: '🚗', text: 'Book parking slots in seconds' },
  { icon: '📍', text: 'Real-time slot availability' },
  { icon: '💳', text: 'Secure, hassle-free payments' },
  { icon: '📱', text: 'Instant SMS & email confirmations' },
];

const STEPS = { FORM: 'form', OTP: 'otp', SUCCESS: 'success' };

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(STEPS.FORM);
  const [otp, setOtp] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score; // 0-4
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
      };
      await requestSignupOtp(payload);
      setStep(STEPS.OTP);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen pt-[60px] overflow-hidden">
      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 relative overflow-hidden flex-shrink-0"
        style={{
          background: 'linear-gradient(150deg, #0d0a28 0%, #1a1050 50%, #0b1630 100%)',
        }}
      >
        {/* Glow blobs */}
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)' }} />

        {/* Spacer where logo would be — navbar handles branding */}
        <div className="relative z-10 h-6" />

        {/* Middle copy */}
        <div className="relative z-10">
          <h2 className="text-[36px] font-extrabold text-white leading-tight tracking-tight mb-4">
            Park smarter,<br />
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              live better.
            </span>
          </h2>
          <p className="text-white/50 text-[14px] leading-relaxed mb-8">
            Join thousands of drivers who save time and money with intelligent parking management.
          </p>

          <div className="space-y-4">
            {perks.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-base flex-shrink-0">
                  {p.icon}
                </span>
                <span className="text-white/70 text-[13px] font-medium">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom footnote */}
        <div className="relative z-10 text-white/30 text-[11px]">
          © 2025 ParkMate. All rights reserved.
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 bg-[#f4f3fb] overflow-y-auto">
        <div className="w-full max-w-[420px] my-auto">

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Gradient bar */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5, #2563eb)' }} />

            <div className="p-8">
              <div className="mb-7">
                <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Create your account</h1>
                <p className="text-[13px] text-gray-400 mt-1">
                  {step === STEPS.FORM && 'Start parking smarter in under 2 minutes.'}
                  {step === STEPS.OTP && `We’ve sent a 6‑digit code to ${form.email}. Enter it to verify your account.`}
                </p>
              </div>

              {success ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <FaCheckCircle className="text-emerald-500 text-4xl" />
                  <p className="text-[15px] font-bold text-gray-800">Account created!</p>
                  <p className="text-[12px] text-gray-400">Redirecting you to the dashboard…</p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-5 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[12px] text-center">
                      {error}
                    </div>
                  )}

                  {step === STEPS.FORM && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Full Name</label>
                      <div className="relative">
                        <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 text-[11px]" />
                        <input
                          type="text" name="name" value={form.name}
                          onChange={handleChange} placeholder="John Doe" required
                          className="input-field input-field-icon" id="signup-name"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Email</label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 text-[11px]" />
                        <input
                          type="email" name="email" value={form.email}
                          onChange={handleChange} placeholder="you@example.com" required
                          className="input-field input-field-icon" id="signup-email"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Password</label>
                      <div className="relative">
                        <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 text-[11px]" />
                        <input
                          type={showPass ? 'text' : 'password'} name="password"
                          value={form.password} onChange={handleChange}
                          placeholder="••••••••" required
                          className="input-field input-field-icon pr-10" id="signup-password"
                        />
                        <button
                          type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-[11px]"
                        >
                          {showPass ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>

                      {/* Strength meter */}
                      {form.password && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4].map((n) => (
                              <div
                                key={n}
                                className="h-1 flex-1 rounded-full transition-all duration-300"
                                style={{ background: n <= strength ? strengthColor[strength] : '#e5e7eb' }}
                              />
                            ))}
                          </div>
                          <p className="text-[11px] font-semibold" style={{ color: strengthColor[strength] }}>
                            {strengthLabel[strength]}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 text-[11px]" />
                        <input
                          type={showConfirm ? 'text' : 'password'} name="confirm"
                          value={form.confirm} onChange={handleChange}
                          placeholder="••••••••" required
                          className="input-field input-field-icon pr-10" id="signup-confirm"
                        />
                        <button
                          type="button" onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-[11px]"
                        >
                          {showConfirm ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {form.confirm && form.password !== form.confirm && (
                        <p className="text-[11px] text-red-500 mt-1">Passwords don't match</p>
                      )}
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-2.5 cursor-pointer mt-1">
                      <input type="checkbox" required className="accent-violet-600 w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span className="text-[12px] text-gray-500">
                        I agree to the{' '}
                        <span className="text-violet-600 font-semibold hover:underline cursor-pointer">Terms of Service</span>{' '}
                        and{' '}
                        <span className="text-violet-600 font-semibold hover:underline cursor-pointer">Privacy Policy</span>
                      </span>
                    </label>

                    <button
                      type="submit" disabled={loading}
                      id="signup-submit"
                      className="w-full btn-primary py-3.5 text-[14px] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating account…
                        </>
                      ) : 'Create Account →'}
                    </button>
                  </form>
                  )}

                  {step === STEPS.OTP && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setError('');
                        if (otp.trim().length < 6) {
                          setError('Please enter the 6-digit code sent to your email.');
                          return;
                        }
                        setLoading(true);
                        try {
                          const data = await verifySignupOtp({ email: form.email, otp: otp.trim() });
                          if (!data?.token || !data?.user) {
                            throw new Error('Unexpected server response. Please try again.');
                          }
                          localStorage.setItem('parkmate_user', JSON.stringify(data.user));
                          localStorage.setItem('parkmate_token', data.token);
                          setSuccess(true);
                          setTimeout(() => navigate('/'), 1400);
                        } catch (err) {
                          setError(err.message || 'Invalid or expired code. Please try again.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                          Enter 6-digit verification code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          className="input-field text-center tracking-[0.4em] font-mono text-[16px]"
                          placeholder="••••••"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3.5 text-[14px] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                      >
                        {loading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Verifying…
                          </>
                        ) : 'Verify & Create Account →'}
                      </button>
                    </form>
                  )}

                  <p className="mt-6 text-center text-[12px] text-gray-400">
                    Already have an account?{' '}
                    <Link to="/" className="text-violet-600 hover:text-violet-800 font-bold transition"
                      onClick={() => window.dispatchEvent(new Event('openLogin'))}>
                      Log In
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
