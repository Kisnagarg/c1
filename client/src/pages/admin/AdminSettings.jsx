import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Building2, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  QrCode, 
  IndianRupee, 
  Save, 
  Upload, 
  X, 
  CheckCircle2, 
  Eye, 
  ShieldCheck, 
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import API from '../../api/axios';
import { useSettings } from '../../context/SettingsContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';

export default function AdminSettings() {
  const { settings, refreshSettings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    address: '',
    primaryPhone: '',
    secondaryPhone: '',
    whatsappNumber: '',
    email: '',
    upiId: '',
    upiQrImage: '',
    advanceAmount: 200
  });

  useEffect(() => {
    API.get('/settings')
      .then(res => {
        if (res.data?.settings) {
          setFormData({
            businessName: res.data.settings.businessName || 'Rathore Electronics',
            ownerName: res.data.settings.ownerName || 'Mahendra Rathore',
            address: res.data.settings.address || 'Main Bus Stand, Atari Khejda, Vidisha, Madhya Pradesh',
            primaryPhone: res.data.settings.primaryPhone || '8435930113',
            secondaryPhone: res.data.settings.secondaryPhone || '7067586087',
            whatsappNumber: res.data.settings.whatsappNumber || '8435930113',
            email: res.data.settings.email || 'support@rathoreelectronics.com',
            upiId: res.data.settings.upiId || '8435930113@upi',
            upiQrImage: res.data.settings.upiQrImage || '',
            advanceAmount: res.data.settings.advanceAmount !== undefined ? res.data.settings.advanceAmount : 200
          });
        }
      })
      .catch(err => {
        toast.error('Failed to load current settings.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'advanceAmount' ? Number(value) : value
    }));
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(true);
    const form = new FormData();
    form.append('image', file);
    form.append('folder', 'rathore_electronics/qr');

    try {
      const res = await API.post('/upload/single', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, upiQrImage: res.data.url }));
      toast.success('UPI QR code uploaded successfully!');
    } catch (error) {
      // Fallback preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, upiQrImage: reader.result }));
        toast.success('QR Code image preview loaded.');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put('/settings', formData);
      toast.success(res.data.message || 'Business settings saved successfully!');
      refreshSettings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update business settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-primary-600" />
            Store Business & Payment Settings
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your store information, contact numbers, UPI QR code, and ₹200 advance payment rules without modifying code.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Business Profile & Contact Details */}
        <Card className="p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Building2 className="w-5 h-5 text-primary-600" /> Business Profile & Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-gray-400" /> Store / Business Name *
              </label>
              <input
                type="text"
                name="businessName"
                required
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 text-sm font-semibold text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-400" /> Shop Owner Name *
              </label>
              <input
                type="text"
                name="ownerName"
                required
                value={formData.ownerName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 text-sm font-semibold text-gray-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" /> Business Address *
              </label>
              <textarea
                name="address"
                rows={2}
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 text-sm font-medium text-gray-900 resize-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Displayed in website footer, Contact Us page, and order confirmation receipts.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-primary-600" /> Primary Contact Number *
              </label>
              <input
                type="tel"
                name="primaryPhone"
                required
                value={formData.primaryPhone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 text-sm font-semibold text-gray-900"
              />
              <p className="text-[11px] text-gray-500 mt-1">Main call & customer support line.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-indigo-600" /> Secondary Contact Number
              </label>
              <input
                type="tel"
                name="secondaryPhone"
                value={formData.secondaryPhone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 text-sm font-semibold text-gray-900"
              />
              <p className="text-[11px] text-gray-500 mt-1">Alternate contact number for order tracking.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" /> WhatsApp Support Number *
              </label>
              <input
                type="tel"
                name="whatsappNumber"
                required
                value={formData.whatsappNumber}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 text-sm font-semibold text-gray-900"
              />
              <p className="text-[11px] text-gray-500 mt-1">Used for customer WhatsApp direct chat buttons.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-600" /> Official Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 text-sm font-semibold text-gray-900"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Advance Payment & UPI QR Code */}
        <Card className="p-6 sm:p-8 shadow-sm border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/20 to-white">
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 border-b border-gray-100 pb-3">
            <QrCode className="w-5 h-5 text-indigo-600" /> UPI Advance Payment Configuration
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            Configure the advance payment amount and UPI handle shown to customers during checkout.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Payment Fields */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-emerald-600" /> Advance Payment Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    name="advanceAmount"
                    required
                    value={formData.advanceAmount}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 font-black text-lg text-primary-700"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Default: ₹200. Deducted as an advance from total order price.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-primary-600" /> UPI ID / VPA *
                </label>
                <input
                  type="text"
                  name="upiId"
                  required
                  placeholder="e.g. 8435930113@upi or 8435930113@ybl"
                  value={formData.upiId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 font-mono text-sm font-bold text-gray-900"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  The UPI address where customers transfer the ₹200 advance payment.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Custom UPI QR Code Image URL (Optional)
                </label>
                <input
                  type="url"
                  name="upiQrImage"
                  placeholder="https://res.cloudinary.com/... or upload below"
                  value={formData.upiQrImage}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 text-xs font-mono text-gray-700"
                />
              </div>
            </div>

            {/* QR Code Upload & Preview Area */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center flex flex-col items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 block">
                UPI QR Code Preview
              </span>

              {formData.upiQrImage ? (
                <div className="relative mb-4 group">
                  <img 
                    src={formData.upiQrImage} 
                    alt="Custom UPI QR" 
                    className="w-48 h-48 object-contain bg-white rounded-2xl p-2 shadow-md border"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, upiQrImage: '' }))}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors cursor-pointer"
                    title="Remove QR Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-48 h-48 bg-white rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 mb-4 text-gray-400">
                  <QrCode className="w-16 h-16 mb-2 text-gray-300" />
                  <span className="text-xs font-medium text-center text-gray-500">
                    Auto-generated dynamic QR code will be displayed to customers
                  </span>
                </div>
              )}

              {/* Upload or Replace Button */}
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:border-primary-500 rounded-xl text-xs font-bold text-gray-700 hover:text-primary-600 cursor-pointer shadow-sm transition-all">
                <Upload className="w-4 h-4" />
                <span>{formData.upiQrImage ? 'Replace QR Code Image' : 'Upload Shop QR Code (Cloudinary)'}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleQrUpload}
                  disabled={uploadingQr}
                />
              </label>
              {uploadingQr && <p className="text-xs text-primary-600 font-semibold mt-2">Uploading QR Image...</p>}
            </div>

          </div>
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Changes persist immediately to MongoDB Atlas database.</span>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/20 flex items-center gap-2"
            isLoading={saving}
          >
            <Save className="w-5 h-5" /> Save Business Settings
          </Button>
        </div>

      </form>
    </div>
  );
}
