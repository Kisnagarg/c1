import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, Sparkles, X, ShieldCheck, User, CheckCircle2, AlertCircle } from 'lucide-react';
import API from '../../api/axios';
import { validateIndianPhone, validateEmail } from '../../utils/validators';
import PhoneOtpModal from './PhoneOtpModal';

export default function GoogleLoginButton({ onSuccess, redirectTo = '/' }) {
  const { googleLogin, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickGmailModal, setShowQuickGmailModal] = useState(false);
  const [showPhonePromptModal, setShowPhonePromptModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [missingPhone, setMissingPhone] = useState('');
  
  const [quickEmail, setQuickEmail] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const buttonContainerRef = useRef(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1010978833106-r5tb5u4a2eep732ll9nhubld0gtnmihc.apps.googleusercontent.com';

  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      toast.error('Google sign-in was cancelled or failed.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await googleLogin({ credential: response.credential });
      
      // If user profile has no phone number, prompt for mandatory phone number
      if (!data.user?.phone) {
        setPendingUser(data.user);
        setShowPhonePromptModal(true);
        return;
      }

      toast.success(data.message || 'Logged in with Google successfully!');
      if (onSuccess) {
        onSuccess(data);
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error(error.response?.data?.message || 'Failed to authenticate with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const missingPhoneValidation = useMemo(() => {
    if (!missingPhone) return { isValid: false, message: '' };
    return validateIndianPhone(missingPhone);
  }, [missingPhone]);

  const handleMissingPhoneVerified = async ({ phone }) => {
    setIsLoading(true);
    try {
      const res = await API.put('/auth/profile', { 
        phone, 
        isPhoneVerified: true 
      });
      updateUser(res.data.user);
      toast.success('Mobile number verified & account ready!');
      setShowPhonePromptModal(false);
      setShowOtpModal(false);
      if (onSuccess) {
        onSuccess({ user: res.data.user });
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save phone number');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMissingPhone = async (e) => {
    e.preventDefault();
    const phoneCheck = validateIndianPhone(missingPhone);
    if (!phoneCheck.isValid) {
      toast.error(phoneCheck.message);
      return;
    }

    setShowOtpModal(true);
  };

  useEffect(() => {
    if (!googleClientId) return;

    const initGsi = () => {
      if (window.google?.accounts?.id && buttonContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          window.google.accounts.id.renderButton(
            buttonContainerRef.current,
            {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: buttonContainerRef.current.offsetWidth || 340
            }
          );
        } catch (e) {
          console.warn('Google Identity Services init warning:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const timer = setTimeout(initGsi, 500);
      return () => clearTimeout(timer);
    }
  }, [googleClientId]);

  const handleCustomGoogleClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
        return;
      } catch (e) {
        console.warn('Prompt error:', e);
      }
    }

    setShowQuickGmailModal(true);
  };

  const handleQuickGmailSubmit = async (e) => {
    e.preventDefault();
    const emailCheck = validateEmail(quickEmail);
    if (!emailCheck.isValid) {
      toast.error(emailCheck.message);
      return;
    }

    const phoneCheck = validateIndianPhone(quickPhone);
    if (!phoneCheck.isValid) {
      toast.error(phoneCheck.message);
      return;
    }

    setIsLoading(true);
    try {
      const emailLower = emailCheck.email;
      const derivedName = quickName.trim() || emailLower.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const randomAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(derivedName)}&backgroundColor=0284c7,6366f1,ec4899`;

      const data = await googleLogin({
        email: emailLower,
        name: derivedName,
        phone: phoneCheck.cleaned,
        picture: randomAvatar,
        googleId: `google_demo_${Date.now()}`
      });

      toast.success(data.message || `Welcome, ${data.user?.name}!`);
      setShowQuickGmailModal(false);
      if (onSuccess) {
        onSuccess(data);
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sign in with Gmail');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Official Google Button Mount point when client ID is provided */}
      {googleClientId && (
        <div ref={buttonContainerRef} className="w-full flex justify-center mb-3 min-h-[44px]" />
      )}

      {/* Styled Google / Gmail Login Button */}
      {(!googleClientId || !window.google?.accounts?.id) && (
        <button
          type="button"
          onClick={handleCustomGoogleClick}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-300 shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span className="text-sm font-semibold">Continue with Google / Gmail</span>
        </button>
      )}

      {/* Quick Gmail Sign-In Dialog (Instant SSO) */}
      {showQuickGmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setShowQuickGmailModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Sign in with Gmail</h3>
              <p className="text-xs text-gray-500 mt-1">
                Enter your Gmail and contact number for instant account setup.
              </p>
            </div>

            <form onSubmit={handleQuickGmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Gmail / Google Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={quickEmail}
                    onChange={(e) => setQuickEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Phone Number * (Mandatory)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Required for booking delivery updates & order tracking</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  Instant secure sign-in with verified profile creation.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickGmailModal(false)}
                  className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Sign In Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory Phone Prompt Modal for Google OAuth */}
      {showPhonePromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Phone Number Required</h3>
              <p className="text-xs text-gray-500 mt-1">
                Welcome, {pendingUser?.name}! Please enter your contact phone number to complete your account setup.
              </p>
            </div>

            <form onSubmit={handleSaveMissingPhone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>10-Digit Mobile Number *</span>
                  {missingPhone && missingPhoneValidation.isValid && (
                    <span className="text-emerald-600 text-[11px] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Valid mobile number
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 8435930113"
                    value={missingPhone}
                    onChange={(e) => setMissingPhone(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 border font-medium ${
                      missingPhone && !missingPhoneValidation.isValid
                        ? 'border-red-300 bg-red-50/40 focus:ring-red-500 focus:bg-white'
                        : missingPhone && missingPhoneValidation.isValid
                        ? 'border-emerald-300 bg-emerald-50/30 focus:ring-emerald-500 focus:bg-white'
                        : 'border-gray-200 bg-gray-50 focus:ring-primary-500 focus:bg-white'
                    }`}
                    autoFocus
                  />
                </div>
                {missingPhone && !missingPhoneValidation.isValid ? (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {missingPhoneValidation.message}
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-500 mt-1">
                    Mandatory for booking delivery updates & ₹200 advance payment tracking
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || (missingPhone && !missingPhoneValidation.isValid)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Verify Phone via SMS OTP
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phone OTP Verification Modal for Google Auth */}
      <PhoneOtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        phone={missingPhone}
        onVerified={handleMissingPhoneVerified}
      />
    </div>
  );
}

