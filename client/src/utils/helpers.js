export function formatPrice(price) {
  if (price === undefined || price === null || isNaN(Number(price))) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
}

export function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getOrderStatusLabel(status) {
  const map = {
    awaiting_advance: 'Awaiting Advance Payment',
    awaiting_verification: 'Awaiting Payment Verification',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Ready / Shipped',
    ready: 'Ready / Shipped',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Awaiting Advance Payment'
  };
  return map[status] || status || 'Pending';
}

export function getPaymentStatusLabel(status) {
  const map = {
    awaiting_payment: 'Awaiting Payment',
    pending_verification: 'Pending Verification',
    verified: 'Verified',
    rejected: 'Rejected'
  };
  return map[status] || status || 'Awaiting Payment';
}

export function getStatusColor(status) {
  const colors = {
    awaiting_advance: 'bg-amber-100 text-amber-800 border-amber-200',
    awaiting_verification: 'bg-purple-100 text-purple-800 border-purple-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    shipped: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    ready: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
    // Fallbacks
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    verified: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 border-rose-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getPaymentStatusColor(status) {
  const colors = {
    awaiting_payment: 'bg-amber-100 text-amber-800 border-amber-200',
    pending_verification: 'bg-purple-100 text-purple-800 border-purple-200',
    verified: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 border-rose-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function truncate(str, len = 80) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}
