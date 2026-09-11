import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Truck, ShieldCheck, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import API from '../api/axios';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { formatPrice } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${slug}`);
        setProduct(res.data.product);
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  
  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!user) {
      navigate('/login', { state: { from: `/booking/${product.slug}?qty=${quantity}` } });
    } else {
      navigate(`/booking/${product.slug}?qty=${quantity}`);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/products" className="hover:text-primary-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Products
          </Link>
          <span>/</span>
          <Link to={`/categories/${product.category?.slug}`} className="hover:text-primary-600">
            {product.category?.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Product Image */}
          <div className="bg-gray-50 rounded-3xl p-8 flex items-center justify-center aspect-square md:aspect-auto md:h-[600px]">
            <img 
              src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop'} 
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm mb-4">
              <span className={`px-2.5 py-1 rounded-full font-medium ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.isAvailable ? 'In Stock' : 'Out of Stock'}
              </span>
              <span className="text-gray-500">{product.stock} units left</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.ratingAvg) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">{product.ratingAvg.toFixed(1)} Rating</span>
              <span className="text-sm text-blue-600 hover:underline cursor-pointer">{product.ratingCount} Reviews</span>
            </div>

            <div className="text-3xl font-bold text-gray-900 mb-6">
              {formatPrice(product.price)}
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-8 border-b border-gray-100 pb-8">
              {product.description}
            </p>

            {/* Booking Actions */}
            <div className="bg-gray-50 p-6 rounded-2xl mb-8">
              <div className="flex items-center gap-4 mb-6">
                <label className="font-medium text-gray-900">Quantity</label>
                <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!product.isAvailable}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >-</button>
                  <span className="w-12 text-center font-medium border-x border-gray-300 py-2">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={!product.isAvailable || quantity >= product.stock}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >+</button>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full text-lg shadow-lg"
                disabled={!product.isAvailable}
                onClick={handleBookNow}
              >
                {product.isAvailable ? 'Book Now' : 'Currently Unavailable'}
              </Button>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" /> Secure transaction
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-500" /> Fast processing
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary-500" /> Quality guaranteed
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Description & Specs */}
        <div className="mt-20 pt-16 border-t border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Details</h2>
              <div className="prose prose-lg text-gray-600 max-w-none">
                <p className="whitespace-pre-line">{product.detailedDescription || product.description}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
              {product.specifications && product.specifications.length > 0 ? (
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                  <table className="w-full text-sm text-left">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <th className="px-4 py-3 font-medium text-gray-900 border-t border-gray-200 w-1/3">{spec.key}</th>
                          <td className="px-4 py-3 text-gray-600 border-t border-gray-200">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic">No specifications provided.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
