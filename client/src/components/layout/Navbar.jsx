import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { 
  ShoppingBag, 
  Search, 
  User, 
  LogOut, 
  LayoutDashboard, 
  ChevronDown, 
  Phone,
  Home,
  Grid,
  Package,
  ClipboardList,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
  X
} from 'lucide-react';
import InstagramIcon from '../ui/InstagramIcon';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/categories', label: 'Categories' },
    { to: '/products', label: 'Products' },
    { to: '/contact', label: 'Contact Us' },
  ];

  // Mobile horizontal scroll options
  const mobileNavItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/categories', label: 'Categories', icon: Grid },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/dashboard', label: 'Orders', icon: ClipboardList },
    { to: '/contact', label: 'Contact', icon: Phone },
  ];

  const categoryShortcuts = [
    { to: '/categories/drones', label: '🛸 Drones' },
    { to: '/categories/bulbs-tubes', label: '💡 Bulbs & Tubes' },
    { to: '/categories/wires-cables', label: '🔌 Wires & Cables' },
    { to: '/categories/chargers', label: '⚡ Chargers' },
    { to: '/categories/rc-toys', label: '🚗 RC Toys' },
    { to: '/categories/mixers-kitchen-appliances', label: '🪓 Mixers' },
    { to: '/categories/toys-monster-trucks', label: '🧸 Monster Trucks' },
    { to: '/categories/others', label: '📦 Others' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const storeName = settings.businessName || 'Rathore Electronics';

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md border-b border-gray-100' : 'bg-white border-b border-gray-100'
    }`}>
      
      {/* 1. Top Announcement Bar (Shared Desktop & Mobile) */}
      <div className="bg-primary-950 text-gray-200 text-[11px] sm:text-xs py-1 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <a 
              href={`tel:${settings.primaryPhone || '8435930113'}`} 
              className="hover:text-primary-300 transition-colors flex items-center gap-1 font-medium"
            >
              <Phone className="w-3 h-3 text-primary-400" />
              <span>Call: <strong className="text-white">{settings.primaryPhone || '8435930113'}</strong></span>
            </a>
            <span className="hidden sm:inline text-gray-600">|</span>
            <span className="hidden sm:inline text-gray-400">Owner: <strong className="text-gray-200">{settings.ownerName || 'Mahendra Rathore'}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-emerald-400 font-medium">⚡ Flat ₹200 Advance Booking Available</span>
            <a 
              href={settings.instagramUrl || 'https://www.instagram.com/rathore_electronics_/'}
              target="_blank" 
              rel="noreferrer"
              className="text-pink-400 hover:text-pink-300 font-semibold transition-colors flex items-center gap-1"
            >
              <InstagramIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{settings.instagramHandle || '@rathore_electronics_'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Desktop Navigation Bar (md:flex) */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={settings.logo || '/logo.jpg'}
                alt={storeName}
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-primary-500/20 shadow-md group-hover:scale-105 transition-transform bg-black"
              />
              <div>
                <span className="text-lg font-black text-gray-900 tracking-tight block leading-tight">{storeName}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary-600 block">All Electrical Services • Vidisha</span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive(link.to)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Instagram Link in Desktop Navbar */}
              <a
                href={settings.instagramUrl || 'https://www.instagram.com/rathore_electronics_/'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-pink-600 hover:text-white bg-pink-50 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-amber-500 transition-all shadow-sm ml-1"
                title="Follow us on Instagram @rathore_electronics_"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Instagram</span>
              </a>
            </div>

            {/* Desktop Search + Auth */}
            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all focus:w-60"
                />
              </form>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/20"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">{user.name?.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 max-w-28 truncate">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                          <LayoutDashboard className="w-4 h-4" /> My Dashboard
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-700 hover:bg-primary-50 transition-colors font-bold">
                            <User className="w-4 h-4" /> Admin Portal
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md">
                    Register
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 3. Amazon-Style Mobile Navigation Bar (md:hidden) */}
      <div className="md:hidden bg-white">
        
        {/* Mobile Row 1: Brand & Top Action Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 gap-2">
          
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img
              src={settings.logo || '/logo.jpg'}
              alt={storeName}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-primary-500/20 shadow-xs shrink-0 bg-black"
            />
            <div className="min-w-0">
              <span className="text-sm font-black text-gray-900 tracking-tight block truncate leading-tight">
                {storeName}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-primary-600 block truncate">
                Electrical Services • Vidisha
              </span>
            </div>
          </Link>

          {/* Right Action Icons: Login / Profile + Orders + Cart */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Orders Quick Link */}
            <Link
              to="/dashboard"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                isActive('/dashboard')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="My Orders & Bookings"
            >
              <ClipboardList className="w-3.5 h-3.5 text-primary-600" />
              <span className="text-[11px]">Orders</span>
            </Link>

            {/* Cart / Shop Bag Quick Link */}
            <Link
              to="/products"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              title="Shop All Products"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[11px]">Shop</span>
            </Link>

            {/* Profile / Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                  title="User Profile Menu"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-primary-500/20"
                    />
                  ) : (
                    <div className="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-xs">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 font-medium">
                        <LayoutDashboard className="w-3.5 h-3.5 text-primary-600" /> My Orders & Dashboard
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2 text-xs text-primary-700 hover:bg-primary-50 font-bold">
                          <User className="w-3.5 h-3.5" /> Admin Portal
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                title="Sign In"
              >
                <User className="w-3 h-3" />
                <span>Sign In</span>
              </Link>
            )}

          </div>
        </div>

        {/* Mobile Row 2: Amazon-Style Dedicated Full-Width Search Bar */}
        <div className="px-3.5 pb-2">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <div className="relative w-full flex items-center bg-gray-100 hover:bg-gray-100/90 focus-within:bg-white rounded-xl border border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all overflow-hidden">
              <Search className="w-4 h-4 text-gray-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search products, drones, bulbs, wires..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-2.5 text-xs text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 text-gray-400 hover:text-gray-600 mr-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 text-xs font-bold shrink-0 transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Row 3: Horizontally Scrollable Primary Navigation & Category Strip */}
        <div className="bg-gray-50 border-t border-b border-gray-200/80 px-2 py-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-1.5 w-max min-w-full">
            
            {/* Primary Navigation Tabs */}
            {mobileNavItems.map(item => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                    active
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-primary-600'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Official Instagram Badge Pill */}
            <a
              href={settings.instagramUrl || 'https://www.instagram.com/rathore_electronics_/'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 shadow-xs hover:opacity-95 shrink-0"
              title="Official Instagram Profile"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>

            <div className="h-4 w-[1px] bg-gray-300 mx-1 shrink-0" />

            {/* Quick Category Shortcuts */}
            {categoryShortcuts.map(cat => {
              const active = location.pathname === cat.to;
              return (
                <Link
                  key={cat.to}
                  to={cat.to}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                    active
                      ? 'bg-primary-100 text-primary-800 font-bold border border-primary-200'
                      : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200/70'
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}

          </div>
        </div>

      </div>

    </nav>
  );
}
