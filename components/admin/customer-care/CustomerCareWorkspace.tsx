'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AdminError,
  AdminMetric,
  AdminNotice,
  AdminPageFrame,
  AdminPanel,
  AdminTabs,
  adminButton,
  adminDangerButton,
  adminInput,
  adminPrimaryButton,
  adminTextarea,
  compactDate,
  compactStatus,
} from '@/components/admin/AdminWorkspace';
import {
  useClaimCustomerCareConversation,
  useCustomerCareAdminInbox,
  useCustomerCareAdminInboxSummary,
  useCustomerCareAdminConversation,
  useMarkAdminSupportConversationRead,
  useReleaseCustomerCareConversation,
  useReplyToCustomerCareConversation,
  useResolveCustomerCareConversation,
} from '@/hooks/use-customer-care-admin';
import { useAuth } from '@/providers/auth-provider';
import type { SupportConversation, SupportInboxView, SupportMessage } from '@/types/customer-care';

 type Row = Record<string, unknown>;

function record(value: unknown): Row {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Row : {};
}
function rows(value: unknown): Row[] {
  if (Array.isArray(value)) return value.map(record);
  const source = record(value);
  for (const key of ['items', 'results', 'data']) {
    if (Array.isArray(source[key])) return (source[key] as unknown[]).map(record);
  }
  return [];
}
function text(value: unknown, fallback = '—'): string {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'object') {
    const source = record(value);
    if (source.email || source.name || source.firstName || source.lastName) {
      return [source.name, source.firstName, source.lastName].filter((item) => typeof item === 'string' && item.trim()).join(' ') || String(source.email ?? fallback);
    }
    return String(source._id ?? source.id ?? fallback);
  }
  return String(value);
}
function recordId(value: unknown): string {
  if (typeof value === 'string') return value;
  const source = record(value);
  return String(source._id ?? source.id ?? '');
}
function errorText(error: unknown, fallback: string): string {
  const source = record(error);
  const response = record(source.response);
  const data = record(response.data);
  const message = data.message ?? source.message;
  if (Array.isArray(message)) return message.map(String).join(' ');
  return typeof message === 'string' && message.trim() ? message : fallback;
}
function messageTime(value: unknown): string {
  if (!value) return '';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}
