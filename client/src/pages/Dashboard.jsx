import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, Clock, ChevronRight, User, Mail, Phone, LogOut } from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/bookings/my')
      .then(res => setBookings(res.data.bookings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your profile and view your booking history.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="text-center mb-6 border-b border-gray-100 pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-2xl font-bold text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500 uppercase tracking-wide mt-1 font-medium">{user.role}</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  {user.name}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {user.phone}
                  </div>
                )}
              </div>

              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 py-2.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </Card>
          </div>

          {/* Bookings Area */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-600" /> My Bookings
                </h2>
                <Badge variant="primary">{bookings.length} Total</Badge>
              </div>
              
              {bookings.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <Link 
                      key={booking._id} 
                      to={`/dashboard/bookings/${booking._id}`}
                      className="block p-6 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-sm font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                              {booking.bookingId}
                            </span>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {formatDate(booking.createdAt)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {new Date(booking.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                          
                          <div className="mt-4 flex -space-x-2 overflow-hidden">
                            {booking.items.map((item, i) => (
                              <img 
                                key={i}
                                className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover bg-gray-100"
                                src={item.image || 'https://via.placeholder.com/40'}
                                alt={item.name}
                                title={item.name}
                              />
                            ))}
                            {booking.items.length === 1 && (
                              <span className="pl-4 text-sm font-medium text-gray-900 truncate">
                                {booking.items[0].name} {booking.items[0].quantity > 1 ? `(x${booking.items[0].quantity})` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-2">
                          <div className="text-lg font-bold text-gray-900">
                            {formatPrice(booking.totalAmount)}
                          </div>
                          <div className="flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
                            View Details <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-500 mb-6">When you book products, they will appear here.</p>
                  <Link 
                    to="/products" 
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-sm"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </Card>
          </div>
          
        </div>
      </div>
    </div>
  );
}
