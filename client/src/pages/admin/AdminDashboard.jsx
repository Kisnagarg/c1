import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Tags, 
  Users, 
  ClipboardList, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Plus,
  ArrowRight,
  Phone,
  QrCode,
  Building2,
  AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { 
  formatPrice, 
  formatDateTime, 
  getOrderStatusLabel, 
  getPaymentStatusLabel, 
  getStatusColor, 
  getPaymentStatusColor 
} from '../../utils/helpers';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/stats')
      .then(res => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-950 via-primary-950 to-gray-900 p-6 md:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-primary-300 border border-white/10 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Production Store Administration
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Rathore Electronics Overview
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Real-time business performance, UPI advance verification queue, and store management.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link to="/admin/bookings">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 font-bold shadow-md">
              <QrCode className="w-4 h-4" /> Verify Payments ({stats.pendingVerifications || 0})
            </Button>
          </Link>
          <Link to="/admin/products/new">
            <Button size="sm" className="bg-primary-500 hover:bg-primary-600 text-white flex items-center gap-1.5 shadow-md">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button size="sm" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> Business Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending Verifications Attention Banner */}
      {stats.pendingVerifications > 0 && (
        <div className="p-5 rounded-3xl bg-purple-50 border-2 border-purple-200 text-purple-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-200 text-purple-800 flex items-center justify-center shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-purple-950">
                {stats.pendingVerifications} Advance Payment{stats.pendingVerifications > 1 ? 's' : ''} Awaiting Verification
              </h3>
              <p className="text-xs text-purple-800 mt-0.5">
                Customers have submitted UPI UTR numbers. Check your bank/UPI app and verify to confirm orders.
              </p>
            </div>
          </div>
          <Link to="/admin/bookings">
            <Button size="sm" className="bg-purple-700 hover:bg-purple-800 text-white font-bold whitespace-nowrap">
              Review & Verify Payments <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Primary KPI Grid (8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="p-5 hover:shadow-md transition-shadow rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Confirmed Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{formatPrice(stats.totalRevenue)}</div>
          <p className="text-xs text-emerald-700 font-medium mt-1">
            ₹{stats.totalAdvanceCollected || 0} advance collected
          </p>
        </Card>

        {/* Total Orders */}
        <Card className="p-5 hover:shadow-md transition-shadow rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.totalBookings}</div>
          <div className="flex items-center gap-3 text-xs mt-1">
            <span className="text-purple-700 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" /> {stats.pendingVerifications} to verify
            </span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {stats.confirmedBookings} confirmed
            </span>
          </div>
        </Card>

        {/* Catalog Products */}
        <Card className="p-5 hover:shadow-md transition-shadow rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Catalog Products</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.totalProducts}</div>
          <p className="text-xs text-purple-600 font-medium mt-1">
            {stats.activeProducts} active on store
          </p>
        </Card>

        {/* Low Stock Warning */}
        <Card className={`p-5 hover:shadow-md transition-shadow rounded-2xl ${stats.lowStockProducts > 0 ? 'border-amber-300 bg-amber-50/30' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inventory Alerts</span>
            <div className={`p-2 rounded-xl ${stats.lowStockProducts > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-black ${stats.lowStockProducts > 0 ? 'text-amber-700' : 'text-gray-900'}`}>
            {stats.lowStockProducts}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.lowStockProducts > 0 ? 'Items with ≤ 5 units in stock' : 'All product stocks healthy'}
          </p>
        </Card>

        {/* Total Categories */}
        <Card className="p-5 hover:shadow-md transition-shadow rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Categories</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Tags className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.totalCategories}</div>
          <p className="text-xs text-gray-500 mt-1">Dynamic store categories</p>
        </Card>

        {/* Registered Customers */}
        <Card className="p-5 hover:shadow-md transition-shadow rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Registered Customers</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.totalUsers}</div>
          <p className="text-xs text-gray-500 mt-1">Active customer accounts</p>
        </Card>

        {/* Awaiting Advance */}
        <Card className="p-5 hover:shadow-md transition-shadow rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Awaiting Advance</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.awaitingAdvance || 0}</div>
          <p className="text-xs text-gray-500 mt-1">Orders awaiting UPI transfer</p>
        </Card>

        {/* Completed Orders */}
        <Card className="p-5 hover:shadow-md transition-shadow rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completed Deliveries</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.completedBookings}</div>
          <p className="text-xs text-gray-500 mt-1">Fulfillment completed</p>
        </Card>
      </div>

      {/* Analytics Chart & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <Card className="lg:col-span-2 p-6 shadow-sm rounded-3xl">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" /> Revenue Trend (Last 6 Months)
          </h3>
          <div className="h-72 w-full">
            {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [formatPrice(value), 'Revenue']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                No monthly order data recorded yet
              </div>
            )}
          </div>
        </Card>

        {/* Order Status Distribution */}
        <Card className="p-6 shadow-sm flex flex-col justify-between rounded-3xl">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Pipeline Summary</h3>
            <div className="space-y-3">
              {stats.statusDistribution && stats.statusDistribution.map((st) => (
                <div key={st._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs font-bold text-gray-700">{getOrderStatusLabel(st._id)}</span>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusColor(st._id)}`}>
                    {st.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100">
            <Link to="/admin/bookings" className="flex items-center justify-between text-sm font-bold text-primary-600 hover:text-primary-700">
              <span>Go to Order Verification Table</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="p-0 overflow-hidden shadow-sm rounded-3xl border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Recent Customer Orders</h3>
          <Link to="/admin/bookings" className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View All Orders <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {stats.recentBookings && stats.recentBookings.length > 0 ? (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-extrabold">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4">Order Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary-600">
                      <Link to="/admin/bookings" className="hover:underline">
                        {b.bookingId}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{b.customerName || b.user?.name || 'Customer'}</div>
                      {b.customerPhone || b.user?.phone ? (
                        <div className="text-xs text-gray-500 font-semibold">{b.customerPhone || b.user?.phone}</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900">
                      {formatPrice(b.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getPaymentStatusColor(b.paymentStatus)}`}>
                        {getPaymentStatusLabel(b.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusColor(b.orderStatus || b.status)}`}>
                        {getOrderStatusLabel(b.orderStatus || b.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {formatDateTime(b.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-500">No recent orders found.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
