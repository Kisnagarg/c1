import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Eye, 
  X, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  MessageSquare,
  Search, 
  Filter, 
  Check, 
  XCircle, 
  ShieldCheck, 
  QrCode, 
  Calendar,
  ExternalLink,
  MapPin,
  RefreshCw
} from 'lucide-react';
import API from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { 
  formatPrice, 
  formatDateTime, 
  getOrderStatusLabel, 
  getPaymentStatusLabel, 
  getStatusColor, 
  getPaymentStatusColor 
} from '../../utils/helpers';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState(0);
  
  // Filters
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending_verification' | 'awaiting_advance' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  
  // Action state
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { type: 'verify' | 'reject', booking: {...} }
  const [rejectReason, setRejectReason] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === 'pending_verification') {
        params.append('paymentStatus', 'pending_verification');
      } else if (activeTab !== 'all') {
        params.append('orderStatus', activeTab);
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      params.append('page', page);
      params.append('limit', 15);
      
      const res = await API.get(`/admin/bookings?${params.toString()}`);
      setBookings(res.data.bookings || []);
      setPagination(res.data.pagination);
      if (res.data.pendingVerificationsCount !== undefined) {
        setPendingVerificationsCount(res.data.pendingVerificationsCount);
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  // Verify ₹200 Payment
  const handleVerifyPayment = async (booking) => {
    setUpdatingId(booking._id);
    try {
      const res = await API.post(`/admin/bookings/${booking._id}/verify-payment`, {
        adminNote: adminNote.trim()
      });
      toast.success(res.data.message || `₹200 Payment verified for Order #${booking.bookingId}`);
      
      setBookings(prev => prev.map(b => 
        b._id === booking._id ? res.data.booking : b
      ));

      if (selectedBooking?._id === booking._id) {
        setSelectedBooking(res.data.booking);
      }
      setActionModal(null);
      setAdminNote('');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify payment');
    } finally {
      setUpdatingId(null);
    }
  };

  // Reject Payment
  const handleRejectPayment = async (booking) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejecting the payment');
      return;
    }

    setUpdatingId(booking._id);
    try {
      const res = await API.post(`/admin/bookings/${booking._id}/reject-payment`, {
        reason: rejectReason.trim(),
        adminNote: adminNote.trim()
      });
      toast.success(res.data.message || `Payment rejected for Order #${booking.bookingId}`);
      
      setBookings(prev => prev.map(b => 
        b._id === booking._id ? res.data.booking : b
      ));

      if (selectedBooking?._id === booking._id) {
        setSelectedBooking(res.data.booking);
      }
      setActionModal(null);
      setRejectReason('');
      setAdminNote('');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject payment');
    } finally {
      setUpdatingId(null);
    }
  };

  // Status Change (Fulfillment)
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await API.put(`/admin/bookings/${id}/status`, { orderStatus: newStatus });
      toast.success(res.data.message || `Order status updated to ${newStatus}`);
      
      setBookings(prev => prev.map(b => 
        b._id === id ? res.data.booking : b
      ));

      if (selectedBooking?._id === id) {
        setSelectedBooking(res.data.booking);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending_verification', label: 'Pending Verification', badge: pendingVerificationsCount },
    { id: 'awaiting_advance', label: 'Awaiting Advance' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Ready / Shipped' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  const fulfillmentStatuses = [
    'awaiting_advance',
    'awaiting_verification',
    'confirmed',
    'processing',
    'shipped',
    'completed',
    'cancelled'
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
            <Package className="w-7 h-7 text-primary-600" />
            Orders & UPI Advance Payment Verification
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Check incoming ₹200 UPI advance payments in your bank/UPI app, verify transaction IDs, and manage orders.
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchBookings} 
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Orders
        </Button>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex overflow-x-auto gap-2 pb-1 border-b border-gray-200 scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === tab.id 
                  ? 'bg-white text-primary-700' 
                  : 'bg-purple-600 text-white animate-pulse'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search & Actions Bar */}
      <Card className="p-4 shadow-sm bg-white border border-gray-200">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID (e.g. RE-123456), Customer Name, Phone, or UPI UTR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-medium"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button type="submit" size="sm" className="flex-1 sm:flex-initial px-5 font-bold">
              Search
            </Button>
            {searchQuery && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                  setTimeout(fetchBookings, 50);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Orders Table */}
      <Card className="p-0 overflow-hidden shadow-sm border border-gray-200 rounded-2xl bg-white">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 flex justify-center"><Spinner size="lg" /></div>
          ) : bookings.length > 0 ? (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-extrabold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4">Order ID & Date</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Ordered Items</th>
                  <th className="px-5 py-4">Amount & Advance</th>
                  <th className="px-5 py-4">UPI UTR & Proof</th>
                  <th className="px-5 py-4">Payment & Order Status</th>
                  <th className="px-5 py-4 text-right">Verification & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => {
                  const isAwaitingVerification = booking.paymentStatus === 'pending_verification';
                  const isVerified = booking.paymentStatus === 'verified';
                  const advance = booking.advanceAmount || 200;
                  const remaining = booking.remainingAmount !== undefined ? booking.remainingAmount : Math.max(0, booking.totalAmount - advance);

                  return (
                    <tr 
                      key={booking._id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        isAwaitingVerification ? 'bg-purple-50/40 font-medium' : ''
                      }`}
                    >
                      {/* Order ID */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="font-mono font-bold text-primary-600 hover:text-primary-700 hover:underline cursor-pointer block"
                        >
                          {booking.bookingId}
                        </button>
                        <span className="text-[11px] text-gray-400 block mt-0.5">
                          {formatDateTime(booking.createdAt)}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900">{booking.customerName || booking.user?.name || 'Customer'}</div>
                        {booking.customerPhone || booking.user?.phone ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <a 
                              href={`tel:${booking.customerPhone || booking.user?.phone}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded border"
                              title="Click to Call"
                            >
                              <Phone className="w-3 h-3 text-primary-600 shrink-0" />
                              <span>{booking.customerPhone || booking.user?.phone}</span>
                            </a>
                            <a
                              href={`https://wa.me/91${(booking.customerPhone || booking.user?.phone || '').replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="WhatsApp Customer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-700">No phone</span>
                        )}
                      </td>

                      {/* Products */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden">
                            {booking.items?.slice(0, 2).map((item, i) => (
                              <img 
                                key={i}
                                src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                                className="w-8 h-8 rounded-lg border-2 border-white object-cover bg-gray-100"
                                title={item.name}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-700 font-semibold line-clamp-1 max-w-[130px]">
                            {booking.items?.[0]?.name} {booking.items?.length > 1 ? `+${booking.items.length - 1} more` : ''}
                          </span>
                        </div>
                      </td>

                      {/* Amount & Advance */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-extrabold text-gray-900">{formatPrice(booking.totalAmount)}</div>
                        <div className="text-xs text-emerald-700 font-semibold">
                          Adv: ₹{advance} {isVerified ? '✓' : ''}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Rem: {formatPrice(remaining)}
                        </div>
                      </td>

                      {/* UPI UTR / Screenshot */}
                      <td className="px-5 py-4">
                        {booking.upiTransactionId ? (
                          <div className="space-y-1">
                            <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border inline-block">
                              {booking.upiTransactionId}
                            </span>
                            {booking.paymentScreenshot && (
                              <button
                                onClick={() => setSelectedBooking(booking)}
                                className="text-[11px] text-primary-600 hover:underline flex items-center gap-1 font-semibold"
                              >
                                <ExternalLink className="w-3 h-3" /> View Screenshot
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Not submitted</span>
                        )}
                      </td>

                      {/* Status Badges */}
                      <td className="px-5 py-4 space-y-1">
                        <div>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            {getPaymentStatusLabel(booking.paymentStatus)}
                          </span>
                        </div>
                        <div>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getStatusColor(booking.orderStatus || booking.status)}`}>
                            {getOrderStatusLabel(booking.orderStatus || booking.status)}
                          </span>
                        </div>
                      </td>

                      {/* Verification & Action Buttons */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {isAwaitingVerification ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 font-bold shadow-sm"
                              onClick={() => setActionModal({ type: 'verify', booking })}
                              disabled={updatingId === booking._id}
                            >
                              <Check className="w-3.5 h-3.5 mr-1" /> Verify ₹{advance}
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-2.5 py-1.5 font-bold"
                              onClick={() => setActionModal({ type: 'reject', booking })}
                              disabled={updatingId === booking._id}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="px-2"
                              onClick={() => setSelectedBooking(booking)}
                              title="View full details"
                            >
                              <Eye className="w-4 h-4 text-primary-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={booking.orderStatus || booking.status}
                              onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                              disabled={updatingId === booking._id}
                              className="text-xs border border-gray-300 rounded-lg py-1.5 pl-2 pr-6 bg-white focus:ring-primary-500 font-semibold text-gray-700"
                            >
                              {fulfillmentStatuses.map(s => (
                                <option key={s} value={s}>{getOrderStatusLabel(s)}</option>
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
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-16 text-center text-gray-500">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-700">No orders found matching this filter.</p>
            </div>
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
            <span className="text-xs font-semibold text-gray-600">
              Page {page} of {pagination.pages} ({pagination.total} total orders)
            </span>
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

      {/* MODAL: VERIFY OR REJECT ACTION DIALOG */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg animate-slide-up relative p-6 shadow-2xl rounded-3xl bg-white">
            <button 
              onClick={() => setActionModal(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-2xl ${
                  actionModal.type === 'verify' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                }`}>
                  {actionModal.type === 'verify' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {actionModal.type === 'verify' ? 'Verify ₹200 UPI Payment' : 'Reject UPI Payment Submission'}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">Order #{actionModal.booking.bookingId}</p>
                </div>
              </div>

              {/* Transaction details verification checklist */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mb-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-bold text-gray-900">{actionModal.booking.customerName || actionModal.booking.user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-bold text-gray-900">{actionModal.booking.customerPhone || actionModal.booking.user?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted UPI UTR / Ref:</span>
                  <span className="font-mono font-bold text-primary-700 text-sm">{actionModal.booking.upiTransactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Advance Amount:</span>
                  <span className="font-bold text-emerald-700">₹{actionModal.booking.advanceAmount || 200}</span>
                </div>
              </div>

              {actionModal.type === 'reject' && (
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Reason for Rejection * (Shown to customer)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UTR number not found in bank statement, invalid amount"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Internal Admin Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified in GPay transaction history"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setActionModal(null)}>
                  Cancel
                </Button>
                {actionModal.type === 'verify' ? (
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    onClick={() => handleVerifyPayment(actionModal.booking)}
                    isLoading={updatingId === actionModal.booking._id}
                  >
                    Confirm & Verify Payment
                  </Button>
                ) : (
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                    onClick={() => handleRejectPayment(actionModal.booking)}
                    isLoading={updatingId === actionModal.booking._id}
                  >
                    Reject Payment Submission
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* FULL ORDER DETAIL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-2xl animate-slide-up relative my-8 shadow-2xl rounded-3xl bg-white">
            <button 
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                  <span className="text-xs uppercase font-bold text-gray-400">Order & Advance Payment Details</span>
                  <h2 className="text-2xl font-mono font-black text-primary-600">{selectedBooking.bookingId}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Placed on {formatDateTime(selectedBooking.createdAt)}</p>
                </div>
                <div className="text-right space-y-1">
                  <div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                      Payment: {getPaymentStatusLabel(selectedBooking.paymentStatus)}
                    </span>
                  </div>
                  <div>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusColor(selectedBooking.orderStatus || selectedBooking.status)}`}>
                      {getOrderStatusLabel(selectedBooking.orderStatus || selectedBooking.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* UPI Transaction Verification Box */}
              <div className="bg-gradient-to-r from-primary-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-primary-100">
                <h3 className="text-xs font-bold text-primary-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary-600" /> UPI Advance Payment Record
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
                  <div>
                    <span className="text-gray-500 block">UPI Transaction ID / UTR:</span>
                    <span className="font-mono font-bold text-sm text-gray-900 bg-white px-2 py-0.5 rounded border inline-block mt-0.5">
                      {selectedBooking.upiTransactionId || 'None submitted'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Submitted At:</span>
                    <span className="font-semibold text-gray-900">{formatDateTime(selectedBooking.paymentSubmittedAt) || '-'}</span>
                  </div>
                  {selectedBooking.paymentVerifiedAt && (
                    <div>
                      <span className="text-gray-500 block">Verified At:</span>
                      <span className="font-semibold text-emerald-700">{formatDateTime(selectedBooking.paymentVerifiedAt)}</span>
                    </div>
                  )}
                  {selectedBooking.rejectionReason && (
                    <div className="sm:col-span-2 text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                      <strong>Rejection Reason:</strong> {selectedBooking.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Payment Screenshot Preview if Available */}
                {selectedBooking.paymentScreenshot && (
                  <div className="mt-4 pt-3 border-t border-primary-200/50">
                    <span className="text-xs font-bold text-gray-700 block mb-2">Uploaded Payment Screenshot:</span>
                    <a 
                      href={selectedBooking.paymentScreenshot} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-block relative group"
                    >
                      <img 
                        src={selectedBooking.paymentScreenshot} 
                        alt="Screenshot" 
                        className="max-h-48 rounded-xl border border-gray-300 shadow-sm group-hover:opacity-90 transition-opacity"
                      />
                      <span className="text-[11px] text-primary-600 font-bold block mt-1 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Open Full Image in New Tab
                      </span>
                    </a>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-200/70">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Name:</span>
                    <p className="font-bold text-gray-900">{selectedBooking.customerName || selectedBooking.user?.name || 'Customer'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Email:</span>
                    <p className="font-semibold text-gray-900">{selectedBooking.customerEmail || selectedBooking.user?.email || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Phone:</span>
                    <p className="font-bold text-gray-900">{selectedBooking.customerPhone || selectedBooking.user?.phone || '-'}</p>
                  </div>
                  {selectedBooking.shippingAddress && (
                    <div>
                      <span className="text-gray-500 text-xs">Shipping Address:</span>
                      <p className="font-medium text-gray-800">{selectedBooking.shippingAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="space-y-3 mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ordered Products</h3>
                <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1">
                  {selectedBooking.items?.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'} 
                          alt={item.name} 
                          className="w-10 h-10 rounded-xl object-cover border bg-gray-100 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-gray-500">{formatPrice(item.price)} × {item.quantity}</p>
                        </div>
                      </div>
                      <div className="font-black text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Remaining Breakdown */}
              <div className="pt-4 border-t border-gray-100 space-y-1.5 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Total Order Amount:</span>
                  <span className="font-bold text-gray-900">{formatPrice(selectedBooking.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Advance Payment (₹200):</span>
                  <span className="font-bold">
                    {selectedBooking.paymentStatus === 'verified' ? 'Verified (Paid)' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-base font-black pt-2 border-t">
                  <span>Remaining to Collect on Delivery:</span>
                  <span className="text-primary-600 text-lg font-black">{formatPrice(selectedBooking.remainingAmount || 0)}</span>
                </div>
              </div>

              {/* Verification & Close Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  {selectedBooking.paymentStatus === 'pending_verification' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        onClick={() => {
                          setSelectedBooking(null);
                          setActionModal({ type: 'verify', booking: selectedBooking });
                        }}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Verify Payment
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 font-bold"
                        onClick={() => {
                          setSelectedBooking(null);
                          setActionModal({ type: 'reject', booking: selectedBooking });
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
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
