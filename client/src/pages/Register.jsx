import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ShoppingBag, Eye, EyeOff, Lock, Mail, User, Phone, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calculate Password Strength
  const passwordStrength = useMemo(() => {
    const p = formData.password;
    if (!p) return { score: 0, label: '', color: 'bg-gray-200' };

    let score = 0;
    if (p.length >= 6) score += 1;
    if (p.length >= 8) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;

    if (score <= 2) return { score: 25, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' };
    if (score === 3) return { score: 50, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-500' };
    if (score === 4) return { score: 75, label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
  }, [formData.password]);

  const passwordsMatch = formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all mandatory fields');
      return;
    }

    if (formData.phone.trim().length < 10) {
      toast.error('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      toast.error('Please accept the Terms and Privacy Policy to continue');
      return;
    }

    setLoading(true);
    try {
      const data = await register(formData.name, formData.email, formData.password, formData.phone);
      toast.success(data.message || 'Account created successfully!');
      navigate('/');
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(err.msg));
      } else {
        toast.error(error.response?.data?.message || 'Failed to register');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100/80 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 shadow-2xl rounded-2xl border border-gray-100 bg-white">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20 ring-4 ring-primary-50">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Rathore Electronics for fast bookings & order tracking
          </p>
        </div>

        {/* Google / Gmail Single Sign On */}
        <div className="mb-6">
          <GoogleLoginButton redirectTo="/" />
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400 font-medium">Or register with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            name="name"
            type="text"
            required
            leftIcon={User}
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Rahul Rathore"
          />

          <Input
            label="Email address *"
            name="email"
            type="email"
            required
            autoComplete="email"
            leftIcon={Mail}
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
          />

          <Input
            label="Phone Number *"
            name="phone"
            type="tel"
            required
            leftIcon={Phone}
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            helperText="Required for delivery coordination & order tracking"
          />


          <div>
            <Input
              label="Create Password *"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              leftIcon={Lock}
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Password strength</span>
                  <span className={`font-bold ${passwordStrength.textColor}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <Input
              label="Confirm Password *"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              leftIcon={Lock}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-type password"
              error={passwordsMismatch ? 'Passwords do not match' : null}
              rightElement={
                <div className="flex items-center gap-1">
                  {passwordsMatch && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              }
            />
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                I agree to the{' '}
                <span className="text-primary-600 font-semibold hover:underline">Terms of Service</span> and{' '}
                <span className="text-primary-600 font-semibold hover:underline">Privacy Policy</span>.
              </span>
            </label>
          </div>

          <Button type="submit" className="w-full text-base font-semibold py-3 mt-2 cursor-pointer shadow-md hover:shadow-lg transition-all" size="lg" isLoading={loading}>
            Create My Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Your data is protected with 256-bit SSL encryption</span>
        </div>
      </Card>
    </div>
  );
}


