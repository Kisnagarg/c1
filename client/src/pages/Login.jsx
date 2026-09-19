import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ShoppingBag, Eye, EyeOff, Lock, Mail, ShieldCheck, KeyRound, Sparkles, X, UserCheck } from 'lucide-react';
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
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
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
    <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100/80 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 shadow-2xl rounded-2xl border border-gray-100 bg-white">
        <div className="text-center mb-8">
          <img
            src="/logo.jpg"
            alt="Rathore Electronics"
            className="mx-auto w-16 h-16 rounded-2xl object-cover mb-4 shadow-xl ring-4 ring-primary-50 bg-black"
          />
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your orders and account
          </p>
        </div>

        {/* 1-Click Fast Demo Switcher */}
        <div className="mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" /> Quick Demo Fill
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillCredentials('admin@rathoreelectronics.com', 'admin123')}
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              👑 Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials('rohit@example.com', 'password123')}
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              🛍️ Customer Demo
            </button>
          </div>
        </div>

        {/* Google / Gmail Single Sign On */}
        <div className="mb-6">
          <GoogleLoginButton redirectTo={from} />
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400 font-medium">Or continue with password</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address or Mobile Number"
            type="text"
            required
            autoComplete="username"
            leftIcon={UserCheck}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. name@gmail.com or 8435930113"
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
                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
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

          <Button type="submit" className="w-full text-base font-semibold py-3 cursor-pointer shadow-md hover:shadow-lg transition-all" size="lg" isLoading={loading}>
            Sign In to Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
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
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {resetStep === 1 ? 'Reset Your Password' : 'Set New Password'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {resetStep === 1 
                  ? 'Enter your registered email address to receive reset instructions.'
                  : 'Enter the verification code and your new password.'}
              </p>
            </div>

            {resetStep === 1 ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <Input
                  label="Registered Email Address"
                  type="email"
                  required
                  leftIcon={Mail}
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  autoFocus
                />

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    isLoading={forgotLoading}
                    className="flex-1 py-2.5 px-4 cursor-pointer"
                  >
                    Send Reset Code
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <Input
                  label="Verification Code"
                  type="text"
                  required
                  placeholder="6-digit code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                />

                <Input
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 6 characters"
                  leftIcon={Lock}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <Button
                    type="submit"
                    isLoading={forgotLoading}
                    className="flex-1 py-2.5 px-4 cursor-pointer"
                  >
                    Save New Password
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


