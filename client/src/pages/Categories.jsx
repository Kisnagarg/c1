import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import Spinner from '../components/ui/Spinner';
import { INITIAL_CATEGORIES } from '../utils/initialData';

export default function Categories() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/categories')
      .then(res => {
        if (res.data?.categories && res.data.categories.length > 0) {
          setCategories(res.data.categories);
        }
      })
      .catch(() => {
        setCategories(INITIAL_CATEGORIES);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Explore Collections</span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mt-1 mb-3">Browse All Categories</h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Explore our 8 specialized product categories with certified quality and fast reservation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat._id || cat.slug} 
              to={`/categories/${cat.slug}`} 
              className="group block"
            >
              <div className="relative h-80 rounded-3xl overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2 bg-gray-900 border border-gray-100">
                <img 
                  src={cat.image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop'} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300"></div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h2 className="text-xl font-black text-white mb-1.5 drop-shadow-sm group-hover:text-primary-300 transition-colors">{cat.name}</h2>
                  {cat.description && (
                    <p className="text-gray-300 text-xs mb-3 line-clamp-2 drop-shadow-sm opacity-90">
                      {cat.description}
                    </p>
                  )}
                  <div className="inline-flex items-center text-xs font-bold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 self-start">
                    {cat.productCount || 2} Products Available
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