function makeClientMessageId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `support-reply-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}
function statusLabel(value: unknown): string {
  return text(value, 'AI_HANDLING').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function MessageThread({ messages }: { messages: SupportMessage[] }) {
  if (!messages.length) return <div className="flex min-h-[260px] items-center justify-center p-6 text-center text-xs text-muted-foreground">No messages have been recorded in this conversation.</div>;
  return <div className="space-y-3 p-3">
    {messages.map((message, index) => {
      const role = String(message.role ?? '').toUpperCase();
      if (!['USER', 'ASSISTANT', 'ADMIN'].includes(role)) return null;
      const own = role === 'ADMIN';
      const sender = role === 'USER' ? 'Customer' : role === 'ADMIN' ? 'Administrator' : 'AI assistant';
      const content = String(message.content ?? message.message ?? '');
      if (!content) return null;
      return <div key={String(message._id ?? index)} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
        <article className={`max-w-[88%] min-w-0 rounded-2xl px-3 py-2 ${own ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md border border-border/70 bg-muted/50 text-foreground'}`}>
          <div className={`mb-1 flex flex-wrap items-center gap-2 text-[10px] font-semibold ${own ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}><span>{sender}</span><span>{messageTime(message.createdAt)}</span></div>
          <p className="whitespace-pre-wrap break-words text-xs leading-5">{content}</p>
        </article>
      </div>;
    })}
  </div>;
}

export default function CustomerCareWorkspace() {
  const account = record(useAuth().user);
  const adminId = recordId(account._id ?? account.id);
  const [view, setView] = useState<SupportInboxView>('open');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState('');
  const [pendingReply, setPendingReply] = useState<{ conversationId: string; message: string; clientMessageId: string } | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const summary = useCustomerCareAdminInboxSummary({ refetchInterval: 8_000 });
  const inbox = useCustomerCareAdminInbox(view, 100, { refetchInterval: 7_000 });
  const conversationQuery = useCustomerCareAdminConversation(selectedId || undefined, { enabled: Boolean(selectedId), refetchInterval: selectedId ? 5_000 : false });
  const claim = useClaimCustomerCareConversation();
  const reply = useReplyToCustomerCareConversation();
  const release = useReleaseCustomerCareConversation();
  const resolve = useResolveCustomerCareConversation();
  const markRead = useMarkAdminSupportConversationRead();

  const inboxRows = useMemo(() => rows(inbox.data), [inbox.data]);
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return inboxRows;
    return inboxRows.filter((item) => {
      const customer = record(item.userId);
      return [item.title, item.category, item.summary, item._id, customer.email, customer.name, customer.firstName, customer.lastName]
        .some((value) => String(value ?? '').toLowerCase().includes(query));
    });
  }, [inboxRows, search]);
  const detail = record(conversationQuery.data);
  const conversation = record(detail.conversation) as SupportConversation;
  const messages = Array.isArray(detail.messages) ? detail.messages as SupportMessage[] : [];
  const assignedAdminId = recordId(conversation.assignedAdminId);
  const ownsConversation = Boolean(adminId && assignedAdminId === adminId);
  const waitingCount = Number(record(summary.data).unclaimedRequests ?? 0);
  const assignedCount = Number(record(summary.data).assignedConversationsNeedingReply ?? 0);

  const hasUnreadCustomerMessage = Boolean(
    conversation.lastCustomerMessageAt &&
    new Date(conversation.lastCustomerMessageAt).getTime() > new Date(conversation.adminLastReadAt ?? 0).getTime()
  );

  useEffect(() => {
    if (!selectedId || !ownsConversation || conversationQuery.isLoading || !messages.length || !hasUnreadCustomerMessage) return;
    markRead.mutate(selectedId);
  }, [selectedId, ownsConversation, conversationQuery.isLoading, conversationQuery.dataUpdatedAt, messages.length, hasUnreadCustomerMessage, conversation.lastCustomerMessageAt, conversation.adminLastReadAt, markRead.mutate]);

  async function claimSelected() {
    if (!selectedId) return;
    setNotice(null);
    try {
      await claim.mutateAsync(selectedId);
      setView('mine');
      setNotice({ kind: 'success', message: 'Request accepted. The conversation is now assigned to you.' });
    } catch (error) {
      setNotice({ kind: 'error', message: errorText(error, 'This request could not be claimed. Refresh the inbox.') });
    }
  }
  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!selectedId || !message || !ownsConversation || reply.isPending) return;
    setNotice(null);
    try {
      const pending = pendingReply?.conversationId === selectedId && pendingReply.message === message
        ? pendingReply
        : { conversationId: selectedId, message, clientMessageId: makeClientMessageId() };
      setPendingReply(pending);
      await reply.mutateAsync({ id: selectedId, message, clientMessageId: pending.clientMessageId });
      setDraft('');
      setPendingReply(null);
      setNotice({ kind: 'success', message: 'Reply sent to the customer.' });
    } catch (error) {
      setNotice({ kind: 'error', message: errorText(error, 'The reply could not be sent. Please try again.') });
    }
  }
  async function releaseSelected() {
    if (!selectedId || !ownsConversation) return;
    setNotice(null);
    try {
      await release.mutateAsync(selectedId);
      setSelectedId('');
      setView('open');
      setNotice({ kind: 'success', message: 'Conversation returned to the shared request queue.' });
    } catch (error) {
      setNotice({ kind: 'error', message: errorText(error, 'The conversation could not be released.') });
    }
  }
  async function resolveSelected() {
    if (!selectedId || !ownsConversation) return;
    if (!window.confirm('Resolve this customer-support conversation?')) return;
    setNotice(null);
    try {
      await resolve.mutateAsync(selectedId);
      setSelectedId('');
      setNotice({ kind: 'success', message: 'Conversation resolved.' });
    } catch (error) {
      setNotice({ kind: 'error', message: errorText(error, 'The conversation could not be resolved.') });
    }
  }

  const tabs = [
    { value: 'open' as const, label: 'Open Requests', count: waitingCount },
    { value: 'mine' as const, label: 'My Conversations', count: assignedCount },
    { value: 'all' as const, label: 'All Conversations' },
  ];

  return <AdminPageFrame
    title="Customer Care"
    description="Handle AI escalations, claim support requests, reply to customers, and resolve conversations."
    badge={<span className="rounded-full border border-border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Support inbox</span>}
    actions={<><span className="text-[10px] text-muted-foreground">Updates automatically</span><button type="button" className={adminButton} disabled={inbox.isFetching} onClick={() => { void inbox.refetch(); void summary.refetch(); if (selectedId) void conversationQuery.refetch(); }}>{inbox.isFetching ? 'Refreshing…' : 'Refresh'}</button></>}
  >
    {notice ? <AdminNotice kind={notice.kind}>{notice.message}</AdminNotice> : null}
    {summary.isError ? <AdminError error={summary.error} retry={() => void summary.refetch()} /> : null}
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <AdminMetric label="Unclaimed requests" value={Number.isFinite(waitingCount) ? waitingCount.toLocaleString() : '—'} tone={waitingCount > 0 ? 'warn' : 'default'} foot="Available for an admin to accept" />
      <AdminMetric label="My conversations needing reply" value={Number.isFinite(assignedCount) ? assignedCount.toLocaleString() : '—'} tone={assignedCount > 0 ? 'warn' : 'default'} foot="Assigned to the current admin" />
      <AdminMetric label="Current view" value={tabs.find((item) => item.value === view)?.label ?? 'Inbox'} foot={`${filteredRows.length} visible conversations`} />
    </div>

    <AdminTabs value={view} onChange={(next) => { setView(next); setSelectedId(''); setNotice(null); }} tabs={tabs} />

    <div className="grid min-w-0 gap-2 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.45fr)]">
      <AdminPanel title={view === 'open' ? 'Waiting for an administrator' : view === 'mine' ? 'Assigned to me' : 'Conversation history'} meta={`${filteredRows.length} records`}>
        <div className="border-b border-border/60 p-2"><input className={adminInput} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer, category, issue, or ID…" /></div>
        {inbox.isError ? <div className="p-3"><AdminError error={inbox.error} retry={() => void inbox.refetch()} /></div> : inbox.isLoading ? <div className="px-3 py-10 text-center text-xs text-muted-foreground">Loading requests…</div> : filteredRows.length ? <div className="max-h-[68vh] space-y-1 overflow-y-auto p-1.5">
          {filteredRows.map((item, index) => {
            const id = String(item._id ?? item.id ?? '');
            const customer = record(item.userId);
            const selected = selectedId === id;
            const supportState = String(item.humanSupportStatus ?? 'AI_HANDLING');
            const customerName = [customer.name, customer.firstName, customer.lastName].filter((value) => typeof value === 'string' && value.trim()).join(' ');
            return <button key={id || index} type="button" onClick={() => { if (selectedId !== id) { setPendingReply(null); setDraft(''); } setSelectedId(id); setNotice(null); }} className={`block w-full rounded-lg border p-2.5 text-left transition ${selected ? 'border-primary/40 bg-primary/[0.045] shadow-sm' : 'border-border/60 bg-card hover:border-primary/25 hover:bg-muted/25'}`}>
              <div className="flex items-start gap-2">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${supportState === 'WAITING_FOR_ADMIN' ? 'bg-amber-500' : supportState === 'ASSIGNED' ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2"><p className="truncate text-xs font-semibold">{text(item.title, 'Customer support')}</p><span className="shrink-0 text-[9px] text-muted-foreground">{compactDate(item.lastMessageAt)}</span></div>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{customerName || text(customer.email, text(item.category, 'Customer'))}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1"><span className="rounded border border-border/70 px-1.5 py-0.5 text-[9px] text-muted-foreground">{text(item.category, 'GENERAL').replaceAll('_', ' ')}</span><span>{compactStatus(supportState)}</span></div>
                  <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">{text(item.summary, 'No conversation summary available.')}</p>
                </div>
              </div>
            </button>;
          })}
        </div> : <div className="px-3 py-10 text-center"><p className="text-xs font-semibold">No conversations found</p><p className="mt-1 text-[10px] text-muted-foreground">New requests will appear here automatically.</p></div>}
      </AdminPanel>

      <AdminPanel title={selectedId ? text(conversation.title, 'Customer conversation') : 'Conversation'} meta={selectedId ? `${statusLabel(conversation.status)} · ${statusLabel(conversation.humanSupportStatus)}` : 'Select a request to review'}>
        {!selectedId ? <div className="flex min-h-[360px] flex-col items-center justify-center p-6 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 text-primary"><span className="text-lg">?</span></span><p className="mt-3 text-sm font-semibold">Select a conversation</p><p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">The customer’s messages, AI handoff summary, assignment, and reply controls will appear here.</p></div> : conversationQuery.isError ? <div className="p-3"><AdminError error={conversationQuery.error} retry={() => void conversationQuery.refetch()} /></div> : conversationQuery.isLoading ? <div className="px-3 py-14 text-center text-xs text-muted-foreground">Loading conversation…</div> : <div className="flex min-w-0 flex-col">
          <div className="grid gap-2 border-b border-border/60 bg-muted/15 p-2 sm:grid-cols-2">
            <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Customer</p><p className="mt-0.5 truncate text-xs font-medium">{text(record(conversation.userId).email, 'Account email unavailable')}</p><p className="mt-0.5 truncate text-[10px] text-muted-foreground">ID: {recordId(record(conversation.userId)._id ?? conversation.userId) || '—'}</p></div>
            <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Support status</p><p className="mt-0.5 text-xs font-medium">{statusLabel(conversation.humanSupportStatus)}</p><p className="mt-0.5 text-[10px] text-muted-foreground">Last activity: {messageTime(conversation.lastMessageAt) || compactDate(conversation.lastMessageAt)}</p></div>
          </div>
          {conversation.summary ? <div className="border-b border-border/60 bg-primary/[0.025] px-3 py-2.5"><p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">AI handoff summary</p><p className="whitespace-pre-wrap break-words text-[11px] leading-5 text-foreground/85">{conversation.summary}</p></div> : null}
          <div className="max-h-[480px] min-h-[250px] overflow-y-auto"><MessageThread messages={messages} /></div>
          {String(conversation.status).toUpperCase() !== 'OPEN' ? <div className="border-t border-border/60 bg-muted/20 px-3 py-3 text-xs text-muted-foreground">This conversation is {String(conversation.status).toLowerCase()} and cannot receive additional replies.</div> : !ownsConversation ? <div className="border-t border-border/60 bg-muted/20 p-3">{!conversation.assignedAdminId && String(conversation.humanSupportStatus ?? 'AI_HANDLING') === 'WAITING_FOR_ADMIN' ? <><p className="mb-2 text-[11px] leading-5 text-muted-foreground">This request is waiting in the shared queue. Accept it to take responsibility for the conversation and reply to the customer.</p><button type="button" disabled={claim.isPending} onClick={() => void claimSelected()} className={adminPrimaryButton}>{claim.isPending ? 'Accepting…' : 'Accept request'}</button></> : <p className="text-[11px] leading-5 text-muted-foreground">{conversation.assignedAdminId ? 'This conversation is assigned to another administrator.' : 'The AI assistant is still handling this conversation. Human support can claim it after the AI escalates it.'}</p>}</div> : <form onSubmit={sendReply} className="border-t border-border/70 p-2.5">
            <label className="mb-1.5 block text-[10px] font-semibold text-muted-foreground" htmlFor="customer-care-reply">Reply to customer</label>
            <textarea id="customer-care-reply" className={adminTextarea} rows={3} maxLength={4000} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a clear, helpful response…" />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2"><span className="text-[9px] text-muted-foreground">Avoid requesting passwords, OTPs, or authentication tokens.</span><div className="flex gap-1.5"><button type="button" className={adminButton} disabled={release.isPending} onClick={() => void releaseSelected()}>Release</button><button type="button" className={adminDangerButton} disabled={resolve.isPending} onClick={() => void resolveSelected()}>Resolve</button><button type="submit" className={adminPrimaryButton} disabled={reply.isPending || !draft.trim()}>{reply.isPending ? 'Sending…' : 'Send reply'}</button></div></div>
          </form>}
        </div>}
      </AdminPanel>
    </div>
    <p className="px-1 text-[10px] text-muted-foreground">The inbox refreshes automatically. Closing the floating chat does not interrupt message processing or support assignment.</p>
  </AdminPageFrame>;
}
