import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';

// User Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import OrderPayment from './pages/OrderPayment';
import Dashboard from './pages/Dashboard';
import BookingDetail from './pages/BookingDetail';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSecurity from './pages/admin/AdminSecurity';

// Layout Wrappers
const MainLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Toaster position="top-center" />
          <Routes>
            {/* Public Routes with Main Layout */}
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/products" element={<MainLayout><Products /></MainLayout>} />
            <Route path="/products/:slug" element={<MainLayout><ProductDetail /></MainLayout>} />
            <Route path="/categories" element={<MainLayout><Categories /></MainLayout>} />
            <Route path="/categories/:slug" element={<MainLayout><CategoryProducts /></MainLayout>} />
            <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
            <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
            <Route path="/register" element={<MainLayout><Register /></MainLayout>} />

            {/* Protected User Routes with Main Layout */}
            <Route path="/booking/:slug" element={<ProtectedRoute><MainLayout><Booking /></MainLayout></ProtectedRoute>} />
            <Route path="/orders/:id/payment" element={<ProtectedRoute><MainLayout><OrderPayment /></MainLayout></ProtectedRoute>} />
            <Route path="/booking/:id/payment" element={<ProtectedRoute><MainLayout><OrderPayment /></MainLayout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/dashboard/bookings/:id" element={<ProtectedRoute><MainLayout><BookingDetail /></MainLayout></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><MainLayout><BookingDetail /></MainLayout></ProtectedRoute>} />

            {/* Admin Routes with Admin Layout */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/:id/edit" element={<AdminProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="security" element={<AdminSecurity />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}
