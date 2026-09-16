import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Eye, X, Package, Clock, CheckCircle2, AlertCircle, Phone } from 'lucide-react';
import API from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatPrice, formatDateTime, getStatusColor } from '../../utils/helpers';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page);
      params.append('limit', 15);
      
      const res = await API.get(`/admin/bookings?${params.toString()}`);
      setBookings(res.data.bookings || []);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, page]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await API.put(`/admin/bookings/${id}/status`, { status: newStatus });
      toast.success(res.data.message || `Order status updated to ${newStatus}`);
      
      setBookings(prev => prev.map(b => 
        b._id === id ? { ...b, status: newStatus } : b
      ));

      if (selectedBooking && selectedBooking._id === id) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders & Bookings Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track customer orders, review reserved items, and update fulfillment statuses.
          </p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded-xl text-sm py-1.5 pl-3 pr-8 focus:ring-primary-500 focus:border-primary-500 bg-white font-medium"
            >
              <option value="">All Orders ({pagination?.total || 0})</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="text-xs text-gray-500">
            {pagination ? `Showing page ${page} of ${pagination.pages || 1}` : 'Loading...'}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 flex justify-center"><Spinner size="lg" /></div>
          ) : bookings.length > 0 ? (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Ordered Items</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="font-mono font-bold text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
                      >
                        {booking.bookingId}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{booking.user?.name || 'Customer'}</div>
                      <div className="text-xs text-gray-500">{booking.user?.email}</div>
                      {booking.user?.phone ? (
                        <div className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded mt-1 border border-gray-200/80">
                          <Phone className="w-3 h-3 text-primary-600 shrink-0" />
                          <span>{booking.user.phone}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded mt-1">
                          <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>No phone</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 overflow-hidden">
                          {booking.items.slice(0, 3).map((item, i) => (
                            <img 
                              key={i}
                              src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&fit=crop'}
                              className="w-8 h-8 rounded-full border-2 border-white object-cover bg-gray-100"
                              title={item.name}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                          {booking.items.length} item(s)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {formatPrice(booking.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {formatDateTime(booking.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                        disabled={updatingId === booking._id}
                        className="text-xs border border-gray-300 rounded-lg py-1.5 pl-2 pr-6 bg-white focus:ring-primary-500 focus:border-primary-500 font-medium"
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2"
                        onClick={() => setSelectedBooking(booking)}
                        title="View order breakdown"
                      >
                        <Eye className="w-4 h-4 text-primary-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-16 text-center text-gray-500">No bookings found matching filter.</div>
          )}
        </div>

        {/* Pagination */}
        {pagination?.pages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-xs text-gray-600">Page {page} of {pagination.pages}</span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === pagination.pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* Order Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-2xl animate-slide-up relative my-8 shadow-2xl">
            <button 
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                  <span className="text-xs uppercase font-bold text-gray-400">Order Details</span>
                  <h2 className="text-xl font-mono font-extrabold text-primary-600">{selectedBooking.bookingId}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Placed on {formatDateTime(selectedBooking.createdAt)}</p>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusColor(selectedBooking.status)} className="text-sm px-3 py-1">
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-200/70">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Name:</span>
                    <p className="font-semibold text-gray-900">{selectedBooking.user?.name || 'Guest'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Email:</span>
                    <p className="font-semibold text-gray-900">{selectedBooking.user?.email || '-'}</p>
                  </div>
                  {selectedBooking.user?.phone && (
                    <div>
                      <span className="text-gray-500 text-xs">Phone:</span>
                      <p className="font-semibold text-gray-900">{selectedBooking.user.phone}</p>
                    </div>
                  )}
                  {selectedBooking.notes && (
                    <div className="sm:col-span-2 mt-1">
                      <span className="text-gray-500 text-xs">Order Notes:</span>
                      <p className="text-xs text-gray-700 bg-white p-2 rounded-lg border mt-0.5">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="space-y-3 mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ordered Products</h3>
                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  {selectedBooking.items?.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&fit=crop'} 
                          alt={item.name} 
                          className="w-12 h-12 rounded-xl object-cover border bg-gray-100 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{formatPrice(item.price)} × {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mb-6">
                <span className="text-base font-bold text-gray-900">Total Order Amount</span>
                <span className="text-xl font-black text-primary-600">{formatPrice(selectedBooking.totalAmount)}</span>
              </div>

              {/* Change Status & Close */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-medium text-gray-600">Update Status:</span>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => handleStatusChange(selectedBooking._id, e.target.value)}
                    className="border border-gray-300 rounded-xl text-sm py-1.5 px-3 bg-white font-medium focus:ring-primary-500 focus:border-primary-500"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <Button variant="ghost" onClick={() => setSelectedBooking(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
