const API = process.env.NEXT_PUBLIC_API_URL;

export async function getPlanConfig(token: string) {
  const res = await fetch(`${API}/plan-config`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function updatePlanConfig(token: string, data: any) {
  const res = await fetch(`${API}/plan-config`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
}