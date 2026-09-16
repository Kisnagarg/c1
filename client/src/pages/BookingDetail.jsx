import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Package, AlertCircle, Calendar } from 'lucide-react';
import API from '../api/axios';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { formatPrice, formatDateTime, getStatusColor } from '../utils/helpers';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Booking Details
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <span className="font-mono bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-sm">{booking.bookingId}</span>
              •
              <span className="flex items-center gap-1 text-sm"><Calendar className="w-4 h-4"/> {formatDateTime(booking.createdAt)}</span>
            </p>
          </div>
          <Badge className={`text-sm px-3 py-1 ${getStatusColor(booking.status)}`}>
            {booking.status.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Status Timeline / Info */}
          <Card className="p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full" style={{
              backgroundColor: booking.status === 'completed' ? '#10b981' : 
                               booking.status === 'cancelled' ? '#ef4444' : 
                               '#3b82f6'
            }}></div>
            <div className="flex items-start gap-4">
              {booking.status === 'completed' ? (
                <div className="p-2 bg-green-100 text-green-600 rounded-full shrink-0"><CheckCircle2 className="w-6 h-6" /></div>
              ) : booking.status === 'cancelled' ? (
                <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0"><AlertCircle className="w-6 h-6" /></div>
              ) : (
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full shrink-0"><Clock className="w-6 h-6" /></div>
              )}
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {booking.status === 'pending' && 'Booking is pending confirmation'}
                  {booking.status === 'confirmed' && 'Booking has been confirmed'}
                  {booking.status === 'processing' && 'Your order is being processed'}
                  {booking.status === 'completed' && 'Booking is completed successfully'}
                  {booking.status === 'cancelled' && 'This booking was cancelled'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {booking.status === 'cancelled' 
                    ? 'The items in this booking are no longer reserved for you.' 
                    : 'We will notify you via email when the status of your booking changes.'}
                </p>
              </div>
            </div>
          </Card>

          {/* Items */}
          <Card>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" /> Booked Items
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {booking.items.map((item, index) => (
                <div key={index} className="p-6 flex flex-col sm:flex-row gap-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg p-2 shrink-0">
                    <img 
                      src={item.image || 'https://via.placeholder.com/150'} 
                      alt={item.name} 
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1">
                    <Link to={`/products/${item.product?.slug || ''}`} className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2 mb-2">
                      {item.name}
                    </Link>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{formatPrice(item.price)} × {item.quantity}</span>
                      <span className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 p-6 rounded-b-2xl border-t border-gray-100">
              <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                <span>Total Amount</span>
                <span className="text-primary-600">{formatPrice(booking.totalAmount)}</span>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
