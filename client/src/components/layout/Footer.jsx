import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const footerCategories = [
    { name: 'Drones', slug: 'drones' },
    { name: 'Toys & Monster Trucks', slug: 'toys-monster-trucks' },
    { name: 'Bulbs & Tubes', slug: 'bulbs-tubes' },
    { name: 'Wires & Cables', slug: 'wires-cables' },
    { name: 'Chargers', slug: 'chargers' },
    { name: 'RC Toys', slug: 'rc-toys' },
    { name: 'Mixers & Kitchen Appliances', slug: 'mixers-kitchen-appliances' },
    { name: 'Others', slug: 'others' }
  ];

  return (
    <footer className="bg-gray-950 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">Rathore Electronics</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your premier destination for verified electronics, drones, wiring solutions, smart lighting, kitchen appliances, and toys.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Navigation</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'All Products' },
                { to: '/categories', label: 'Browse Categories' },
                { to: '/dashboard', label: 'My Bookings' }
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-gray-400 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Top Categories</h3>
            <ul className="space-y-2">
              {footerCategories.slice(0, 6).map(cat => (
                <li key={cat.slug}>
                  <Link to={`/categories/${cat.slug}`} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Store Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" /> support@rathoreelectronics.com
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" /> +91 98765 43210
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-primary-400 shrink-0" /> Main Market, Electronics Plaza
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-900 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Rathore Electronics. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-xs text-gray-500 hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="text-xs text-gray-500 hover:text-gray-400 cursor-pointer">Terms & Conditions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
