import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Trash2, Plus, Upload, Image as ImageIcon, Star, X } from 'lucide-react';
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    detailedDescription: '',
    image: '',
    images: [],
    isAvailable: true,
    isActive: true,
    specifications: []
  });

  useEffect(() => {
    // Fetch categories dynamically for dropdown
    API.get('/categories?includeInactive=true')
      .then(res => setCategories(res.data.categories || []))
      .catch(() => toast.error('Failed to load categories'));

    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const res = await API.get(`/products/id/${id}`);
          const prod = res.data.product;
          if (prod) {
            const allImages = prod.images && prod.images.length > 0 
              ? prod.images 
              : (prod.image ? [prod.image] : []);

            setFormData({
              name: prod.name || '',
              category: prod.category?._id || prod.category || '',
              price: prod.price?.toString() || '',
              stock: prod.stock?.toString() || '0',
              description: prod.description || '',
              detailedDescription: prod.detailedDescription || '',
              image: prod.image || (allImages[0] || ''),
              images: allImages,
              isAvailable: prod.isAvailable !== undefined ? prod.isAvailable : true,
              isActive: prod.isActive !== undefined ? prod.isActive : true,
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

  // Image Upload via Cloudinary
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    // Validate size
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" is over 10MB limit`);
        return;
      }
    }

    setUploadingImage(true);
    try {
      if (files.length === 1) {
        const data = new FormData();
        data.append('image', files[0]);
        const res = await API.post('/upload/single', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const newUrl = res.data.url;
        setFormData(prev => ({
          ...prev,
          image: prev.image || newUrl,
          images: [...prev.images, newUrl]
        }));
        toast.success('Image uploaded to cloud!');
      } else {
        const data = new FormData();
        files.forEach(f => data.append('images', f));
        const res = await API.post('/upload/multiple', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const newUrls = res.data.urls || [];
        setFormData(prev => ({
          ...prev,
          image: prev.image || newUrls[0],
          images: [...prev.images, ...newUrls]
        }));
        toast.success(`${newUrls.length} images uploaded to cloud!`);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Upload failed. You can paste an image URL instead.';
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  // Add image via URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    const url = imageUrlInput.trim();
    setFormData(prev => ({
      ...prev,
      image: prev.image || url,
      images: [...prev.images, url]
    }));
    setImageUrlInput('');
    toast.success('Image URL added');
  };

  // Remove image
  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => {
      const updatedImages = prev.images.filter((_, idx) => idx !== indexToRemove);
      let newPrimary = prev.image;
      if (prev.images[indexToRemove] === prev.image) {
        newPrimary = updatedImages[0] || '';
      }
      return {
        ...prev,
        image: newPrimary,
        images: updatedImages
      };
    });
  };

  // Set primary thumbnail
  const handleSetPrimary = (url) => {
    setFormData(prev => ({ ...prev, image: url }));
    toast.success('Primary thumbnail updated');
  };

  // Specifications Handlers
  const handleAddSpec = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { key: '', value: '' }]
    });
  };

  const handleRemoveSpec = (index) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index)
    });
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...formData.specifications];
    updated[index][field] = value;
    setFormData({ ...formData, specifications: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.price) {
      toast.error('Please fill in required fields: Name, Category, Price');
      return;
    }

    if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      toast.error('Please enter a valid stock number');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description.trim(),
        detailedDescription: formData.detailedDescription.trim(),
        image: formData.image || (formData.images[0] || ''),
        images: formData.images,
        isAvailable: Number(formData.stock) > 0 && formData.isAvailable,
        isActive: formData.isActive,
        specifications: formData.specifications.filter(s => s.key && s.value)
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/products" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-sm text-gray-500">
              {isEditing ? 'Modify pricing, stock, images, and specifications' : 'Create a new item in your catalog'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            General Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Product Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. SkyHawk 4K Drone, 65W GaN Charger"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2.5 border bg-white"
              >
                <option value="">Select a Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} {!cat.isActive ? '(Hidden)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (₹) *"
                name="price"
                type="number"
                min="0"
                step="any"
                value={formData.price}
                onChange={handleChange}
                placeholder="999"
                required
              />
              <Input
                label="Stock Quantity *"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="10"
                required
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active (Visible on public store)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Available for Booking
                </span>
              </label>
            </div>
          </div>
        </Card>

        {/* Product Images */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Product Images</h2>
              <p className="text-xs text-gray-500">Upload multiple photos. Click star on image to set primary thumbnail.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">
              {formData.images.length} Image(s)
            </span>
          </div>

          {/* Upload Button & URL input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
              uploadingImage ? 'bg-gray-100 text-gray-400 border-gray-300' : 'bg-primary-50/50 hover:bg-primary-50 border-primary-200 text-primary-700'
            }`}>
              <Upload className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-semibold">
                {uploadingImage ? 'Uploading to Cloudinary...' : 'Upload Image File(s)'}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Or paste image URL"
                className="flex-1 rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border"
              />
              <Button type="button" variant="outline" onClick={handleAddImageUrl}>
                Add URL
              </Button>
            </div>
          </div>

          {/* Images Gallery */}
          {formData.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {formData.images.map((imgUrl, idx) => {
                const isPrimary = formData.image === imgUrl;
                return (
                  <div 
                    key={idx} 
                    className={`relative group rounded-xl overflow-hidden aspect-square border-2 bg-gray-50 transition-all ${
                      isPrimary ? 'border-primary-600 ring-2 ring-primary-500/20' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={imgUrl} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                    
                    {/* Primary Badge */}
                    {isPrimary && (
                      <span className="absolute top-2 left-2 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                        Thumbnail
                      </span>
                    )}

                    {/* Action overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(imgUrl)}
                          title="Set as primary thumbnail"
                          className="p-1.5 bg-white text-gray-800 hover:text-primary-600 rounded-lg shadow"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Delete image"
                        className="p-1.5 bg-white text-red-600 hover:bg-red-50 rounded-lg shadow"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 border border-dashed rounded-xl text-center text-gray-400 bg-gray-50/50">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No images added yet. Upload files or enter URLs above.</p>
            </div>
          )}
        </Card>

        {/* Descriptions */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            Product Descriptions
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Summary *</label>
            <textarea
              name="description"
              rows="2"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief 1-2 sentence description shown in product cards..."
              required
              className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2.5 border"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Detailed Description</label>
            <textarea
              name="detailedDescription"
              rows="4"
              value={formData.detailedDescription}
              onChange={handleChange}
              placeholder="Full detailed overview, build quality, included accessories, usage guidelines..."
              className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2.5 border"
            ></textarea>
          </div>
        </Card>

        {/* Specifications */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Specifications</h2>
              <p className="text-xs text-gray-500">Key-value attributes (e.g. Camera: 4K, Wattage: 65W)</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddSpec} className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Spec
            </Button>
          </div>

          {formData.specifications.length > 0 ? (
            <div className="space-y-3">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Feature / Key (e.g. Battery Life)"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                    className="flex-1 rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 35 mins)"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                    className="flex-1 rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(index)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-dashed">
              No specifications added yet. Click "Add Spec" above to create feature rows.
            </div>
          )}
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={submitting} className="flex items-center gap-2 px-6">
            <Save className="w-4 h-4" />
            {isEditing ? 'Save Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
