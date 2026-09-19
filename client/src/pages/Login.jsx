import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  X, 
  UserCheck, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showStaffLogin, setShowStaffLogin] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: enter email, 2: enter code & new password
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  useEffect(() => {
    const savedEmail = localStorage.getItem('rathore_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in both email and password');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      if (rememberMe) {
        localStorage.setItem('rathore_remembered_email', email);
      } else {
        localStorage.removeItem('rathore_remembered_email');
      }
      toast.success(data.message || `Welcome back, ${data.user?.name}!`);
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setShowStaffLogin(true);
    toast.success(`Filled ${demoEmail} credentials!`);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email');
      return;
    }

    setForgotLoading(true);
    try {
      const data = await forgotPassword(forgotEmail);
      toast.success(data.message || 'Reset instructions provided');
      if (data.resetCode) {
        setResetCode(data.resetCode);
      }
      setResetStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request reset');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setForgotLoading(true);
    try {
      const data = await resetPassword(forgotEmail, resetCode, newPassword);
      toast.success(data.message || 'Password reset successfully!');
      setPassword(newPassword);
      setEmail(forgotEmail);
      setShowForgotModal(false);
      setResetStep(1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 sm:p-9 shadow-2xl rounded-3xl border border-gray-100 bg-white relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary-100 rounded-full blur-2xl pointer-events-none opacity-60" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-100 rounded-full blur-2xl pointer-events-none opacity-60" />

        <div className="text-center mb-8 relative">
          <img
            src="/logo.jpg"
            alt="Rathore Electronics"
            className="mx-auto w-16 h-16 rounded-2xl object-cover mb-4 shadow-xl ring-4 ring-primary-50 bg-black"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full mb-2">
            <Zap className="w-3.5 h-3.5 text-primary-600" /> Fast & Secure Sign-In
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Sign in to track orders, manage bookings & book electrical services
          </p>
        </div>

        {/* Primary Action: Google 1-Tap Login */}
        <div className="mb-6">
          <GoogleLoginButton redirectTo={from} />
        </div>

        {/* 1-Click Trust Highlights */}
        <div className="p-3.5 bg-gray-50/90 rounded-2xl border border-gray-100 mb-6 text-center">
          <p className="text-xs text-gray-600 font-medium">
            ⚡ <strong>1-Click Google Access:</strong> Instant sign-in with no passwords to remember.
          </p>
        </div>

        {/* Staff & Admin Login Toggle */}
        <div className="border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={() => setShowStaffLogin(!showStaffLogin)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-gray-400" />
              Staff / Admin Password Login
            </span>
            {showStaffLogin ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showStaffLogin && (
            <div className="mt-4 pt-3 border-t border-dashed border-gray-200 animate-fade-in space-y-4">
              {/* Quick Demo Switcher */}
              <div className="p-2.5 bg-primary-50/50 rounded-xl border border-primary-100/60">
                <p className="text-[11px] font-bold text-primary-900 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary-600" /> 1-Click Demo Fill
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFillCredentials('admin@rathoreelectronics.com', 'admin123')}
                    className="px-2 py-1.5 bg-white border border-primary-200 rounded-lg text-xs font-bold text-primary-700 hover:bg-primary-50 transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    👑 Admin Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillCredentials('rohit@example.com', 'password123')}
                    className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    🛍️ Customer Demo
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  label="Staff Email or Username"
                  type="text"
                  required
                  autoComplete="username"
                  leftIcon={UserCheck}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@rathoreelectronics.com"
                />

                <div>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    leftIcon={Lock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                </div>

                <div className="flex items-center justify-between text-sm pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
                    />
                    <span className="text-xs text-gray-600 font-medium">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full text-sm font-bold py-2.5 cursor-pointer shadow-md hover:shadow-lg transition-all" size="md" isLoading={loading}>
                  Sign In with Password
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Register CTA */}
        <div className="mt-6 text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            New customer?{' '}
            <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1">
              Create account with Google <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-bit End-to-End SSL Encrypted Security</span>
        </div>
      </Card>

      {/* Forgot / Reset Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setResetStep(1);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {resetStep === 1 ? 'Reset Your Password' : 'Enter Reset Code'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {resetStep === 1 
                  ? 'Enter your registered email address to receive password reset instructions.' 
                  : `Enter the 6-digit code sent for ${forgotEmail}`}
              </p>
            </div>

            {resetStep === 1 ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  leftIcon={Mail}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@rathoreelectronics.com"
                  autoFocus
                />

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 cursor-pointer"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 cursor-pointer"
                    isLoading={forgotLoading}
                  >
                    Send Instructions
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <Input
                  label="Reset Code"
                  type="text"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="e.g. 123456"
                  autoFocus
                />

                <Input
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  leftIcon={Lock}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 cursor-pointer"
                    onClick={() => setResetStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 cursor-pointer"
                    isLoading={forgotLoading}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
