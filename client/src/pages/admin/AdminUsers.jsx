import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UserX, UserCheck } from 'lucide-react';
import API from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatPrice, formatDate } from '../../utils/helpers';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (id, currentStatus, name) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} access for ${name}?`)) {
      setUpdatingId(id);
      try {
        await API.put(`/admin/users/${id}`);
        toast.success(`User ${currentStatus ? 'disabled' : 'enabled'} successfully`);
        // Update local state
        setUsers(users.map(u => 
          u._id === id ? { ...u, isActive: !currentStatus } : u
        ));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update user');
      } finally {
        setUpdatingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center"><Spinner /></div>
          ) : users.length > 0 ? (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Bookings</th>
                  <th className="px-6 py-4">Total Spent</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className={`transition-colors ${!u.isActive ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                          {u.phone && <div className="text-xs text-gray-400 mt-0.5">{u.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{u.bookingCount}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {formatPrice(u.totalSpent)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.isActive ? 'success' : 'danger'}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant={u.isActive ? 'danger' : 'outline'}
                        size="sm"
                        isLoading={updatingId === u._id}
                        onClick={() => toggleUserStatus(u._id, u.isActive, u.name)}
                        className="text-xs py-1"
                      >
                        {u.isActive ? (
                          <><UserX className="w-3 h-3 mr-1" /> Disable</>
                        ) : (
                          <><UserCheck className="w-3 h-3 mr-1" /> Enable</>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-500">No users found.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
