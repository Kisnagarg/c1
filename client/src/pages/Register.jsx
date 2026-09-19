import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ShoppingBag, 
  Clock, 
  ArrowRight,
  Lock
} from 'lucide-react';
import Card from '../components/ui/Card';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';

export default function Register() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 sm:p-9 shadow-2xl rounded-3xl border border-gray-100 bg-white relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary-100 rounded-full blur-2xl pointer-events-none opacity-60" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-100 rounded-full blur-2xl pointer-events-none opacity-60" />

        {/* Brand Header */}
        <div className="text-center mb-8 relative">
          <img
            src="/logo.jpg"
            alt="Rathore Electronics"
            className="mx-auto w-16 h-16 rounded-2xl object-cover mb-4 shadow-xl ring-4 ring-primary-50 bg-black"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" /> Instant 1-Click Signup
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Join Rathore Electronics
          </h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Sign up in 1 second with your Google account. Zero passwords to remember.
          </p>
        </div>

        {/* 1-Tap Google Button */}
        <div className="mb-6">
          <GoogleLoginButton redirectTo="/" />
        </div>

        {/* Feature Benefits List */}
        <div className="space-y-3 p-4 bg-gray-50/80 rounded-2xl border border-gray-100 my-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-700 font-medium">
              <strong className="text-gray-900">Instant Access:</strong> No long forms, OTPs, or password setups.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-700 font-medium">
              <strong className="text-gray-900">₹200 Advance Booking:</strong> Book any electrical appliance or drone service instantly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-700 font-medium">
              <strong className="text-gray-900">Live Order Tracking:</strong> Track delivery & repair status anytime in your dashboard.
            </p>
          </div>
        </div>

        {/* Delivery Phone & Address Notice */}
        <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl mb-6 text-center">
          <p className="text-xs text-amber-800">
            📍 Your delivery mobile number & address will be collected automatically when you place your first order.
          </p>
        </div>

        {/* Link to Login */}
        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Already have an account or Staff login?{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1">
              Sign In <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>

        {/* SSL Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-bit End-to-End SSL Encrypted Security</span>
        </div>
      </Card>
    </div>
  );
}
