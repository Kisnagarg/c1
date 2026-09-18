import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Truck, Clock, Sparkles, ExternalLink, MessageSquare } from 'lucide-react';
import InstagramIcon from '../components/ui/InstagramIcon';
import API from '../api/axios';
import { useSettings } from '../context/SettingsContext';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { formatPrice } from '../utils/helpers';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../utils/initialData';

export default function Home() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [featuredProducts, setFeaturedProducts] = useState(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          API.get('/categories').catch(() => ({ data: { categories: [] } })),
          API.get('/products?limit=8&sort=popular').catch(() => ({ data: { products: [] } }))
        ]);

        if (catsRes.data?.categories && catsRes.data.categories.length > 0) {
          setCategories(catsRes.data.categories);
        }
        if (prodsRes.data?.products && prodsRes.data.products.length > 0) {
          setFeaturedProducts(prodsRes.data.products);
        }
      } catch (error) {
        console.warn('Using initial seed fallback data for display:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-950 via-primary-950 to-gray-900 text-white overflow-hidden pt-12 pb-24 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-overlay opacity-25"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-primary-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            Premium Multi-Category Store & Booking
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 max-w-4xl leading-tight">
            Discover Top Electronics,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-300 to-purple-400">
              Drones & Home Appliances.
            </span>
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-gray-300 mb-10 leading-relaxed">
            Reserve the latest RC toys, industrial cables, fast chargers, kitchen mixers, and smart lighting before inventory runs out.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              to="/products" 
              className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3.5 rounded-2xl font-bold text-base transition-all shadow-xl hover:shadow-primary-500/30 flex items-center gap-2 hover:-translate-y-0.5"
            >
              Explore All Products <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/categories" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-3.5 rounded-2xl font-bold text-base transition-all border border-white/15 hover:-translate-y-0.5"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="py-10 bg-white border-b border-gray-100 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary-200 transition-colors">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-1">Guaranteed Reservations</h3>
              <p className="text-gray-600 text-xs leading-relaxed">Your orders are reserved immediately and securely processed in our catalog.</p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary-200 transition-colors">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-1">Direct Warehouse Dispatch</h3>
              <p className="text-gray-600 text-xs leading-relaxed">Fast fulfillment from verified brand distributors with quality checks.</p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary-200 transition-colors">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-1">24/7 Dedicated Support</h3>
              <p className="text-gray-600 text-xs leading-relaxed">Our support team is available around the clock to assist with your bookings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories (8 Categories Showcase) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-primary-600 font-bold text-xs uppercase tracking-wider">Catalog Navigation</span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-1">Shop by Category</h2>
              <p className="text-gray-600 text-sm mt-1">Discover products organized by our 8 signature categories.</p>
            </div>
            <Link to="/categories" className="text-primary-600 font-bold hover:text-primary-700 flex items-center gap-1 text-sm shrink-0">
              View All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat._id || cat.slug} to={`/categories/${cat.slug}`} className="group block">
                <div className="relative h-72 rounded-3xl overflow-hidden shadow-sm group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-300 border border-gray-200/80 bg-gray-900">
                  <img 
                    src={cat.image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop'} 
                    alt={cat.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent"></div>
                  
                  {/* Category Card Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col justify-end">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-lg font-black text-white group-hover:text-primary-300 transition-colors">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 shrink-0">
                        {cat.productCount || 2} Items
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-gray-300 text-xs line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured / Trending Products */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-primary-600 font-bold text-xs uppercase tracking-wider">Top Rated</span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-1">Trending Products</h2>
              <p className="text-gray-600 text-sm mt-1">Our most popular and booked items this week.</p>
            </div>
            <Link to="/products" className="text-primary-600 font-bold hover:text-primary-700 flex items-center gap-1 text-sm shrink-0">
              View Entire Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product._id || product.slug} className="group hover:-translate-y-1.5 transition-all duration-300 hover:shadow-xl border border-gray-100 rounded-3xl overflow-hidden flex flex-col justify-between">
                <Link to={`/products/${product.slug}`}>
                  <div className="relative aspect-square overflow-hidden bg-gray-50 p-4">
                    <img 
                      src={product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop'} 
                      alt={product.name} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {product.ratingAvg?.toFixed(1) || '4.8'}
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider">
                        {product.category?.name || 'Electronic'}
                      </span>
                      <h3 className="font-bold text-gray-900 text-base mt-1 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 text-xs line-clamp-2 mb-4">
                        {product.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium">Price</span>
                        <span className="text-lg font-black text-gray-900">{formatPrice(product.price)}</span>
                      </div>
                      <span className="text-xs font-bold px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        Book Now
                      </span>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Official Instagram & Social Media Section */}
      <section className="py-16 bg-gradient-to-br from-purple-950 via-pink-950 to-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(236,72,153,0.15),transparent_60%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 sm:p-12 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="space-y-3 text-center lg:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold uppercase tracking-wider">
                <InstagramIcon className="w-4 h-4 text-pink-400" /> Official Instagram
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Follow Us on Instagram
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Stay updated with our latest product arrivals, drone flight unboxings, new electronic inventory drops, and store offers at <strong>{settings.instagramHandle || '@rathore_electronics_'}</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <a
                href={settings.instagramUrl || 'https://www.instagram.com/rathore_electronics_/'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-base text-white bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 shadow-xl shadow-pink-600/30 hover:scale-105 transition-all"
              >
                <InstagramIcon className="w-5 h-5" />
                <span>Follow {settings.instagramHandle || '@rathore_electronics_'}</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </a>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm text-gray-200 bg-white/10 hover:bg-white/20 border border-white/15 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Store</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
