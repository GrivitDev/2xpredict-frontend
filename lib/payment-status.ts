export function getPaymentStatusColor(status: string) {
  switch (status) {
    case 'approved':
      return 'text-green-400 bg-green-900/30';

    case 'pending':
      return 'text-yellow-400 bg-yellow-900/30';

    case 'rejected':
      return 'text-red-400 bg-red-900/30';

    default:
      return 'text-gray-400 bg-gray-800';
  }
}