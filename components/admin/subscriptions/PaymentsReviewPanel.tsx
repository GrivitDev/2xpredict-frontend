'use client';

import { useState } from 'react';
import { useAllPaymentsQuery, useApprovePaymentMutation, usePendingPaymentsQuery, useRejectPaymentMutation } from '@/hooks/use-payments';
import { useReconcilePaymentMutation } from '@/hooks/use-payment-gateways';
import type { Payment } from '@/types/payments';
import { AdminError, AdminMetrics, AdminNotice, AdminPanel, AdminTable, AdminTabs, adminButton, adminDangerButton, compactDate, compactStatus } from '@/components/admin/AdminWorkspace';

type Tab = 'pending' | 'all';

const cash = (payment: Payment) => new Intl.NumberFormat(payment.currency === 'USD' ? 'en-US' : 'en-NG', {
  style: 'currency',
  currency: payment.currency,
  maximumFractionDigits: 2,
}).format(Number(payment.amount) || 0);

export default function PaymentsReviewPanel() {
  const [tab, setTab] = useState<Tab>('pending');
  const pendingQuery = usePendingPaymentsQuery({ enabled: tab === 'pending' });
  const allQuery = useAllPaymentsQuery({ enabled: tab === 'all' });
  const approve = useApprovePaymentMutation();
  const reject = useRejectPaymentMutation();
  const reconcile = useReconcilePaymentMutation();
  const query = tab === 'pending' ? pendingQuery : allQuery;
  const rows = query.data ?? [];
  const pendingCount = rows.filter((payment) => payment.status === 'pending' || payment.status === 'processing').length;
  const actionPending = approve.isPending || reject.isPending || reconcile.isPending;
  const actionError = approve.error ?? reject.error ?? reconcile.error;
  const actionFailed = approve.isError || reject.isError || reconcile.isError;
  const actionSucceeded = approve.isSuccess || reject.isSuccess || reconcile.isSuccess;

  const refresh = () => void query.refetch();
  const decide = (id: string, decision: 'approve' | 'reject') => {
    approve.reset();
    reject.reset();
    reconcile.reset();
    if (decision === 'approve') approve.mutate({ path: { id } });
    else reject.mutate({ path: { id } });
  };

  return (
    <AdminPanel title="Payment review" meta="Payment records from the admin payments API" actions={<button type="button" className={adminButton} disabled={query.isFetching} onClick={refresh}>{query.isFetching ? 'Refreshing…' : 'Refresh'}</button>}>
      <div className="space-y-2 p-2.5">
        <AdminMetrics columns={3} items={[
          { label: tab === 'pending' ? 'Pending queue' : 'Records returned', value: rows.length, tone: rows.length ? 'warn' : 'good' },
          { label: 'NGN pending', value: rows.filter((payment) => (payment.status === 'pending' || payment.status === 'processing') && payment.currency === 'NGN').length },
          { label: 'USD pending', value: rows.filter((payment) => (payment.status === 'pending' || payment.status === 'processing') && payment.currency === 'USD').length },
        ]} />
        <AdminTabs value={tab} onChange={setTab} tabs={[
          { value: 'pending', label: 'Pending', count: tab === 'pending' ? rows.length : pendingCount },
          { value: 'all', label: 'All payments' },
        ]} />
        {query.isError && <AdminError error={query.error} retry={refresh} />}
        {actionFailed && <AdminError error={actionError} retry={() => { approve.reset(); reject.reset(); reconcile.reset(); }} />}
        {actionSucceeded && <AdminNotice kind="success">Payment action completed. Records and subscription state are refreshing.</AdminNotice>}
        {query.isLoading ? (
          <div className="p-5 text-center text-[11px] text-muted-foreground">Loading payments…</div>
        ) : (
          <AdminTable rows={rows as unknown as Record<string, unknown>[]} columns={[
            { key: 'email', label: 'Account', render: (row) => <div className="min-w-28"><div className="truncate font-medium">{String(row.email ?? row.userId ?? 'Unknown user')}</div><div className="truncate text-[9px] text-muted-foreground">{String(row.reference ?? row.transferReference ?? row._id ?? '')}</div></div> },
            { key: 'type', label: 'Type' },
            { key: 'target', label: 'Plan' },
            { key: 'amount', label: 'Amount', render: (row) => cash(row as unknown as Payment) },
            { key: 'status', label: 'Status', render: (row) => compactStatus(row.status) },
            { key: 'gateway', label: 'Gateway', render: (row) => String(row.gateway ?? 'manual').toUpperCase() },
            { key: 'gatewayInitializationStatus', label: 'Checkout', render: (row) => row.gateway === 'paystack' ? compactStatus(row.gatewayInitializationStatus) : '—' },
            { key: 'createdAt', label: 'Created', render: (row) => compactDate(row.createdAt) },
            { key: 'proof', label: 'Proof', render: (row) => row.proofImageUrl ? <a className="text-primary underline" href={String(row.proofImageUrl)} target="_blank" rel="noreferrer">Open proof</a> : '—' },
            { key: 'action', label: 'Decision', render: (row) => {
              const id = String(row._id ?? '');
              const status = String(row.status ?? '');
              if (!id || tab !== 'pending') return '—';
              const gateway = String(row.gateway ?? 'manual');
              if (gateway === 'paystack' && (status === 'pending' || status === 'processing')) {
                const reference = String(row.reference ?? '');
                return <button type="button" className={adminButton} disabled={actionPending || !reference} onClick={() => { if (window.confirm(`Reconcile Paystack payment ${reference}? The backend will verify the existing reference; it will not initiate a new payment.`)) { approve.reset(); reject.reset(); reconcile.mutate({ path: { reference } }); } }}>{reconcile.isPending ? 'Checking…' : 'Reconcile'}</button>;
              }
              if (gateway !== 'manual' || status !== 'pending') return '—';
              return <div className="flex gap-1"><button type="button" className={adminButton} disabled={actionPending} onClick={() => { if (window.confirm('Approve this manual transfer and apply its subscription effect?')) decide(id, 'approve'); }}>Approve</button><button type="button" className={adminDangerButton} disabled={actionPending} onClick={() => { if (window.confirm('Reject this manual payment?')) decide(id, 'reject'); }}>Reject</button></div>;
            } },
          ]} empty="No payments returned for this view." limit={250} />
        )}
        <p className="text-[9px] text-muted-foreground">Manual transfers can be approved or rejected. Paystack records must be reconciled against their existing gateway reference; they cannot be manually approved or rejected.</p>
      </div>
    </AdminPanel>
  );
}
