import { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function AdminSecurity() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await API.put('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      toast.success(res.data.message || 'Password changed successfully!');
      setSuccessMessage('Your admin password has been updated securely. Please use your new password for your next login.');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-primary-600" />
            Security & Admin Credentials
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Update your admin master password. Keep your credentials private to ensure full store security.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Password Changed Successfully</p>
            <p className="text-sm mt-0.5 text-emerald-700">{successMessage}</p>
          </div>
        </div>
      )}

      <Card className="p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Client Handover Tip:</span> Change your initial default password immediately after receiving store delivery. Do not share your master password with unauthorized personnel.
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-gray-400" /> Current Password
            </label>
            <Input
              type="password"
              name="currentPassword"
              placeholder="Enter your current admin password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-gray-400" /> New Password
            </label>
            <Input
              type="password"
              name="newPassword"
              placeholder="Minimum 6 characters"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-gray-400" /> Confirm New Password
            </label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button type="submit" isLoading={loading} className="px-6">
              Update Admin Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
