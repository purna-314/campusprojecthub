import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  KeyRound
} from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalTab, 
    setAuthModalTab, 
    pendingVerificationEmail, 
    devVerificationNotice,
    login, 
    register, 
    verifyEmail, 
    resendVerification,
    quickLogin
  } = useAuth();

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('student'); // 'student' | 'faculty' | 'admin'
  const [regRollNo, setRegRollNo] = useState('');
  const [regYear, setRegYear] = useState(1);
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering');
  const [regDesignation, setRegDesignation] = useState('');

  // Verification states
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot password states
  const [forgotStep, setForgotStep] = useState(1); // 1: request code, 2: reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Reset error when switching tabs
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
    if (authModalTab === 'verify' && devVerificationNotice?.code) {
      setOtpCode(devVerificationNotice.code);
    }
  }, [authModalTab, devVerificationNotice]);

  if (!isAuthModalOpen) return null;

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        rollNo: regRole === 'student' ? regRollNo : '',
        year: regRole === 'student' ? Number(regYear) : null,
        department: regDepartment,
        designation: regRole === 'faculty' ? (regDesignation || 'Assistant Professor') : ''
      });
      setSuccessMsg('Account registered! Verification code sent to your email.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verification
  const handleVerifySubmit = async (e) => {
    e?.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit code received in your email.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await verifyEmail({
        email: pendingVerificationEmail,
        code: otpCode.trim()
      });
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend Verification
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await resendVerification(pendingVerificationEmail);
      setSuccessMsg('A new verification code has been dispatched.');
      setResendCooldown(30);
      if (res.devCode) {
        setOtpCode(res.devCode);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Request
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(forgotEmail);
      setSuccessMsg(res.message || 'Reset code sent if email exists.');
      if (res.devCode) setForgotCode(res.devCode);
      setForgotStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await api.auth.resetPassword({
        email: forgotEmail,
        code: forgotCode,
        newPassword: forgotNewPassword
      });
      setSuccessMsg('Password updated successfully! You can now sign in.');
      setTimeout(() => {
        setLoginEmail(forgotEmail);
        setAuthModalTab('login');
        setForgotStep(1);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon & Close Button */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">Campus Project Hub</h2>
              <p className="text-xs text-blue-100 font-medium">User Authentication & Verified Access</p>
            </div>
          </div>
          <button 
            onClick={closeAuthModal}
            className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Visible when not in verify or forgot screen) */}
        {(authModalTab === 'login' || authModalTab === 'register') && (
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3">
            <button
              onClick={() => { setAuthModalTab('login'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold border-b-2 text-center transition-all ${
                authModalTab === 'login'
                  ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthModalTab('register'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold border-b-2 text-center transition-all ${
                authModalTab === 'register'
                  ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-red-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2.5 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ===================== TAB 1: SIGN IN ===================== */}
          {authModalTab === 'login' && (
            <div>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex.rivera@student.campus.edu"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginEmail);
                        setAuthModalTab('forgot');
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Login Shortcut */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
                  Or 1-Click Fast Login with Demo Accounts
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => quickLogin('student')}
                    className="p-2 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-xl text-center text-xs font-semibold text-blue-800 transition-all group"
                  >
                    <span className="block text-base mb-0.5">🎓</span>
                    <span>Alex Rivera</span>
                    <span className="block text-[10px] text-blue-500 font-normal">4th Year Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickLogin('faculty')}
                    className="p-2 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-xl text-center text-xs font-semibold text-indigo-800 transition-all group"
                  >
                    <span className="block text-base mb-0.5">👩‍🏫</span>
                    <span>Dr. Sarah Jenkins</span>
                    <span className="block text-[10px] text-indigo-500 font-normal">Faculty Guide</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickLogin('admin')}
                    className="p-2 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-xl text-center text-xs font-semibold text-purple-800 transition-all group"
                  >
                    <span className="block text-base mb-0.5">🏛️</span>
                    <span>Prof. Turing</span>
                    <span className="block text-[10px] text-purple-500 font-normal">HOD / Admin</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: REGISTER ===================== */}
          {authModalTab === 'register' && (
            <div>
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Role Selector Tabs */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setRegRole('student')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        regRole === 'student'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🎓 Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('faculty')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        regRole === 'faculty'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      👩‍🏫 Faculty Guide
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('admin')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        regRole === 'admin'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🏛️ Coordinator/HOD
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Lee"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    College / Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder={regRole === 'student' ? 'e.g. jordan.lee@student.campus.edu' : 'e.g. j.lee@campus.edu'}
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    * A 6-digit email verification code will be sent to this address.
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Create a strong password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role Specific Fields */}
                {regRole === 'student' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Academic Year
                      </label>
                      <select
                        value={regYear}
                        onChange={(e) => setRegYear(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value={1}>1st Year (Freshman)</option>
                        <option value={2}>2nd Year (Sophomore)</option>
                        <option value={3}>3rd Year (Junior)</option>
                        <option value={4}>4th Year (Senior)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 24CS109"
                        value={regRollNo}
                        onChange={(e) => setRegRollNo(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {regRole === 'faculty' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Academic Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Associate Professor / Project Mentor"
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                )}

                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Common Core / Engineering Sciences">Common Core / Engineering Sciences</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Register & Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ===================== TAB 3: VERIFY EMAIL ===================== */}
          {authModalTab === 'verify' && (
            <div className="text-center py-2">
              <div className="w-16 h-16 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">Verify Your Email Address</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                We sent a 6-digit confirmation code to{' '}
                <span className="font-semibold text-slate-800">{pendingVerificationEmail || 'your email'}</span>.
                Please enter it below to activate your account.
              </p>

              {/* Dev Mode Helper Callout */}
              {devVerificationNotice?.code && (
                <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold flex items-center space-x-1.5 text-amber-800">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Development Mode Active</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(devVerificationNotice.code)}
                      className="px-2 py-0.5 bg-amber-200 hover:bg-amber-300 font-bold rounded text-[11px] text-amber-900 transition-colors"
                    >
                      Auto-fill Code
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    Test OTP Code: <strong className="font-mono text-xs tracking-wider bg-white px-1.5 py-0.5 rounded border border-amber-300">{devVerificationNotice.code}</strong>
                  </p>
                  {devVerificationNotice.previewUrl && (
                    <a
                      href={devVerificationNotice.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 mt-1 text-[11px] text-blue-700 hover:underline font-semibold"
                    >
                      <span>View Generated Email in Ethereal Mailbox</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* 6-Digit OTP Input Form */}
              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="• • • • • •"
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtpCode(val);
                      if (val.length === 6) {
                        // Auto-submit when 6 digits are typed
                        verifyEmail({ email: pendingVerificationEmail, code: val })
                          .catch((err) => setErrorMsg(err.message));
                      }
                    }}
                    className="w-48 mx-auto text-center font-mono text-2xl font-bold tracking-[0.5em] py-3 bg-slate-50 border-2 border-slate-300 focus:border-blue-600 rounded-xl shadow-inner focus:outline-none transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Valid for 15 minutes.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Confirm & Activate Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Resend & Back controls */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setAuthModalTab('login')}
                  className="text-slate-500 hover:text-slate-800 font-medium"
                >
                  ← Back to Sign In
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || loading}
                  className={`font-semibold flex items-center space-x-1 ${
                    resendCooldown > 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0
                      ? `Resend Code in ${resendCooldown}s`
                      : 'Resend Verification Code'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ===================== TAB 4: FORGOT PASSWORD ===================== */}
          {authModalTab === 'forgot' && (
            <div>
              <div className="mb-4 text-center">
                <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Reset Your Password</h3>
                <p className="text-xs text-slate-500">
                  {forgotStep === 1 
                    ? 'Enter your registered email to receive a password reset code.' 
                    : 'Enter the verification code and your new password.'}
                </p>
              </div>

              {forgotStep === 1 ? (
                <form onSubmit={handleForgotRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. alex.rivera@student.campus.edu"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Send Reset Code</span>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      6-Digit Reset Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 543210"
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value)}
                      className="w-full px-3.5 py-2 font-mono text-center tracking-widest bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Enter new password (min 6 chars)"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Update Password</span>}
                  </button>
                </form>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => setAuthModalTab('login')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  ← Return to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
