import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  User, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard,
  QrCode,
  FileText,
  AlertCircle,
  IndianRupee,
  Sparkles
} from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import PhoneOtpModal from '../components/auth/PhoneOtpModal';
import { formatPrice } from '../utils/helpers';
import { validateIndianPhone } from '../utils/validators';

export default function Booking() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { settings } = useSettings();
  
  const initialQty = parseInt(searchParams.get('qty')) || 1;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(initialQty);
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(Boolean(user?.isPhoneVerified && user?.phone));

  const advanceAmount = settings?.advanceAmount || 200;

  useEffect(() => {
    if (user?.phone && !customerPhone) {
      setCustomerPhone(user.phone);
    }
    if (user?.name && !customerName) {
      setCustomerName(user.name);
    }
  }, [user]);

  useEffect(() => {
    API.get(`/products/${slug}`)
      .then(res => {
        setProduct(res.data.product);
        if (res.data.product.stock < initialQty) {
          setQuantity(Math.max(1, res.data.product.stock));
        }
      })
      .catch(err => {
        toast.error('Product not found');
        navigate('/products');
      })
      .finally(() => setLoading(false));
  }, [slug, initialQty, navigate]);

  const phoneValidation = useMemo(() => {
    if (!customerPhone) return { isValid: false, message: '' };
    return validateIndianPhone(customerPhone);
  }, [customerPhone]);

  const handlePhoneVerified = async ({ phone }) => {
    setIsPhoneVerified(true);
    setCustomerPhone(phone);
    try {
      const profileRes = await API.put('/auth/profile', { 
        phone, 
        name: customerName || user?.name,
        isPhoneVerified: true
      });
      if (profileRes.data.user) updateUser(profileRes.data.user);
    } catch (e) {
      console.warn('Profile sync notice:', e);
    }
    toast.success('Mobile number verified!');
  };

  const handleConfirm = async () => {
    const rawPhone = (customerPhone || user?.phone || '').trim();
    const phoneCheck = validateIndianPhone(rawPhone);

    if (!phoneCheck.isValid) {
      toast.error(phoneCheck.message);
      return;
    }

    const finalPhone = phoneCheck.cleaned;

    setSubmitting(true);
    try {
      // If user had no phone in profile, update profile
      if (!user?.phone || user.phone !== finalPhone) {
        try {
          const profileRes = await API.put('/auth/profile', { 
            phone: finalPhone, 
            name: customerName || user?.name 
          });
          if (profileRes.data.user) updateUser(profileRes.data.user);
        } catch (e) {
          console.warn('Profile sync notice:', e);
        }
      }

      const res = await API.post('/bookings', {
        items: [{ productId: product._id, quantity }],
        phone: finalPhone,
        name: customerName.trim() || user?.name,
        address: shippingAddress.trim(),
        notes: orderNotes.trim()
      });
      
      const createdBooking = res.data.booking;
      toast.success('Order created! Please complete ₹200 UPI advance payment.');
      
      // Redirect to dedicated payment page
      navigate(`/orders/${createdBooking._id}/payment`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!product) return null;

  const total = product.price * quantity;
  const remaining = Math.max(0, total - advanceAmount);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Product
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Review & Place Your Order</h1>
          <p className="text-gray-600 mt-1">
            Confirm your item details and delivery address. A ₹{advanceAmount} UPI advance payment will be required on the next step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Main Content (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Item Details */}
            <Card className="p-6 rounded-3xl border border-gray-200/80 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-600" /> Item Summary
              </h2>
              <div className="flex gap-5">
                <div className="w-24 h-24 bg-gray-50 rounded-2xl shrink-0 p-2 border border-gray-100 flex items-center justify-center">
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 text-base">{product.name}</h3>
                  <p className="text-xs text-primary-600 font-semibold mb-3">{product.category?.name}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-gray-900 text-base">{formatPrice(product.price)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Qty:</span>
                      <div className="flex items-center border border-gray-300 rounded-xl bg-white">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 active:bg-gray-100 font-bold"
                        >-</button>
                        <span className="w-8 text-center text-sm font-bold border-x border-gray-300">
                          {quantity}
                        </span>
                        <button 
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 active:bg-gray-100 font-bold"
                        >+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Customer & Delivery Info */}
            <Card className="p-6 rounded-3xl border border-gray-200/80 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4">Customer & Delivery Information</h2>
              
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 text-sm font-medium bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>10-Digit Mobile Number * (Mandatory for Delivery)</span>
                    {isPhoneVerified ? (
                      <span className="text-emerald-600 text-[11px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified via OTP
                      </span>
                    ) : customerPhone && phoneValidation.isValid ? (
                      <button
                        type="button"
                        onClick={() => setShowOtpModal(true)}
                        className="px-2 py-0.5 bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                      >
                        <Sparkles className="w-3 h-3" /> Verify OTP
                      </button>
                    ) : null}
                  </label>
                  
                  <div className="relative">
                    <Phone className="w-4 h-4 text-primary-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 8435930113"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (user?.isPhoneVerified && e.target.value.trim() === user.phone) {
                          setIsPhoneVerified(true);
                        } else {
                          setIsPhoneVerified(false);
                        }
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 font-medium ${
                        customerPhone && !phoneValidation.isValid
                          ? 'border-red-300 bg-red-50/40 focus:ring-red-500 focus:bg-white'
                          : customerPhone && phoneValidation.isValid
                          ? 'border-emerald-300 bg-emerald-50/30 focus:ring-emerald-500 focus:bg-white'
                          : 'border-gray-300 bg-gray-50 focus:ring-primary-500 focus:bg-white'
                      }`}
                    />
                  </div>
                  {customerPhone && !phoneValidation.isValid ? (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {phoneValidation.message}
                    </p>
                  ) : isPhoneVerified ? (
                    <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mobile number verified for ₹200 advance payment tracking.
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-500 mt-1">
                      Used for order confirmation, advance payment verification, and delivery coordination.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> Delivery Address (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="House / Street / Area / Landmark / City / Pin Code"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 text-sm font-medium bg-gray-50 focus:bg-white resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Advance Payment Policy Notice */}
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-950 leading-relaxed">
                <strong>₹{advanceAmount} Advance Payment Flow:</strong> Clicking <strong>Place Order & Pay Advance</strong> will create your order and take you to the secure ₹{advanceAmount} UPI QR payment page.
              </div>
            </div>
          </div>

          {/* Sidebar / Order Summary (5 cols) */}
          <div className="md:col-span-5">
            <Card className="p-6 sm:p-7 rounded-3xl border border-gray-200/80 shadow-md sticky top-20 bg-white">
              <h2 className="text-lg font-extrabold text-gray-900 mb-6">Payment Summary</h2>
              
              <div className="space-y-3.5 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Product Price ({quantity} {quantity > 1 ? 'units' : 'unit'})</span>
                  <span className="font-bold text-gray-900">{formatPrice(total)}</span>
                </div>
                
                <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                  <span>₹{advanceAmount} Advance Required:</span>
                  <span>{formatPrice(advanceAmount)}</span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between text-gray-600">
                  <span>Remaining to Pay on Delivery:</span>
                  <span className="font-bold text-gray-900">{formatPrice(remaining)}</span>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <div>
                    <span className="font-black text-gray-900 text-base block">Total Order Value</span>
                    <span className="text-[11px] text-gray-500">Advance included</span>
                  </div>
                  <span className="font-black text-primary-600 text-2xl">{formatPrice(total)}</span>
                </div>
              </div>

              <Button 
                className="w-full text-base py-3.5 font-bold rounded-2xl bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20 mb-4" 
                size="lg" 
                onClick={handleConfirm}
                isLoading={submitting}
              >
                Place Order & Pay ₹{advanceAmount} Advance
              </Button>

              <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified & Handled by {settings?.businessName || 'Rathore Electronics'}
              </div>
            </Card>
          </div>
          
        </div>
      </div>

      {/* Phone OTP Verification Modal */}
      <PhoneOtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        phone={customerPhone}
        onVerified={handlePhoneVerified}
      />
    </div>
  );
}
