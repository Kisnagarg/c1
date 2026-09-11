import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, Filter, X, Search } from 'lucide-react';
import API from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { formatPrice } from '../utils/helpers';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [available, setAvailable] = useState(searchParams.get('available') === 'true');
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    API.get('/categories').then(res => setCategories(res.data.categories));
  }, []);

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
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]); // Re-fetch when URL changes

  const handleApplyFilters = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (sort) params.append('sort', sort);
    if (available) params.append('available', 'true');
    params.append('page', 1); // Reset to page 1 on filter change
    
    setSearchParams(params);
    setShowFilters(false);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setAvailable(false);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Mobile Filter Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
            <p className="text-gray-600 mt-1">
              {pagination ? `Showing ${products.length} of ${pagination.total} products` : 'Loading...'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                const params = new URLSearchParams(searchParams);
                params.set('sort', e.target.value);
                setSearchParams(params);
              }}
              className="border border-gray-300 rounded-lg text-sm py-2 pl-3 pr-8 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
            
            <Button 
              variant="outline" 
              className="md:hidden flex items-center gap-2"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Filters Sidebar (Desktop) */}
          <div className={`
            fixed inset-0 z-50 bg-white p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out
            md:relative md:inset-auto md:z-auto md:w-64 md:block md:bg-transparent md:p-0 md:transform-none md:overflow-visible
            ${showFilters ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="flex items-center justify-between md:hidden mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="text-gray-500 p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-6">
              {/* Mobile Search */}
              <div className="md:hidden">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <Input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  <div className="flex items-center">
                    <input
                      id="cat-all"
                      type="radio"
                      name="category"
                      checked={category === ''}
                      onChange={() => setCategory('')}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <label htmlFor="cat-all" className="ml-2 text-sm text-gray-700">All Categories</label>
                  </div>
                  {categories.map(cat => (
                    <div key={cat._id} className="flex items-center">
                      <input
                        id={`cat-${cat._id}`}
                        type="radio"
                        name="category"
                        checked={category === cat.slug}
                        onChange={() => setCategory(cat.slug)}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <label htmlFor={`cat-${cat._id}`} className="ml-2 text-sm text-gray-700">{cat.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min="0"
                  />
                  <span className="text-gray-500">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              {/* Availability */}
              <div>
                <div className="flex items-center">
                  <input
                    id="available"
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <label htmlFor="available" className="ml-2 text-sm text-gray-700">
                    Show only in stock
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" className="flex-1" onClick={clearFilters}>
                  Clear
                </Button>
                <Button type="submit" className="flex-1">
                  Apply
                </Button>
              </div>
            </form>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          <p className="text-sm text-gray-500 mb-4">{product.category?.name}</p>
                          
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

                {/* Pagination */}
                {pagination?.pages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <Button 
                      variant="outline" 
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                    >
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {[...Array(pagination.pages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handlePageChange(i + 1)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            page === i + 1 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      disabled={page === pagination.pages}
                      onClick={() => handlePageChange(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
