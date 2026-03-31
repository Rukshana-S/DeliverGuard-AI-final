export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const getRiskColor = (level) => ({
  low: 'text-green-500',
  medium: 'text-yellow-500',
  high: 'text-orange-500',
  critical: 'text-red-500',
}[level] || 'text-gray-500');

export const getStatusBadge = (status) => ({
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  paid: 'bg-blue-100 text-blue-700',
  investigating: 'bg-purple-100 text-purple-700',
}[status] || 'bg-gray-100 text-gray-700');
