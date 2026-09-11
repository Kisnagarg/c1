import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, ShieldCheck, ShoppingBag } from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { formatPrice } from '../utils/helpers';

export default function Booking() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const initialQty = parseInt(searchParams.get('qty')) || 1;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [quantity, setQuantity] = useState(initialQty);

  useEffect(() => {
    API.get(`/products/${slug}`)
      .then(res => {
        setProduct(res.data.product);
        if (res.data.product.stock < initialQty) {
          setQuantity(res.data.product.stock);
        }
      })
      .catch(err => {
        toast.error('Product not found');
        navigate('/products');
      })
      .finally(() => setLoading(false));
  }, [slug, initialQty, navigate]);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await API.post('/bookings', {
        items: [{ productId: product._id, quantity }]
      });
      setBookingId(res.data.booking.bookingId);
      setSuccess(true);
      toast.success('Booking confirmed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!product) return null;

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-lg p-10 text-center animate-slide-up">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-8">Thank you for your reservation. Your booking has been successfully processed.</p>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Booking Reference</div>
            <div className="text-2xl font-mono font-bold text-primary-600 mb-4">{bookingId}</div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-gray-900">{formatPrice(product.price * quantity)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/products')}>Continue Shopping</Button>
            <Button className="flex-1" onClick={() => navigate('/dashboard')}>View Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  const total = product.price * quantity;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Product
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
          <p className="text-gray-600 mt-2">Review your selection and confirm your reservation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Item Details */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-600" /> Item Summary
              </h2>
              <div className="flex gap-6">
                <div className="w-24 h-24 bg-gray-100 rounded-lg shrink-0 p-2">
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{product.category?.name}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">Qty:</span>
                      <div className="flex items-center border border-gray-300 rounded bg-white">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-2 py-0.5 text-gray-600 hover:bg-gray-50"
                        >-</button>
                        <span className="w-8 text-center text-sm font-medium border-x border-gray-300">
                          {quantity}
                        </span>
                        <button 
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="px-2 py-0.5 text-gray-600 hover:bg-gray-50"
                        >+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* User Info */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Your Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-gray-500 mb-1">Name</span>
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">Email</span>
                  <span className="font-medium text-gray-900">{user.email}</span>
                </div>
                {user.phone && (
                  <div>
                    <span className="block text-gray-500 mb-1">Phone</span>
                    <span className="font-medium text-gray-900">{user.phone}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar / Order Summary */}
          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Booking Summary</h2>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Price ({quantity} item{quantity > 1 ? 's' : ''})</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes & Fees</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-base">Total Payable</span>
                  <span className="font-bold text-primary-600 text-xl">{formatPrice(total)}</span>
                </div>
              </div>

              <Button 
                className="w-full text-base mb-4" 
                size="lg" 
                onClick={handleConfirm}
                isLoading={submitting}
              >
                Confirm Booking
              </Button>

              <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Secure & Encrypted Transaction
              </div>
            </Card>
          </div>
          
        </div>
      </div>
    </div>
  );
}
