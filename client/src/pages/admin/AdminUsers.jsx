import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UserX, UserCheck, Search, Eye, X, ClipboardList, Phone, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';
import API from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatPrice, formatDate, formatDateTime, getStatusColor } from '../../utils/helpers';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Customer Order History Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Edit Phone Modal State
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editPhone, setEditPhone] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openOrderHistory = async (user) => {
    setSelectedUser(user);
    setLoadingBookings(true);
    try {
      const res = await API.get(`/admin/users/${user._id}/bookings`);
      setUserBookings(res.data.bookings || []);
    } catch (error) {
      toast.error('Failed to fetch user bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const closeOrderHistory = () => {
    setSelectedUser(null);
    setUserBookings([]);
  };

  const openEditPhoneModal = (user) => {
    setEditingCustomer(user);
    setEditPhone(user.phone || '');
  };

  const closeEditPhoneModal = () => {
    setEditingCustomer(null);
    setEditPhone('');
  };

  const handleSaveCustomerPhone = async (e) => {
    e.preventDefault();
    if (!editPhone || editPhone.trim().length < 10) {
      toast.error('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    setSavingPhone(true);
    try {
      const res = await API.put(`/admin/users/${editingCustomer._id}`, {
        phone: editPhone.trim(),
        toggleStatus: false
      });
      toast.success('Customer phone number updated successfully');
      setUsers(users.map(u => 
        u._id === editingCustomer._id ? { ...u, phone: editPhone.trim() } : u
      ));
      if (selectedUser && selectedUser._id === editingCustomer._id) {
        setSelectedUser(prev => ({ ...prev, phone: editPhone.trim() }));
      }
      closeEditPhoneModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update phone number');
    } finally {
      setSavingPhone(false);
    }
  };

  const toggleUserStatus = async (id, currentStatus, name) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} access for ${name}?`)) {
      setUpdatingId(id);
      try {
        await API.put(`/admin/users/${id}`, { toggleStatus: true });
        toast.success(`User ${currentStatus ? 'disabled' : 'enabled'} successfully`);
        setUsers(users.map(u => 
          u._id === id ? { ...u, isActive: !currentStatus } : u
        ));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update user');
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            View registered customer profiles, contact numbers, lifetime spending, and order history.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-white"
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 flex justify-center"><Spinner size="lg" /></div>
          ) : filteredUsers.length > 0 ? (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Customer & Contact</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-center">Orders</th>
                  <th className="px-6 py-4">Total Spent</th>
                  <th className="px-6 py-4 text-center">Account</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className={`transition-colors ${!u.isActive ? 'bg-red-50/40 opacity-75' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold shrink-0 shadow-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                          </div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                          
                          {/* Prominent Phone Number Badge */}
                          <div className="mt-1 flex items-center gap-1.5">
                            {u.phone ? (
                              <div className="inline-flex items-center gap-1 text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200/80">
                                <Phone className="w-3 h-3 text-primary-600 shrink-0" />
                                <span>{u.phone}</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>No phone added</span>
                              </div>
                            )}

                            <button
                              onClick={() => openEditPhoneModal(u)}
                              title="Update customer phone number"
                              className="text-gray-400 hover:text-primary-600 p-0.5 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        {u.bookingCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {formatPrice(u.totalSpent || 0)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={u.isActive ? 'success' : 'danger'}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openOrderHistory(u)}
                        className="text-xs py-1 px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-primary-600" /> Orders
                      </Button>
                      <Button 
                        variant={u.isActive ? 'danger' : 'outline'}
                        size="sm"
                        isLoading={updatingId === u._id}
                        onClick={() => toggleUserStatus(u._id, u.isActive, u.name)}
                        className="text-xs py-1"
                      >
                        {u.isActive ? (
                          <><UserX className="w-3 h-3 mr-1" /> Disable</>
                        ) : (
                          <><UserCheck className="w-3 h-3 mr-1" /> Enable</>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-16 text-center text-gray-500">No customers found.</div>
          )}
        </div>
      </Card>

      {/* Customer Order History Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-2xl animate-slide-up relative my-8 shadow-2xl">
            <button 
              onClick={closeOrderHistory}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedUser.name}'s Order History</h2>
                  <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    <span>{selectedUser.email}</span>
                    {selectedUser.phone ? (
                      <span className="font-medium text-gray-700 flex items-center gap-1">
                        • <Phone className="w-3 h-3 text-primary-600" /> {selectedUser.phone}
                      </span>
                    ) : (
                      <span className="text-amber-600">• No phone added</span>
                    )}
                  </p>
                </div>
              </div>

              {loadingBookings ? (
                <div className="py-12 flex justify-center"><Spinner /></div>
              ) : userBookings.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {userBookings.map((b) => (
                    <div key={b._id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary-600 text-sm">{b.bookingId}</span>
                          <span className="text-xs text-gray-500">• {formatDateTime(b.createdAt)}</span>
                        </div>
                        <Badge variant={getStatusColor(b.status)}>{b.status}</Badge>
                      </div>

                      <div className="space-y-1.5 my-2">
                        {b.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-gray-700">
                            <span className="line-clamp-1">{item.name} × {item.quantity}</span>
                            <span className="font-medium shrink-0 ml-2">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-sm font-bold text-gray-900">
                        <span>Total Paid</span>
                        <span className="text-primary-700">{formatPrice(b.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  This customer has not placed any orders yet.
                </div>
              )}

              <div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
                <Button variant="ghost" onClick={closeOrderHistory}>Close</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Customer Phone Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-md animate-slide-up relative shadow-2xl">
            <button
              onClick={closeEditPhoneModal}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Update Customer Phone</h3>
                  <p className="text-xs text-gray-500">{editingCustomer.name} ({editingCustomer.email})</p>
                </div>
              </div>

              <form onSubmit={handleSaveCustomerPhone} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Contact Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-medium"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Used for order dispatch coordination, booking confirmations, and customer support.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <Button variant="ghost" type="button" onClick={closeEditPhoneModal}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={savingPhone} className="font-semibold">
                    Save Phone
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

