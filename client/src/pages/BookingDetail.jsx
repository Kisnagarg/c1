import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Package, 
  AlertCircle, 
  Calendar, 
  Phone, 
  MessageSquare, 
  MapPin, 
  ShieldCheck, 
  ExternalLink,
  QrCode,
  ShoppingBag
} from 'lucide-react';
import API from '../api/axios';
import { useSettings } from '../context/SettingsContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { 
  formatPrice, 
  formatDateTime, 
  getOrderStatusLabel, 
  getPaymentStatusLabel, 
  getStatusColor, 
  getPaymentStatusColor 
} from '../utils/helpers';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/bookings/${id}`)
      .then(res => setBooking(res.data.booking))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!booking) return null;

  const totalAmount = booking.totalAmount || 0;
  const advanceAmount = booking.advanceAmount || settings?.advanceAmount || 200;
  const remainingAmount = booking.remainingAmount !== undefined ? booking.remainingAmount : Math.max(0, totalAmount - advanceAmount);

  const isVerified = booking.paymentStatus === 'verified' || booking.orderStatus === 'confirmed';
  const isPendingVerification = booking.paymentStatus === 'pending_verification';
  const isAwaitingAdvance = booking.orderStatus === 'awaiting_advance' || booking.paymentStatus === 'awaiting_payment';
  const isRejected = booking.paymentStatus === 'rejected';

  const primaryPhone = settings.primaryPhone || '8435930113';
  const whatsappNumber = settings.whatsappNumber || '8435930113';
  const businessName = settings.businessName || 'Rathore Electronics';

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Order Reference</span>
              <span className="font-mono bg-primary-50 text-primary-700 font-bold px-2.5 py-0.5 rounded-lg text-sm border border-primary-100">
                {booking.bookingId}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              {isVerified ? 'Order Confirmed' : 'Order Details'}
            </h1>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Placed on {formatDateTime(booking.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(booking.orderStatus || booking.status)}`}>
              {getOrderStatusLabel(booking.orderStatus || booking.status)}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getPaymentStatusColor(booking.paymentStatus)}`}>
              Payment: {getPaymentStatusLabel(booking.paymentStatus)}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Post-Verification Confirmed Card */}
          {isVerified && (
            <Card className="p-6 sm:p-8 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 border-2 border-emerald-500/30 shadow-md rounded-3xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 mb-1">Order Confirmed!</h2>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Your <strong>₹{advanceAmount} advance payment</strong> has been verified by the shop and your order is confirmed for processing & dispatch.
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link to="/products">
                      <Button size="sm" variant="outline" className="rounded-xl font-bold bg-white">
                        <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Continue Shopping
                      </Button>
                    </Link>
                    <a
                      href={`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(`Hello ${businessName}, I have a query about my confirmed Order #${booking.bookingId}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Contact Shop
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Pending Verification Notice */}
          {isPendingVerification && (
            <Card className="p-6 bg-amber-50/80 border border-amber-200 shadow-sm rounded-3xl">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-amber-950 mb-1">Advance Payment Awaiting Verification</h3>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    You have submitted UPI Reference ID: <strong className="font-mono text-primary-800">{booking.upiTransactionId || 'Submitted'}</strong>. The shop administrator is verifying the credit in the bank account.
                  </p>
                  <div className="mt-3">
                    <Link to={`/orders/${booking._id}/payment`} className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 hover:underline">
                      <QrCode className="w-3.5 h-3.5" /> View Payment Status / QR Page
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Awaiting Advance Payment Action Banner */}
          {(isAwaitingAdvance || isRejected) && (
            <Card className="p-6 bg-gradient-to-r from-primary-900 to-indigo-950 text-white rounded-3xl shadow-lg border-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-300 block mb-1">
                    Action Required
                  </span>
                  <h3 className="text-lg font-black text-white">
                    ₹{advanceAmount} Advance Payment Required
                  </h3>
                  <p className="text-xs text-gray-300 mt-1 max-w-md">
                    {isRejected 
                      ? 'Previous transaction ID could not be verified. Please submit correct UPI payment details to confirm.' 
                      : `To confirm this reservation, please submit ₹${advanceAmount} advance via UPI.`}
                  </p>
                </div>
                <Link to={`/orders/${booking._id}/payment`}>
                  <Button size="md" className="bg-white text-primary-900 hover:bg-gray-100 font-extrabold rounded-xl shadow-md whitespace-nowrap">
                    <QrCode className="w-4 h-4 mr-2 text-primary-600" /> Pay ₹{advanceAmount} Advance
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Ordered Products Card */}
          <Card className="rounded-3xl border border-gray-200/80 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600" /> Booked Products ({booking.items?.length || 0})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {booking.items?.map((item, index) => (
                <div key={index} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl p-2 shrink-0 border border-gray-100 flex items-center justify-center">
                    <img 
                      src={item.image || 'https://via.placeholder.com/150'} 
                      alt={item.name} 
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1">
                    <Link 
                      to={`/products/${item.product?.slug || ''}`} 
                      className="font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 mb-1"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Unit Price: {formatPrice(item.price)}</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="font-black text-gray-900 text-base sm:text-right">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Price & Advance Breakdown */}
            <div className="bg-gray-50/80 p-6 rounded-b-3xl border-t border-gray-100 space-y-3">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Total Order Amount</span>
                <span className="font-bold text-gray-900">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-emerald-700 font-medium">
                <span>Advance Amount ({isVerified ? 'Paid' : 'Required'})</span>
                <span className="font-bold">{isVerified ? '− ' : ''}{formatPrice(advanceAmount)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-base font-black">
                <div>
                  <span className="text-gray-900 block">Remaining Amount</span>
                  <span className="text-[11px] font-normal text-gray-500">Payable on Delivery</span>
                </div>
                <span className="text-primary-600 text-xl font-black">{formatPrice(remainingAmount)}</span>
              </div>
            </div>
          </Card>

          {/* Customer & Shop Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Info */}
            <Card className="p-6 rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-600" /> Delivery Details
              </h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div>
                  <span className="text-gray-400 block">Recipient Name</span>
                  <span className="font-bold text-gray-900 text-sm">{booking.customerName || booking.user?.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Contact Phone</span>
                  <span className="font-bold text-gray-900 text-sm">{booking.customerPhone || booking.user?.phone}</span>
                </div>
                {booking.shippingAddress && (
                  <div>
                    <span className="text-gray-400 block">Address</span>
                    <span className="font-medium text-gray-800">{booking.shippingAddress}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Shop Support Info */}
            <Card className="p-6 rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" /> Store Contact & Support
              </h3>
              <div className="space-y-3 text-xs text-gray-600">
                <div>
                  <span className="text-gray-400 block">Store Name</span>
                  <span className="font-bold text-gray-900 text-sm">{businessName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Address</span>
                  <span className="font-medium text-gray-800">{settings.address || 'Main Bus Stand, Atari Khejda, Vidisha, Madhya Pradesh'}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <a 
                    href={`tel:${primaryPhone}`}
                    className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold rounded-lg flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> Call {primaryPhone}
                  </a>
                  <a 
                    href={`https://wa.me/91${whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" /> WhatsApp
                  </a>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
