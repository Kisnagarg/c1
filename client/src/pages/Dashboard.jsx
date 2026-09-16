import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Package, Calendar, Clock, ChevronRight, User, Mail, Phone, 
  LogOut, Shield, KeyRound, Eye, EyeOff, CheckCircle2, UserCheck, LayoutDashboard 
} from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers';

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'profile' | 'security'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    API.get('/bookings/my')
      .then(res => setBookings(res.data.bookings || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!profileForm.phone || profileForm.phone.trim().length < 10) {
      toast.error('Customer phone number is mandatory (at least 10 digits)');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await API.put('/auth/profile', {
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim()
      });
      updateUser(res.data.user);
      toast.success(res.data.message || 'Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await API.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success(res.data.message || 'Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="bg-gray-50/80 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your profile, security settings, and order bookings.</p>
          </div>
          {user.role === 'admin' && (
            <Link 
              to="/admin" 
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <LayoutDashboard className="w-4 h-4" /> Open Admin Portal
            </Link>
          )}
        </div>

        {/* Mobile Tab Pills Bar (Fast thumb switching on phones) */}
        <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 mb-6 scrollbar-none">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
              activeTab === 'bookings'
                ? 'bg-primary-600 text-white shadow-primary-500/20'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" /> My Bookings ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
              activeTab === 'profile'
                ? 'bg-primary-600 text-white shadow-primary-500/20'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Edit Profile
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
              activeTab === 'security'
                ? 'bg-primary-600 text-white shadow-primary-500/20'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Security
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 border border-gray-100 shadow-sm bg-white">
              <div className="text-center mb-6 border-b border-gray-100 pb-6">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-lg ring-4 ring-primary-500/20"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-2xl font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <div className="mt-1 flex items-center justify-center gap-1.5">
                  <Badge variant={user.role === 'admin' ? 'primary' : 'secondary'} className="uppercase font-semibold text-xs">
                    {user.role}
                  </Badge>
                </div>
              </div>

              {/* Navigation Tabs in Sidebar */}
              <div className="space-y-1 mb-6">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-left ${
                    activeTab === 'bookings'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>My Bookings</span>
                  <span className="ml-auto text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                    {bookings.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-left ${
                    activeTab === 'profile'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-left ${
                    activeTab === 'security'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Security & Password</span>
                </button>
              </div>

              <div className="space-y-3 mb-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>

              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 py-2.5 rounded-xl transition-colors border border-transparent hover:border-red-100 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* 1. Bookings Tab */}
            {activeTab === 'bookings' && (
              <Card className="overflow-hidden border border-gray-100 shadow-sm bg-white">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary-600" /> My Order Bookings
                  </h2>
                  <Badge variant="primary">{bookings.length} Total</Badge>
                </div>
                
                {bookings.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {bookings.map((booking) => (
                      <Link 
                        key={booking._id} 
                        to={`/dashboard/bookings/${booking._id}`}
                        className="block p-6 hover:bg-gray-50/80 transition-colors group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono text-sm font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg">
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
                                  src={item.image || 'https://images.unsplash.com/photo-1507582020434-97210e740b79?w=800'}
                                  alt={item.name}
                                  title={item.name}
                                />
                              ))}
                              {booking.items.length === 1 && (
                                <span className="pl-4 text-sm font-medium text-gray-900 truncate self-center">
                                  {booking.items[0].name} {booking.items[0].quantity > 1 ? `(x${booking.items[0].quantity})` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-2">
                            <div className="text-lg font-black text-gray-900">
                              {formatPrice(booking.totalAmount)}
                            </div>
                            <div className="flex items-center text-sm font-semibold text-primary-600 group-hover:text-primary-700">
                              View Order <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Explore Rathore Electronics catalog to book drones, appliances, lighting, and accessories.</p>
                    <Link 
                      to="/products" 
                      className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-sm"
                    >
                      Browse Products
                    </Link>
                  </div>
                )}
              </Card>
            )}

            {/* 2. Edit Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="p-6 border border-gray-100 shadow-sm bg-white">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-600" /> Account Profile Details
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Update your display name and contact phone number.
                </p>

                <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
                  <Input
                    label="Full Name *"
                    required
                    leftIcon={User}
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />

                  <Input
                    label="Email Address"
                    disabled
                    leftIcon={Mail}
                    value={user.email}
                    helperText="Email address cannot be changed."
                  />

                  <Input
                    label="Phone Number * (Mandatory)"
                    type="tel"
                    required
                    leftIcon={Phone}
                    placeholder="+91 98765 43210"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    helperText="Mandatory for delivery updates and order notifications"
                  />

                  <Button type="submit" className="py-2.5 px-6 font-semibold" isLoading={profileLoading}>
                    Save Changes
                  </Button>
                </form>
              </Card>
            )}

            {/* 3. Security & Change Password Tab */}
            {activeTab === 'security' && (
              <Card className="p-6 border border-gray-100 shadow-sm bg-white">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary-600" /> Update Password
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Ensure your account is using a long, random password to stay secure.
                </p>

                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
                  <Input
                    label="Current Password *"
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    leftIcon={KeyRound}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />

                  <Input
                    label="New Password *"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    leftIcon={KeyRound}
                    placeholder="Min. 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />

                  <Input
                    label="Confirm New Password *"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    leftIcon={KeyRound}
                    placeholder="Re-type new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />

                  <Button type="submit" className="py-2.5 px-6 font-semibold" isLoading={passwordLoading}>
                    Update Password
                  </Button>
                </form>
              </Card>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

