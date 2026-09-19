import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Copy, 
  Check, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  ArrowRight, 
  Package, 
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import API from '../api/axios';
import { useSettings } from '../context/SettingsContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { formatPrice, formatDateTime } from '../utils/helpers';

export default function OrderPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form fields
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch Order
  const fetchOrder = async () => {
    try {
      const res = await API.get(`/bookings/${id}`);
      setBooking(res.data.booking);
      if (res.data.booking?.upiTransactionId) {
        setUpiTransactionId(res.data.booking.upiTransactionId);
      }
      if (res.data.booking?.paymentScreenshot) {
        setScreenshotUrl(res.data.booking.paymentScreenshot);
      }
    } catch (error) {
      toast.error('Order not found.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const advanceAmount = booking?.advanceAmount || settings.advanceAmount || 200;
  const upiId = settings.upiId || '7067586097-2@axl';
  const businessName = settings.businessName || 'Rathore Electronics';

  // Standard UPI URI for scanning & app intents
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(businessName)}&am=${advanceAmount}&cu=INR&tn=${encodeURIComponent(`Advance payment for Order ${booking?.bookingId || ''}`)}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await API.post('/upload/payment-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setScreenshotUrl(res.data.url);
      toast.success('Screenshot uploaded successfully!');
    } catch (error) {
      // Fallback: Read as data URL if Cloudinary is not configured in dev
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result);
        toast.success('Screenshot attached (preview).');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!upiTransactionId || !upiTransactionId.trim()) {
      toast.error('Please enter the UPI Transaction ID / UTR number');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post(`/bookings/${id}/payment`, {
        upiTransactionId: upiTransactionId.trim(),
        paymentScreenshot: screenshotUrl
      });

      setBooking(res.data.booking);
      toast.success('Payment details submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit payment details');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!booking) return null;

  const totalAmount = booking.totalAmount || 0;
  const remainingAmount = booking.remainingAmount !== undefined ? booking.remainingAmount : Math.max(0, totalAmount - advanceAmount);

  // Status checks
  const isVerified = booking.paymentStatus === 'verified' || booking.orderStatus === 'confirmed';
  const isPendingVerification = booking.paymentStatus === 'pending_verification' && !isVerified;
  const isRejected = booking.paymentStatus === 'rejected';

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link to="/dashboard" className="hover:text-primary-600">My Dashboard</Link>
              <span>/</span>
              <span className="text-gray-900 font-semibold font-mono">{booking.bookingId}</span>
              <span>/</span>
              <span className="text-primary-600 font-medium">₹{advanceAmount} Advance Payment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {isVerified ? 'Order Confirmed' : `₹${advanceAmount} Advance Payment`}
            </h1>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-gray-500 block">Order Reference</span>
            <span className="font-mono font-bold text-base sm:text-lg text-primary-600 bg-primary-50 px-3 py-1 rounded-xl border border-primary-100 inline-block">
              {booking.bookingId}
            </span>
          </div>
        </div>

        {/* 1. STATE: PAYMENT VERIFIED (ORDER CONFIRMED) */}
        {isVerified && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-8 sm:p-10 border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 shadow-xl rounded-3xl text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md ring-8 ring-emerald-50">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-3">
                <ShieldCheck className="w-4 h-4" /> Advance Payment Verified
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">
                Order Confirmed!
              </h2>
              
              <p className="text-base sm:text-lg text-gray-700 max-w-xl mx-auto leading-relaxed mb-8">
                Your <strong className="text-emerald-700 font-bold">₹{advanceAmount} advance payment</strong> has been verified and your order has been confirmed by {businessName}.
              </p>

              {/* Amount Breakdown Card */}
              <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm text-left mb-8 space-y-3">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Total Order Amount:</span>
                  <span className="font-bold text-gray-900 text-base">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-emerald-700">
                  <span>Advance Amount Paid (UPI):</span>
                  <span className="font-bold text-emerald-700 text-base">− {formatPrice(advanceAmount)}</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <span className="text-base font-extrabold text-gray-900 block">Remaining Amount</span>
                    <span className="text-xs text-gray-500">Payable at the time of delivery</span>
                  </div>
                  <span className="text-2xl font-black text-primary-600">{formatPrice(remainingAmount)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center max-w-xl mx-auto">
                <Button 
                  size="lg" 
                  className="flex-1 min-w-[180px] bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/20"
                  onClick={() => navigate(`/dashboard/bookings/${booking._id}`)}
                >
                  <Package className="w-4 h-4 mr-2" /> View Order Details
                </Button>

                <Button 
                  size="lg" 
                  variant="outline" 
                  className="flex-1 min-w-[180px] rounded-2xl font-bold border-gray-300 hover:bg-gray-50"
                  onClick={() => navigate('/products')}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" /> Continue Shopping
                </Button>

                <a 
                  href={`https://wa.me/91${settings.whatsappNumber || '8435930113'}?text=${encodeURIComponent(`Hello ${businessName}, my Order #${booking.bookingId} is confirmed. When will it be dispatched?`)}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition-all text-sm"
                >
                  <MessageSquare className="w-4 h-4" /> Contact Shop on WhatsApp
                </a>
              </div>
            </Card>
          </div>
        )}

        {/* 2. STATE: AWAITING PAYMENT OR PENDING VERIFICATION OR REJECTED */}
        {!isVerified && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: QR Code & Payment Information (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Notice Banner if Pending Verification */}
              {isPendingVerification && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm flex items-start gap-3.5 animate-slide-up">
                  <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-extrabold text-base text-amber-900">Payment Verification in Progress</h3>
                    <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                      Payment details submitted successfully. Your payment is currently being verified by the shop admin. Once confirmed, your order status will automatically update to <strong>Confirmed</strong>.
                    </p>
                    {booking.upiTransactionId && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-lg border border-amber-200 text-xs font-mono font-bold text-amber-950">
                        <span>Submitted UTR:</span>
                        <span className="text-primary-700">{booking.upiTransactionId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Alert */}
              {isRejected && (
                <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-900 shadow-sm flex items-start gap-3.5 animate-shake">
                  <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-extrabold text-base text-red-900">Payment Verification Unsuccessful</h3>
                    <p className="text-sm text-red-800 mt-1 leading-relaxed">
                      {booking.rejectionReason || 'The shop was unable to verify the transaction ID. Please check your bank / UPI app and submit the correct UTR / Transaction ID below.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Main ₹200 Payment Instructions Card */}
              <Card className="p-6 sm:p-8 border border-gray-200/80 shadow-md rounded-3xl bg-white">
                <div className="border-b border-gray-100 pb-6 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-primary-100 text-primary-800 uppercase tracking-wider mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Mandatory Advance
                  </span>
                  <h2 className="text-2xl font-black text-gray-900">
                    ₹{advanceAmount} Advance Payment Required
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    To confirm your order, please pay <strong>₹{advanceAmount} advance</strong> using UPI. The remaining balance of <strong>{formatPrice(remainingAmount)}</strong> is payable upon delivery.
                  </p>
                </div>

                {/* QR Code Presentation Box */}
                <div className="bg-gradient-to-b from-gray-50 to-indigo-50/40 rounded-3xl p-6 sm:p-8 border border-indigo-100 text-center mb-6">
                  <div className="inline-block p-4 bg-white rounded-3xl shadow-xl border border-gray-100 ring-8 ring-indigo-50/70 mb-4">
                    <img 
                      src={settings.upiQrImage || '/phonepe-qr.png'} 
                      alt="PhonePe UPI QR Code - Rathore Electronic and Electrical" 
                      className="w-56 h-auto sm:w-64 object-contain rounded-2xl mx-auto shadow-sm"
                    />
                  </div>

                  <div className="mt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Scan with any UPI App
                    </span>
                    <div className="flex items-center justify-center gap-3 text-xs font-bold text-gray-600">
                      <span className="px-2.5 py-1 bg-white rounded-lg shadow-sm border">Google Pay</span>
                      <span className="px-2.5 py-1 bg-white rounded-lg shadow-sm border">PhonePe</span>
                      <span className="px-2.5 py-1 bg-white rounded-lg shadow-sm border">Paytm</span>
                      <span className="px-2.5 py-1 bg-white rounded-lg shadow-sm border">BHIM</span>
                    </div>
                  </div>

                  {/* UPI ID Copy Bar */}
                  <div className="mt-6 max-w-sm mx-auto bg-white rounded-2xl p-2 pl-4 border border-gray-200 flex items-center justify-between shadow-sm">
                    <div className="text-left overflow-hidden">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">UPI ID</span>
                      <span className="font-mono font-bold text-sm text-gray-900 truncate block">{upiId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUPI}
                      className="px-3.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Mobile Direct UPI Intent Link */}
                  <div className="mt-4 block sm:hidden">
                    <a
                      href={upiUri}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" /> Tap to Open UPI App (₹{advanceAmount})
                    </a>
                  </div>
                </div>

                {/* 6-Step Payment Instructions */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 text-left">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-primary-600" /> Simple Payment Steps
                  </h3>
                  <ol className="space-y-2 text-xs sm:text-sm text-gray-700 font-medium list-decimal list-inside leading-relaxed">
                    <li>Open <strong>GPay, PhonePe, Paytm</strong> or any UPI app.</li>
                    <li>Scan the QR code above or enter the UPI ID: <span className="font-mono font-bold text-primary-700">{upiId}</span>.</li>
                    <li>Pay exactly <strong className="text-gray-900 font-bold">₹{advanceAmount}</strong>.</li>
                    <li>Copy the <strong>UPI Transaction ID / 12-digit UTR number</strong> from your payment receipt.</li>
                    <li>Enter the transaction ID in the form on the right.</li>
                    <li>Click <strong>Submit Payment Details</strong>.</li>
                  </ol>
                </div>
              </Card>

              {/* Shop Support Help */}
              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block text-sm">Need help with payment?</span>
                    <span className="text-gray-500">Contact shop owner Mahendra Rathore directly</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={`tel:${settings.primaryPhone || '8435930113'}`} 
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-primary-600" /> Call
                  </a>
                  <a 
                    href={`https://wa.me/91${settings.whatsappNumber || '8435930113'}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                  </a>
                </div>
              </div>

            </div>

            {/* Right Column: Submission Form & Order Breakdown (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Submission Form Card */}
              <Card className="p-6 sm:p-8 border border-gray-200/80 shadow-md rounded-3xl bg-white sticky top-20">
                <h2 className="text-xl font-extrabold text-gray-900 mb-2">
                  Submit Payment Details
                </h2>
                <p className="text-xs text-gray-500 mb-6">
                  Enter your UPI Reference / UTR Number to enable admin verification.
                </p>

                <form onSubmit={handleSubmitPayment} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      UPI Transaction ID / UTR Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 423456789012 or UPI Ref No."
                      value={upiTransactionId}
                      onChange={(e) => setUpiTransactionId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm font-semibold text-gray-900 bg-gray-50 focus:bg-white"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Found in your GPay / PhonePe / Paytm transaction receipt under "UTR" or "UPI Ref ID".
                    </p>
                  </div>

                  {/* Optional Screenshot Upload */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Payment Screenshot (Optional)
                    </label>
                    
                    {screenshotUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 p-2 text-center">
                        <img 
                          src={screenshotUrl} 
                          alt="Screenshot Proof" 
                          className="max-h-40 mx-auto rounded-xl object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setScreenshotUrl('')}
                          className="mt-2 text-xs font-semibold text-red-600 hover:underline"
                        >
                          Remove / Change Screenshot
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-gray-300 hover:border-primary-400 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-50/50 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs font-semibold text-gray-700">Upload payment receipt / screenshot</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG up to 10MB</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleScreenshotUpload}
                          disabled={uploadingImage}
                        />
                      </label>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full py-3.5 text-base font-extrabold rounded-2xl shadow-lg shadow-primary-500/20 bg-primary-600 hover:bg-primary-700"
                    isLoading={submitting || uploadingImage}
                  >
                    {isPendingVerification ? 'Update Payment Details' : 'Submit Payment Details'}
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Admin manually verifies in bank before confirming</span>
                  </div>
                </form>

                {/* Price Breakdown Summary */}
                <div className="mt-8 pt-6 border-t border-gray-100 space-y-3 text-sm">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">
                    Order Payment Breakdown
                  </h3>
                  <div className="flex justify-between text-gray-600">
                    <span>Total Order Amount:</span>
                    <span className="font-bold text-gray-900">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Advance Payable Now:</span>
                    <span className="font-bold text-emerald-700">₹{advanceAmount}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-gray-900 block">Remaining Amount</span>
                      <span className="text-[11px] text-gray-500">Pay upon delivery</span>
                    </div>
                    <span className="text-xl font-black text-primary-600">{formatPrice(remainingAmount)}</span>
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-3">
                    Items in Order ({booking.items?.length || 0})
                  </span>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {booking.items?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img 
                            src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'} 
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover border bg-gray-100 shrink-0" 
                          />
                          <span className="font-semibold text-gray-900 line-clamp-1 max-w-[150px]">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-700">{formatPrice(item.price)} × {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </Card>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
