const API = process.env.NEXT_PUBLIC_API_URL;

export async function getPendingPayments(token: string) {
  const res = await fetch(`${API}/payments/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function approvePayment(token: string, id: string) {
  const res = await fetch(`${API}/payments/${id}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function rejectPayment(token: string, id: string) {
  const res = await fetch(`${API}/payments/${id}/reject`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}