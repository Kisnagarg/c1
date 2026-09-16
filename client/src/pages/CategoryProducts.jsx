import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, Star } from 'lucide-react';
import API from '../api/axios';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { formatPrice } from '../utils/helpers';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../utils/initialData';

export default function CategoryProducts() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          API.get(`/categories/${slug}`).catch(() => ({ data: { category: null } })),
          API.get(`/products?category=${slug}&limit=50`).catch(() => ({ data: { products: [] } }))
        ]);

        if (catRes.data?.category) {
          setCategory(catRes.data.category);
          setProducts(prodRes.data?.products || []);
        } else {
          // Fallback to initial seed data
          const fallbackCat = INITIAL_CATEGORIES.find(c => c.slug === slug);
          const fallbackProds = INITIAL_PRODUCTS.filter(p => p.category?.slug === slug);
          setCategory(fallbackCat || null);
          setProducts(fallbackProds);
        }
      } catch (error) {
        const fallbackCat = INITIAL_CATEGORIES.find(c => c.slug === slug);
        const fallbackProds = INITIAL_PRODUCTS.filter(p => p.category?.slug === slug);
        setCategory(fallbackCat || null);
        setProducts(fallbackProds);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!category) return (
    <div className="text-center py-20 bg-gray-50 min-h-[60vh] flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Category not found</h2>
      <p className="text-gray-500 mb-6">The category you are looking for does not exist or has been hidden.</p>
      <Link to="/categories">
        <Button>Back to All Categories</Button>
      </Link>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to="/categories" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Categories
        </Link>

        {/* Category Header */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="w-32 h-32 md:w-44 md:h-44 shrink-0 rounded-2xl overflow-hidden shadow-md relative z-10 border border-gray-100 bg-gray-900">
            <img 
              src={category.image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop'} 
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="text-center md:text-left relative z-10 flex-1">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Category Catalog</span>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mt-1 mb-3">{category.name}</h1>
            <p className="text-base text-gray-600 mb-6 max-w-2xl leading-relaxed">{category.description}</p>
            <div className="inline-block bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full font-bold text-xs border border-primary-100">
              {products.length} Products Found
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product._id || product.slug} className="group hover:-translate-y-1.5 transition-all duration-300 hover:shadow-xl flex flex-col justify-between h-full bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <Link to={`/products/${product.slug}`} className="flex flex-col h-full justify-between">
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
                      <h3 className="font-bold text-gray-900 text-base mb-1.5 line-clamp-1 group-hover:text-primary-600 transition-colors">
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
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No products found in this category</h3>
            <p className="text-gray-500 text-sm mb-6">Check back soon or explore other categories.</p>
            <Link to="/products">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
