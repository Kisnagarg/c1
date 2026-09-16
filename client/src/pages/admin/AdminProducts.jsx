import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Filter, Eye, EyeOff, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatPrice } from '../../utils/helpers';

export default function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [stockFilter, setStockFilter] = useState(searchParams.get('stockStatus') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const page = parseInt(searchParams.get('page')) || 1;

  // Fetch categories for filter dropdown
  useEffect(() => {
    API.get('/categories?includeInactive=true')
      .then(res => setCategories(res.data.categories || []))
      .catch(() => {});
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('includeInactive', 'true');
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (stockFilter) params.append('stockStatus', stockFilter);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page);
      params.append('limit', 15);
      
      const res = await API.get(`/products?${params.toString()}`);
      setProducts(res.data.products || []);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedCategory) params.append('category', selectedCategory);
    if (stockFilter) params.append('stockStatus', stockFilter);
    if (statusFilter) params.append('status', statusFilter);
    params.append('page', 1);
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setStockFilter('');
    setStatusFilter('');
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
  };

  // Quick toggle product active state
  const toggleActive = async (product) => {
    const newActive = !product.isActive;
    try {
      await API.put(`/products/${product._id}`, { isActive: newActive });
      toast.success(`Product is now ${newActive ? 'Active' : 'Inactive'}`);
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isActive: newActive } : p));
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await API.delete(`/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your store catalog, pricing, stock levels, multi-image galleries, and visibility.
          </p>
        </div>
        <Link to="/admin/products/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 shadow-sm">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="">All Stock Levels</option>
              <option value="in">In Stock (&gt; 5)</option>
              <option value="low">Low Stock (1 - 5)</option>
              <option value="out">Out of Stock (0)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1">
              Filter
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleResetFilters}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {/* Products Table */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 flex justify-center"><Spinner size="lg" /></div>
          ) : products.length > 0 ? (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const isLowStock = product.stock > 0 && product.stock <= 5;
                  const isOutOfStock = product.stock <= 0;
                  const isProductActive = product.isActive !== false;

                  return (
                    <tr 
                      key={product._id} 
                      className={`hover:bg-gray-50 transition-colors ${!isProductActive ? 'bg-gray-50/60 opacity-75' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 line-clamp-1">{product.name}</div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full ${
                          isOutOfStock 
                            ? 'bg-red-100 text-red-800' 
                            : isLowStock 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isLowStock && <AlertTriangle className="w-3 h-3" />}
                          {product.stock} {isOutOfStock ? 'Out of stock' : isLowStock ? 'Low stock' : 'in stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleActive(product)}
                          title={isProductActive ? 'Click to make inactive' : 'Click to make active'}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            isProductActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {isProductActive ? (
                            <>
                              <Eye className="w-3 h-3" /> Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <Link to={`/admin/products/${product._id}/edit`}>
                          <Button variant="ghost" size="sm" className="px-2">
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="px-2"
                          onClick={() => handleDelete(product._id, product.name)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-16 text-center text-gray-500">
              No products found matching your search and filter criteria.
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Page {pagination.current} of {pagination.pages} ({pagination.total} total items)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current <= 1}
                onClick={() => handlePageChange(pagination.current - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current >= pagination.pages}
                onClick={() => handlePageChange(pagination.current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
