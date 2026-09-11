import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
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

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page);
      
      const res = await API.get(`/admin/bookings?${params.toString()}`);
      setBookings(res.data.bookings);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch bookings');
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
      toast.success(res.data.message);
      
      // Update local state
      setBookings(bookings.map(b => 
        b._id === id ? { ...b, status: newStatus } : b
      ));
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
        <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded-lg text-sm py-1.5 pl-3 pr-8 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="">All Statuses</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {pagination ? `Total: ${pagination.total} bookings` : 'Loading...'}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center"><Spinner /></div>
          ) : bookings.length > 0 ? (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{booking.bookingId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">{formatDateTime(booking.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{booking.user?.name}</div>
                      <div className="text-xs text-gray-500">{booking.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {booking.items.slice(0, 3).map((item, i) => (
                          <img 
                            key={i}
                            src={item.image || 'https://via.placeholder.com/30'}
                            className="w-8 h-8 rounded-full border-2 border-white object-cover bg-gray-100"
                            title={item.name}
                          />
                        ))}
                        {booking.items.length > 3 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium z-10">
                            +{booking.items.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatPrice(booking.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {updatingId === booking._id ? (
                        <Spinner size="sm" />
                      ) : (
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                          className="text-xs border border-gray-300 rounded-md py-1 pl-2 pr-6 bg-white focus:ring-primary-500 focus:border-primary-500"
                        >
                          {statuses.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-500">No bookings found.</div>
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
            <span className="text-sm text-gray-600">Page {page} of {pagination.pages}</span>
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
    </div>
  );
}
