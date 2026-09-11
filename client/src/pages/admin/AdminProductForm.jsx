import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Trash2, Plus } from 'lucide-react';
import API from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    detailedDescription: '',
    image: '',
    isAvailable: true,
    specifications: []
  });

  useEffect(() => {
    // Fetch categories for dropdown
    API.get('/categories').then(res => setCategories(res.data.categories));

    if (isEditing) {
      // We need to fetch by slug or ID. The API expects slug for public, but we don't have slug here.
      // Wait, our GET /products/:slug is public. Let's create a new API endpoint for GET by ID if needed, 
      // or we can just fetch all products and find it. 
      // Actually, since we only have public /products/:slug, let's fetch products and find by id
      const fetchProduct = async () => {
        try {
          // A bit hacky: get products and find by ID. In a real app we'd add a GET /admin/products/:id route
          const res = await API.get('/products?limit=1000');
          const prod = res.data.products.find(p => p._id === id);
          if (prod) {
            setFormData({
              name: prod.name,
              category: prod.category._id,
              price: prod.price.toString(),
              stock: prod.stock.toString(),
              description: prod.description,
              detailedDescription: prod.detailedDescription || '',
              image: prod.image || '',
              isAvailable: prod.isAvailable,
              specifications: prod.specifications || []
            });
          } else {
            toast.error('Product not found');
            navigate('/admin/products');
          }
        } catch (error) {
          toast.error('Failed to fetch product details');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData({ ...formData, specifications: newSpecs });
  };

  const addSpec = () => {
    setFormData({ ...formData, specifications: [...formData.specifications, { key: '', value: '' }] });
  };

  const removeSpec = (index) => {
    const newSpecs = formData.specifications.filter((_, i) => i !== index);
    setFormData({ ...formData, specifications: newSpecs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.price || !formData.stock || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      if (isEditing) {
        await API.put(`/products/${id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await API.post('/products', payload);
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/products" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Product Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2.5 border bg-white"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <Input
              label="Price ($) *"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
            
            <Input
              label="Stock Quantity *"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
            <Input
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://..."
            />
            {formData.image && (
              <div className="mt-3 w-32 h-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </Card>

        {/* Descriptions */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Descriptions</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={2}
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border resize-none"
                placeholder="A brief summary for the product card..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Detailed Description</label>
              <textarea
                name="detailedDescription"
                value={formData.detailedDescription}
                onChange={handleChange}
                rows={5}
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border"
                placeholder="Full details for the product page..."
              />
            </div>
          </div>
        </Card>

        {/* Specifications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
            <h2 className="text-lg font-bold text-gray-900">Specifications</h2>
            <Button type="button" variant="outline" size="sm" onClick={addSpec} className="flex items-center gap-1 text-xs py-1">
              <Plus className="w-3 h-3" /> Add Spec
            </Button>
          </div>
          
          <div className="space-y-3">
            {formData.specifications.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No specifications added.</p>
            ) : (
              formData.specifications.map((spec, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Key (e.g. Color)"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Value (e.g. Red)"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                    />
                  </div>
                  <Button type="button" variant="ghost" onClick={() => removeSpec(index)} className="px-2 mt-1">
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Status & Submit */}
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Visibility</h2>
              <p className="text-sm text-gray-500 mt-1">Control if this product can be booked by users.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {formData.isAvailable ? 'Active' : 'Inactive'}
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => navigate('/admin/products')}>Cancel</Button>
            <Button type="submit" isLoading={submitting} className="flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Product
            </Button>
          </div>
        </Card>

      </form>
    </div>
  );
}
