import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Eye, EyeOff, Upload, Image as ImageIcon, ArrowUpDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true,
    displayOrder: 0
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Include inactive categories for admin management
      const res = await API.get('/categories?includeInactive=true');
      setCategories(res.data.categories || []);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category = null) => {
    if (category) {
      setIsEditing(true);
      setCurrentId(category._id);
      setFormData({
        name: category.name || '',
        description: category.description || '',
        image: category.image || '',
        isActive: category.isActive !== undefined ? category.isActive : true,
        displayOrder: category.displayOrder || 0
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        isActive: true,
        displayOrder: categories.length + 1
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', description: '', image: '', isActive: true, displayOrder: 0 });
  };

  // Handle direct file upload to Cloudinary
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    const data = new FormData();
    data.append('image', file);

    setUploadingImage(true);
    try {
      const res = await API.post('/upload/single', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image: res.data.url }));
      toast.success('Image uploaded successfully to cloud!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Upload failed. You can paste an image URL instead.';
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await API.put(`/categories/${currentId}`, formData);
        toast.success('Category updated successfully');
      } else {
        await API.post('/categories', formData);
        toast.success('Category created successfully');
      }
      closeModal();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick toggle category visibility
  const toggleVisibility = async (cat) => {
    const updatedStatus = !cat.isActive;
    try {
      await API.put(`/categories/${cat._id}`, { isActive: updatedStatus });
      toast.success(`Category "${cat.name}" is now ${updatedStatus ? 'visible' : 'hidden'}`);
      setCategories(prev => prev.map(c => c._id === cat._id ? { ...c, isActive: updatedStatus } : c));
    } catch (error) {
      toast.error('Failed to update category visibility');
    }
  };

  const handleDelete = async (id, name, productCount) => {
    if (productCount > 0) {
      toast.error(`Cannot delete category. ${productCount} active product(s) are still assigned to it.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the category "${name}"? This action cannot be undone.`)) {
      try {
        await API.delete(`/categories/${id}`);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create, reorder, upload images, and control visibility of your store categories.
          </p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 flex justify-center"><Spinner size="lg" /></div>
          ) : categories.length > 0 ? (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-4 py-4 text-center">Order</th>
                  <th className="px-6 py-4 text-center">Products</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr key={cat._id} className={`hover:bg-gray-50 transition-colors ${!cat.isActive ? 'bg-gray-50/60 opacity-75' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shadow-sm border border-gray-200">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{cat.name}</div>
                      {cat.description && (
                        <div className="text-xs text-gray-500 line-clamp-1 max-w-xs mt-0.5">{cat.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500 text-xs">{cat.slug}</td>
                    <td className="px-4 py-4 text-center font-medium text-gray-700">
                      {cat.displayOrder || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-primary-50 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full border border-primary-100">
                        {cat.productCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleVisibility(cat)}
                        title={cat.isActive ? 'Click to hide category from store' : 'Click to show category on store'}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                          cat.isActive 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {cat.isActive ? (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Visible
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Hidden
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <Button variant="ghost" size="sm" className="px-2" onClick={() => openModal(cat)}>
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="px-2"
                        onClick={() => handleDelete(cat._id, cat.name, cat.productCount)}
                        disabled={cat.productCount > 0}
                        title={cat.productCount > 0 ? 'Cannot delete category with products' : 'Delete category'}
                      >
                        <Trash2 className={`w-4 h-4 ${cat.productCount > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-red-600'}`} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-16 text-center text-gray-500">
              No categories found. Click "Add Category" above to create your first category.
            </div>
          )}
        </div>
      </Card>

      {/* Category Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-lg animate-slide-up relative my-8 shadow-2xl">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {isEditing ? 'Edit Category' : 'Add New Category'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Category Name *"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Drones, Toys, Mixers..."
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2.5 border"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short summary displayed on cards and category header..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <ArrowUpDown className="w-4 h-4 text-gray-400" /> Display Order
                    </label>
                    <input
                      type="number"
                      className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Visibility</label>
                    <div className="flex items-center gap-3 pt-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        {formData.isActive ? 'Visible to customers' : 'Hidden from store'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Image Upload & URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Image</label>
                  
                  {/* Image Preview */}
                  {formData.image && (
                    <div className="relative w-full h-36 mb-3 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed rounded-xl cursor-pointer transition-colors ${
                      uploadingImage ? 'bg-gray-100 text-gray-400 border-gray-300' : 'bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-700'
                    }`}>
                      <Upload className="w-4 h-4 text-primary-600" />
                      <span className="text-xs font-medium">
                        {uploadingImage ? 'Uploading to Cloud...' : 'Upload Image File (Cloudinary)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <Input
                    name="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Or enter direct Image URL (e.g. Unsplash, CDN)"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
                  <Button type="submit" isLoading={submitting}>
                    {isEditing ? 'Save Changes' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
