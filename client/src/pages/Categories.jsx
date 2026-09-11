import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import Spinner from '../components/ui/Spinner';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/categories')
      .then(res => setCategories(res.data.categories))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 animate-slide-up stagger-1">Browse Categories</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-slide-up stagger-2">
            Explore our wide range of premium products organized just for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, index) => (
            <Link 
              key={cat._id} 
              to={`/categories/${cat.slug}`} 
              className={`group animate-slide-up stagger-${(index % 5) + 1}`}
            >
              <div className="relative h-80 rounded-3xl overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2">
                <img 
                  src={cat.image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop'} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-sm">{cat.name}</h2>
                    <p className="text-gray-200 text-sm mb-4 line-clamp-2 drop-shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      {cat.description}
                    </p>
                    <div className="inline-flex items-center text-sm font-medium text-white bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                      {cat.productCount} Products Available
                    </div>
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
