import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import { validateEmail, validateIndianPhone, cleanPhone } from '../utils/validators';

export default function Register() {
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Popup Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState('otp'); // 'otp' | 'details'
  
  // OTP Step States
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [demoOtp, setDemoOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef([]);

  // Essential Data Step States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { register, sendEmailOtp, verifyEmailOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval = null;
    if (isModalOpen && modalStep === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isModalOpen, modalStep, timer]);

  // Step 1 Trigger: User enters email on the page and clicks "Continue with Email"
  const handleInitiateEmailRegister = async (e) => {
    e.preventDefault();
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      toast.error(emailCheck.message);
      return;
    }

    setEmailLoading(true);
    try {
      const data = await sendEmailOtp(emailCheck.email);
      setDemoOtp(data.otp || '123456');
      setOtp(['', '', '', '', '', '']);
      setTimer(30);
      setCanResend(false);
      setModalStep('otp');
      setIsModalOpen(true);
      toast.success(data.message || `Verification code sent to ${emailCheck.email}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setEmailLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || otpLoading) return;
    setOtpLoading(true);
    try {
      const data = await sendEmailOtp(email.trim().toLowerCase());
      setDemoOtp(data.otp || '123456');
      setTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      toast.success(data.message || `New code sent to ${email}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    } finally {
      setOtpLoading(false);
    }
  };

  // OTP Input Handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpInputRefs.current[index - 1]) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    if (otpInputRefs.current[nextIndex]) {
      otpInputRefs.current[nextIndex].focus();
    }
  };

  const handleAutoFillDemoOtp = () => {
    const code = demoOtp || '123456';
    const splitCode = code.split('').slice(0, 6);
    setOtp(splitCode);
    toast.success(`Filled verification code: ${code}`);
  };

  // Step 2: Verify OTP
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit verification code');
      return;
    }

    setOtpLoading(true);
    try {
      const data = await verifyEmailOtp(email.trim().toLowerCase(), code);
      toast.success(data.message || 'Email verified successfully!');
      // Advance to essential details form inside the modal
      setModalStep('details');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired verification code');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 3: Submit Essential Data (Name, Phone, Password)
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    const phoneCheck = validateIndianPhone(phone);
    if (!phoneCheck.isValid) {
      toast.error(phoneCheck.message);
      return;
    }

    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitLoading(true);
    try {
      const data = await register(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        phoneCheck.cleaned,
        false, // phone not yet SMS-verified
        true   // email verified!
      );

      toast.success(`Welcome to Rathore Electronics, ${data.user?.name || name.trim()}!`);
      setIsModalOpen(false);
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete registration');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 sm:p-9 shadow-2xl rounded-3xl border border-gray-100 bg-white relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary-100 rounded-full blur-2xl pointer-events-none opacity-60" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-100 rounded-full blur-2xl pointer-events-none opacity-60" />

        {/* Brand Header */}
        <div className="text-center mb-6 relative">
          <img
            src="/logo.jpg"
            alt="Rathore Electronics"
            className="mx-auto w-16 h-16 rounded-2xl object-cover mb-4 shadow-xl ring-4 ring-primary-50 bg-black"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" /> Fast & Secure Sign-Up
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Join Rathore Electronics
          </h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Sign up in seconds with Google or create an account with your email.
          </p>
        </div>

        {/* 1-Tap Google Button */}
        <div className="mb-4">
          <GoogleLoginButton redirectTo="/" />
        </div>

        {/* Clean Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-500 font-semibold tracking-wider">
              Or sign up with email
            </span>
          </div>
        </div>

        {/* Email Option Input Form */}
        <form onSubmit={handleInitiateEmailRegister} className="space-y-3.5">
          <Input
            label="Email Address"
            type="email"
            required
            autoComplete="email"
            leftIcon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gmail.com"
            helperText="We'll send a 6-digit verification code to confirm your email."
          />

          <Button
            type="submit"
            className="w-full text-sm font-bold py-2.5 cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            isLoading={emailLoading}
          >
            <span>Verify Email & Register</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Link to Login */}
        <div className="text-center pt-5 border-t border-gray-100 mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1">
              Sign In <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>

        {/* SSL Badge */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-bit End-to-End SSL Encrypted Security</span>
        </div>
      </Card>

      {/* Verification & Essential Details Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {modalStep === 'otp' ? (
              /* STEP 1 OF MODAL: VERIFY EMAIL OTP */
              <div>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-500/20">
                    <Mail className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    Verify Your Email
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    We sent a 6-digit verification code to <br />
                    <strong className="text-gray-900 font-bold">{email}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs text-primary-600 hover:underline mt-1 font-semibold cursor-pointer"
                  >
                    Change email address
                  </button>
                </div>

                {/* Demo OTP Helper Pill */}
                {demoOtp && (
                  <div 
                    onClick={handleAutoFillDemoOtp}
                    className="mb-5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition-colors"
                    title="Click to auto-fill verification code"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Code: <strong className="font-extrabold font-mono text-sm">{demoOtp}</strong></span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                      Auto-Fill ⚡
                    </span>
                  </div>
                )}

                {/* 6-Box OTP Input */}
                <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
                  <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl border transition-all ${
                          digit 
                            ? 'border-primary-500 bg-primary-50/20 ring-2 ring-primary-500/20 text-gray-900' 
                            : 'border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                        }`}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  {/* Resend Timer */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-gray-500">
                      {timer > 0 ? `Resend code in ${timer}s` : 'Did not receive code?'}
                    </span>
                    <button
                      type="button"
                      disabled={!canResend || otpLoading}
                      onClick={handleResendOtp}
                      className={`font-bold flex items-center gap-1 transition-colors ${
                        canResend && !otpLoading
                          ? 'text-primary-600 hover:text-primary-700 cursor-pointer'
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${otpLoading ? 'animate-spin' : ''}`} /> Resend Code
                    </button>
                  </div>

                  {/* Verify Button */}
                  <Button
                    type="submit"
                    className="w-full py-3 px-4 text-sm font-bold shadow-md hover:shadow-lg transition-all"
                    isLoading={otpLoading}
                    disabled={otp.join('').length !== 6}
                  >
                    Verify Email & Continue
                  </Button>
                </form>
              </div>
            ) : (
              /* STEP 2 OF MODAL: ESSENTIAL DATA (Name, Phone, Password) */
              <div>
                <div className="text-center mb-5">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                    Essential Account Details
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Almost there! Fill in your details to activate your account.
                  </p>
                </div>

                {/* Verified Email Banner */}
                <div className="mb-4 p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-emerald-900 truncate">{email}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Verified
                  </span>
                </div>

                {/* Essential Data Form */}
                <form onSubmit={handleCompleteRegistration} className="space-y-3.5">
                  <Input
                    label="Full Name *"
                    type="text"
                    required
                    leftIcon={User}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    autoFocus
                  />

                  <Input
                    label="Mobile Number (India) *"
                    type="tel"
                    required
                    leftIcon={Phone}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    helperText="10-digit Indian mobile number starting with 6, 7, 8, or 9"
                  />

                  <Input
                    label="Create Password *"
                    type={showPassword ? 'text' : 'password'}
                    required
                    leftIcon={Lock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
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

                  <Input
                    label="Confirm Password *"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    leftIcon={Lock}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded cursor-pointer"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full py-3 text-sm font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/35 transition-all"
                      isLoading={submitLoading}
                    >
                      Create Account & Sign In
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
