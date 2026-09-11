import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import API from '../api/axios';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { formatPrice } from '../utils/helpers';
import { Star } from 'lucide-react';

export default function CategoryProducts() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          API.get(`/categories/${slug}`),
          API.get(`/products?category=${slug}&limit=50`)
        ]);
        setCategory(catRes.data.category);
        setProducts(prodRes.data.products);
      } catch (error) {
        console.error('Error fetching category products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!category) return <div className="text-center py-20">Category not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to="/categories" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Categories
        </Link>

        {/* Category Header */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-2xl overflow-hidden shadow-lg relative z-10">
            <img 
              src={category.image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop'} 
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="text-center md:text-left relative z-10 flex-1">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">{category.name}</h1>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl">{category.description}</p>
            <div className="inline-block bg-primary-50 text-primary-700 px-4 py-2 rounded-lg font-medium text-sm">
              {products.length} Products Found
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product._id} className="group hover:-translate-y-1 transition-all duration-300 hover:shadow-xl flex flex-col h-full">
                <Link to={`/products/${product.slug}`} className="flex flex-col h-full">
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 shrink-0">
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
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-1 text-sm text-amber-500 mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{product.ratingAvg.toFixed(1)}</span>
                      <span className="text-gray-400 ml-1">({product.ratingCount})</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
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
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">We couldn't find any products in this category right now.</p>
          </div>
        )}

      </div>
    </div>
  );
}
