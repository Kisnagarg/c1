import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { ShoppingBag, Search, Menu, X, User, LogOut, LayoutDashboard, ChevronDown, Phone } from 'lucide-react';
import InstagramIcon from '../ui/InstagramIcon';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/categories', label: 'Categories' },
    { to: '/products', label: 'Products' },
    { to: '/contact', label: 'Contact Us' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  const storeName = settings.businessName || 'Rathore Electronics';

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100' : 'bg-white border-b border-gray-100'
    }`}>
      {/* Top Banner with Business Info */}
      <div className="bg-primary-950 text-gray-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href={`tel:${settings.primaryPhone || '8435930113'}`} className="hover:text-primary-300 transition-colors flex items-center gap-1">
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
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>{settings.instagramHandle || '@rathore_electronics_'}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black text-gray-900 tracking-tight block leading-tight">{storeName}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary-600 block">Vidisha, MP</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
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

            {/* Instagram Link in Navbar */}
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

          {/* Search + Auth */}
          <div className="hidden md:flex items-center gap-3">
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

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </form>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-3 rounded-lg text-sm font-semibold ${
                  isActive(link.to) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Instagram Button */}
            <a
              href={settings.instagramUrl || 'https://www.instagram.com/rathore_electronics_/'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 my-1 mx-1 transition-colors"
            >
              <InstagramIcon className="w-4 h-4 text-pink-600" />
              <span>Follow {settings.instagramHandle || '@rathore_electronics_'}</span>
            </a>
            {user ? (
              <>
                <Link to="/dashboard" className="block px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">
                  My Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="block px-4 py-3 text-sm font-bold text-primary-700 hover:bg-primary-50 rounded-lg">
                    Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 mt-2 px-4">
                <Link to="/login" className="flex-1 text-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">Login</Link>
                <Link to="/register" className="flex-1 text-center px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
