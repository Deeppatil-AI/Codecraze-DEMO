import { useState, useRef, useEffect } from 'react';
import { forgotPassword, verifyOtp, resetPassword } from "../services/api";
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCar, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

const STEPS = { EMAIL: 'email', OTP: 'otp', RESET: 'reset', DONE: 'done' };

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);

  // Countdown for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await forgotPassword({ email });
    setLoading(false);
    setStep(STEPS.OTP);
    setResendTimer(30);
  };

  const handleOtpChange = (val, idx) => {
    if (!/^[0-9]?$/.test(val)) return;
    const updated = [...otp];
    updated[idx] = val;
    setOtp(updated);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.join('').length < 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    await verifyOtp({
      email,
      otp: otp.join("")
    });
    setLoading(false);
    setStep(STEPS.RESET);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }
    if (newPass.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    await resetPassword({
      email,
      newPassword: newPass
    }); setLoading(false);
    setStep(STEPS.DONE);
    setTimeout(() => {
      navigate('/');
      window.dispatchEvent(new Event('openLogin'));
    }, 2000);
  };

  const stepIndex = { [STEPS.EMAIL]: 1, [STEPS.OTP]: 2, [STEPS.RESET]: 3, [STEPS.DONE]: 3 };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f3fb] px-5 py-8 pt-[80px]">
      <div className="w-full max-w-[440px]">

        {/* Back to login */}
        <Link
          to="/"
          onClick={() => window.dispatchEvent(new Event('openLogin'))}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-400 hover:text-violet-600 transition mb-6"
        >
          <FaArrowLeft className="text-[10px]" /> Back to Login
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Gradient bar */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5, #2563eb)' }} />

          <div className="p-8">
            {/* Logo + Title */}
            <div className="flex flex-col items-center mb-7">
              <div className="w-12 h-12 rounded-xl icon-purple flex items-center justify-center text-white text-lg shadow-sm mb-4">
                <FaCar />
              </div>

              {step !== STEPS.DONE && (
                <>
                  <h1 className="text-[20px] font-extrabold text-gray-900 text-center tracking-tight">
                    {step === STEPS.EMAIL && 'Forgot your password?'}
                    {step === STEPS.OTP && 'Check your inbox'}
                    {step === STEPS.RESET && 'Set a new password'}
                  </h1>
                  <p className="text-[12px] text-gray-400 mt-1 text-center">
                    {step === STEPS.EMAIL && "No worries! Enter your email and we'll send a code."}
                    {step === STEPS.OTP && `We sent a 6-digit code to ${email}`}
                    {step === STEPS.RESET && 'Choose a strong password you haven\'t used before.'}
                  </p>
                </>
              )}
            </div>

            {/* Step indicator */}
            {step !== STEPS.DONE && (
              <div className="flex items-center gap-2 mb-7">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex-1 flex items-center gap-2">
                    <div
                      className="flex-1 h-1 rounded-full transition-all duration-500"
                      style={{ background: n <= stepIndex[step] ? 'linear-gradient(90deg,#7c3aed,#2563eb)' : '#e5e7eb' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="mb-5 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[12px] text-center">
                {error}
              </div>
            )}

            {/* ── Step 1: Email ── */}
            {step === STEPS.EMAIL && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Email address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 text-[11px]" />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" required
                      className="input-field input-field-icon" id="forgot-email"
                    />
                  </div>
                </div>
                <button
                  type="submit" disabled={loading} id="forgot-send"
                  className="w-full btn-primary py-3.5 text-[14px] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending code…</>
                  ) : 'Send Reset Code →'}
                </button>
              </form>
            )}

            {/* ── Step 2: OTP ── */}
            {step === STEPS.OTP && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-3 text-center">
                    Enter 6-digit code
                  </label>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, i)}
                        onKeyDown={(e) => handleOtpKeyDown(e, i)}
                        id={`otp-${i}`}
                        className="w-11 h-12 text-center text-[18px] font-bold rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition"
                        style={digit ? { borderColor: '#7c3aed', background: '#faf5ff' } : {}}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit" disabled={loading} id="forgot-verify"
                  className="w-full btn-primary py-3.5 text-[14px] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying…</>
                  ) : 'Verify Code →'}
                </button>

                <p className="text-center text-[12px] text-gray-400">
                  Didn't get a code?{' '}
                  {resendTimer > 0 ? (
                    <span className="text-gray-400">Resend in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setResendTimer(30); }}
                      className="text-violet-600 font-bold hover:text-violet-800 transition"
                    >
                      Resend
                    </button>
                  )}
                </p>
              </form>
            )}

            {/* ── Step 3: Reset Password ── */}
            {step === STEPS.RESET && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">New Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 text-[11px]" />
                    <input
                      type={showPass ? 'text' : 'password'} value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="••••••••" required
                      className="input-field input-field-icon pr-10" id="reset-password"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-[11px]"
                    >
                      {showPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 text-[11px]" />
                    <input
                      type="password" value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="••••••••" required
                      className="input-field input-field-icon" id="reset-confirm"
                    />
                  </div>
                  {confirmPass && newPass !== confirmPass && (
                    <p className="text-[11px] text-red-500 mt-1">Passwords don't match</p>
                  )}
                </div>

                <button
                  type="submit" disabled={loading} id="reset-submit"
                  className="w-full btn-primary py-3.5 text-[14px] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting…</>
                  ) : 'Reset Password →'}
                </button>
              </form>
            )}

            {/* ── Done ── */}
            {step === STEPS.DONE && (
              <div className="flex flex-col items-center justify-center py-8 gap-3 animate-fade-up">
                <FaCheckCircle className="text-emerald-500 text-5xl" />
                <p className="text-[18px] font-extrabold text-gray-900">Password Reset!</p>
                <p className="text-[13px] text-gray-400 text-center">
                  Your password has been updated successfully.<br />Redirecting you to login…
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-[12px] text-gray-400">
          Remember your password?{' '}
          <Link to="/" onClick={() => window.dispatchEvent(new Event('openLogin'))}
            className="text-violet-600 hover:text-violet-800 font-bold transition">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
