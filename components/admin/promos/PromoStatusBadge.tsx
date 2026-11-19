export default function PromoStatusBadge({ isActive, startDate, endDate }: { isActive: boolean; startDate?: string; endDate?: string }) {
  const now = Date.now();
  const status = !isActive ? 'Inactive' : startDate && now < new Date(startDate).getTime() ? 'Scheduled' : endDate && now > new Date(endDate).getTime() ? 'Expired' : 'Active';
  const styles = status === 'Active' ? 'bg-emerald-500/10 text-emerald-700' : status === 'Scheduled' ? 'bg-blue-500/10 text-blue-700' : 'bg-muted text-muted-foreground';
  return <span className={`rounded px-1.5 py-1 text-[10px] font-semibold ${styles}`}>{status}</span>;
}
