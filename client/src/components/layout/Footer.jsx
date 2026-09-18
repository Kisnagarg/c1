import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, MapPin, Phone, MessageSquare, User, ShieldCheck } from 'lucide-react';
import InstagramIcon from '../ui/InstagramIcon';
import { useSettings } from '../../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  const businessName = settings.businessName || 'Rathore Electronics';
  const ownerName = settings.ownerName || 'Mahendra Rathore';
  const address = settings.address || 'Main Bus Stand, Atari Khejda, Vidisha, Madhya Pradesh';
  const primaryPhone = settings.primaryPhone || '8435930113';
  const secondaryPhone = settings.secondaryPhone || '7067586087';
  const whatsappNumber = settings.whatsappNumber || '8435930113';
  const email = settings.email || 'support@rathoreelectronics.com';
  const instagramUrl = settings.instagramUrl || 'https://www.instagram.com/rathore_electronics_/';
  const instagramHandle = settings.instagramHandle || '@rathore_electronics_';

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
          
          {/* Brand & Owner */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">{businessName}</span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your premier multi-category store for verified electronics, drones, wiring solutions, smart lighting, kitchen appliances, and RC toys.
            </p>
            
            <div className="pt-1">
              <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold block">Proprietor / Owner</span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-primary-400" /> {ownerName}
              </span>
            </div>

            {/* Official Instagram Badge */}
            <div className="pt-2">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 shadow-md shadow-pink-900/20 transition-all hover:scale-105"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Follow us on Instagram</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">Quick Navigation</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'All Products' },
                { to: '/categories', label: 'Browse Categories' },
                { to: '/contact', label: 'Contact Us & Location' },
                { to: '/dashboard', label: 'My Order Bookings' }
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-xs text-gray-400 hover:text-white transition-colors font-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">Top Categories</h3>
            <ul className="space-y-2.5">
              {footerCategories.slice(0, 6).map(cat => (
                <li key={cat.slug}>
                  <Link to={`/categories/${cat.slug}`} className="text-xs text-gray-400 hover:text-white transition-colors font-medium">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Verified Store Contact */}
          <div>
            <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">Store Business Contact</h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5 text-gray-400">
                <MapPin className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{address}</span>
              </li>
              
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <a href={`tel:${primaryPhone}`} className="text-gray-300 hover:text-white font-bold transition-colors">
                    {primaryPhone} <span className="text-[10px] text-gray-500 font-normal">(Primary)</span>
                  </a>
                  {secondaryPhone && (
                    <a href={`tel:${secondaryPhone}`} className="text-gray-400 hover:text-white font-medium transition-colors">
                      {secondaryPhone} <span className="text-[10px] text-gray-500 font-normal">(Secondary)</span>
                    </a>
                  )}
                </div>
              </li>

              <li className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <a 
                  href={`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(`Hello ${businessName}, I would like to inquire about products.`)}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                >
                  WhatsApp Support
                </a>
              </li>

              <li className="flex items-center gap-2.5">
                <InstagramIcon className="w-4 h-4 text-pink-400 shrink-0" />
                <a 
                  href={instagramUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-pink-400 hover:text-pink-300 font-bold transition-colors"
                >
                  Instagram {instagramHandle}
                </a>
              </li>

              <li className="flex items-center gap-2.5 text-gray-400">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors truncate">
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-900 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1 text-emerald-500">
              <ShieldCheck className="w-3.5 h-3.5" /> ₹200 UPI Advance Verified Store
            </span>
            <span>•</span>
            <Link to="/contact" className="hover:text-gray-400">
              Vidisha, Madhya Pradesh
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
