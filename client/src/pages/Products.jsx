import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, Filter, X, Search, Sparkles } from 'lucide-react';
import API from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { formatPrice } from '../utils/helpers';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../utils/initialData';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: INITIAL_PRODUCTS.length, pages: 1, current: 1 });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [available, setAvailable] = useState(searchParams.get('available') === 'true');
  const page = parseInt(searchParams.get('page')) || 1;

  // Load categories
  useEffect(() => {
    API.get('/categories')
      .then(res => {
        if (res.data?.categories && res.data.categories.length > 0) {
          setCategories(res.data.categories);
        }
      })
      .catch(() => {
        setCategories(INITIAL_CATEGORIES);
      });
  }, []);

  // Fetch products or filter initial data
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (sort) params.append('sort', sort);
        if (available) params.append('available', 'true');
        params.append('page', page);

        const res = await API.get(`/products?${params.toString()}`);
        if (res.data?.products && res.data.products.length > 0) {
          setProducts(res.data.products);
          setPagination(res.data.pagination);
        } else if (res.data?.products && res.data.products.length === 0 && searchParams.toString()) {
          // Empty search results from server
          setProducts([]);
          setPagination({ total: 0, pages: 1, current: 1 });
        } else {
          // Fallback to client-side filtering on initial data
          filterLocalData();
        }
      } catch (error) {
        // Fallback to local filtering
        filterLocalData();
      } finally {
        setLoading(false);
      }
    };

    const filterLocalData = () => {
      let filtered = [...INITIAL_PRODUCTS];
      if (search) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
      }
      if (category) {
        filtered = filtered.filter(p => p.category?.slug === category);
      }
      if (minPrice) {
        filtered = filtered.filter(p => p.price >= Number(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter(p => p.price <= Number(maxPrice));
      }
      if (available) {
        filtered = filtered.filter(p => p.stock > 0);
      }

      if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
      else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
      else if (sort === 'popular') filtered.sort((a, b) => b.ratingAvg - a.ratingAvg);

      setProducts(filtered);
      setPagination({ total: filtered.length, pages: 1, current: 1 });
    };

    fetchProducts();
  }, [searchParams]);

  const handleApplyFilters = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (sort) params.append('sort', sort);
    if (available) params.append('available', 'true');
    params.append('page', 1);
    
    setSearchParams(params);
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setAvailable(false);
    setSearchParams(new URLSearchParams());
    setShowMobileFilters(false);
  };

  const filterFormContent = (
    <form onSubmit={handleApplyFilters} className="space-y-6">
      {/* Categories */}
      <div>
        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Categories</label>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-primary-600">
            <input
              type="radio"
              name="filterCategory"
              checked={category === ''}
              onChange={() => setCategory('')}
              className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <span className="font-medium">All Categories</span>
          </label>
          {categories.map(cat => (
            <label key={cat._id || cat.slug} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-primary-600">
              <input
                type="radio"
                name="filterCategory"
                checked={category === cat.slug}
                onChange={() => setCategory(cat.slug)}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="line-clamp-1">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-gray-100 pt-5">
        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Price Range (₹)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min="0"
            className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white focus:ring-primary-500 focus:border-primary-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min="0"
            className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="border-t border-gray-100 pt-5">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
          />
          <span>In Stock Only</span>
        </label>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" size="sm" className="flex-1 text-xs" onClick={clearFilters}>
          Clear
        </Button>
        <Button type="submit" size="sm" className="flex-1 text-xs">
          Apply Filters
        </Button>
      </div>
    </form>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">All Products Catalog</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Showing {products.length} of {pagination?.total || products.length} available items
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-gray-50/50"
              />
            </div>
            
            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                const params = new URLSearchParams(searchParams);
                params.set('sort', e.target.value);
                setSearchParams(params);
              }}
              className="border border-gray-300 rounded-xl text-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 bg-white font-medium shrink-0"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
            
            {/* Mobile Filter Toggle Button */}
            <Button 
              variant="outline" 
              className="md:hidden flex items-center gap-1.5 px-3 py-2 text-sm"
              onClick={() => setShowMobileFilters(true)}
            >
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>
        </div>

        {/* Main Catalog Layout */}
        <div className="flex flex-col md:flex-row items-start gap-8">
          
          {/* Desktop Sidebar (Always in flow, fixed width, never translated off-screen) */}
          <aside className="hidden md:block w-72 shrink-0 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary-600" /> Filter Catalog
            </h2>
            {filterFormContent}
          </aside>

          {/* Mobile Filter Drawer Modal */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm md:hidden">
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl relative">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary-600" /> Filter Products
                  </h2>
                  <button onClick={() => setShowMobileFilters(false)} className="p-1 text-gray-400 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {filterFormContent}
              </div>
            </div>
          )}

          {/* Product Grid Area */}
          <div className="flex-1 w-full">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product._id || product.slug} className="group hover:-translate-y-1.5 transition-all duration-300 hover:shadow-xl border border-gray-100 rounded-3xl overflow-hidden flex flex-col justify-between bg-white">
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
                            {product.category?.name || 'Electronics'}
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
                          <span className="text-xs font-bold px-3.5 py-1.5 bg-primary-50 text-primary-700 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-colors">
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
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                  We couldn't find any products matching your selected search or filter criteria.
                </p>
                <Button onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
