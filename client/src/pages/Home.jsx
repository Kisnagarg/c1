import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Truck, Clock } from 'lucide-react';
import API from '../api/axios';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { formatPrice } from '../utils/helpers';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          API.get('/categories'),
          API.get('/products?limit=4&sort=popular')
        ]);
        setCategories(catsRes.data.categories.slice(0, 4));
        setFeaturedProducts(prodsRes.data.products);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-gray-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 animate-slide-up stagger-1">
            Discover Premium Products
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">
              Book Yours Today.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-300 mb-10 animate-slide-up stagger-2">
            The most reliable platform to reserve exclusive electronics, bestselling books, and trending fashion before they run out.
          </p>
          <div className="flex gap-4 animate-slide-up stagger-3">
            <Link to="/products" className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3.5 rounded-xl font-medium text-lg transition-all shadow-lg hover:shadow-primary-500/25 flex items-center gap-2">
              Explore Products <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/categories" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-medium text-lg transition-all border border-white/10">
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Secure Booking</h3>
              <p className="text-gray-600 text-sm">Your bookings are guaranteed and payments are securely processed.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Fast Fulfillment</h3>
              <p className="text-gray-600 text-sm">Once booked, your items are reserved and processed immediately.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Our dedicated team is always here to help with your reservations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
              <p className="text-gray-600">Find exactly what you're looking for</p>
            </div>
            <Link to="/categories" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat._id} to={`/categories/${cat.slug}`} className="group block">
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-300">
                  <img 
                    src={cat.image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop'} 
                    alt={cat.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{cat.name}</h3>
                    <p className="text-gray-300 text-sm">{cat.productCount} Products</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Trending Products</h2>
              <p className="text-gray-600">The most booked items this week</p>
            </div>
            <Link to="/products" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product._id} className="group hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
                <Link to={`/products/${product.slug}`}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img 
                      src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply p-4"
                    />
                    {!product.isAvailable && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1 text-sm text-amber-500 mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{product.ratingAvg.toFixed(1)}</span>
                      <span className="text-gray-400 ml-1">({product.ratingCount})</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{product.category?.name}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-md ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {product.stock > 0 ? `${product.stock} left` : 'Sold out'}
                      </span>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
