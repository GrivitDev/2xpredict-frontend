'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '@/providers/auth-provider';
import {
  FaArrowLeft,
  FaCheck,
  FaCheckDouble,
  FaHeadset,
  FaPaperPlane,
  FaXmark,
} from 'react-icons/fa6';
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
import {
  useMarkSupportConversationRead,
  useMySupportConversations,
  useSendSupportMessage,
  useSupportConversation,
  useSupportMessageStatus,
  useSupportNotificationSummary,
} from '@/hooks/use-customer-care';
import type { SupportConversation, SupportInboxView, SupportMessage } from '@/types/customer-care';

type Corner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
type Row = Record<string, unknown>;
type DeliveryStatus = 'sending' | 'sent' | 'waiting' | 'received';
type CustomerDelivery = {
  clientMessageId: string;
  conversationId: string;
  message: string;
  createdAt: number;
  status: DeliveryStatus;
  replyBaseline: number;
  messageId?: string;
  supportStatus?: string;
};

const corners: Corner[] = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
const cornerLabels: Record<Corner, string> = {
  'bottom-right': 'Bottom right',
  'bottom-left': 'Bottom left',
  'top-right': 'Top right',
  'top-left': 'Top left',
};
const cornerClasses: Record<Corner, string> = {
  'bottom-right': 'bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 md:bottom-4',
  'bottom-left': 'bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 md:bottom-4',
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
};
function record(value: unknown): Row {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Row : {};
}
function rows(value: unknown): Row[] {
  if (Array.isArray(value)) return value.map(record);
  const source = record(value);
  for (const key of ['items', 'results', 'conversations', 'data']) {
    if (Array.isArray(source[key])) return (source[key] as unknown[]).map(record);
  }
  return [];
}
function safeText(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}
function idOf(value: unknown): string {
  if (typeof value === 'string') return value;
  const source = record(value);
  return safeText(source._id ?? source.id);
}
function dateLabel(value: unknown): string {
  if (!value) return '';
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function errorText(error: unknown, fallback: string): string {
  const source = record(error);
  const response = record(source.response);
  const data = record(response.data);
  const message = data.message ?? source.message;
  if (Array.isArray(message)) return message.map(String).join(' ');
  return typeof message === 'string' && message.trim() ? message : fallback;
}
function makeClientMessageId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `support-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function MessageThread({
  messages,
  adminMode,
  assistantName = 'Customer Care',
  conversationId = '',
  customerDeliveries = [],
  humanSupportStatus = 'AI_HANDLING',
}: {
  messages: SupportMessage[];
  adminMode: boolean;
  assistantName?: string;
  conversationId?: string;
  customerDeliveries?: CustomerDelivery[];
  humanSupportStatus?: string;
}) {
  type ThreadItem = {
    key: string;
    message?: SupportMessage;
    delivery?: CustomerDelivery;
    timestamp: number;
    isLocal?: boolean;
    isReplyPlaceholder?: boolean;
  };

  const threadItems: ThreadItem[] = [];
  const matchedDeliveryIds = new Set<string>();
  const inboundMessages = messages.filter((message) =>
    ['ASSISTANT', 'ADMIN'].includes(String(message.role ?? '').toUpperCase()),
  );
  const humanSupportActive = ['WAITING_FOR_ADMIN', 'ASSIGNED', 'HUMAN_REPLIED'].includes(
    String(humanSupportStatus).toUpperCase(),
  );
  const hasReplyForDelivery = (delivery: CustomerDelivery): boolean => {
    if (delivery.messageId) {
      return messages.some((message) => {
        const role = String(message.role ?? '').toUpperCase();
        return role === 'ASSISTANT' && idOf(record(message).replyToMessageId) === delivery.messageId;
      });
    }
    return inboundMessages.length > delivery.replyBaseline;
  };

  for (const [index, message] of messages.entries()) {
    const role = String(message.role ?? '').toUpperCase();
    if (!['USER', 'ASSISTANT', 'ADMIN'].includes(role)) continue;

    const text = safeText(message.content ?? message.message, '');
    if (!text) continue;

    let delivery: CustomerDelivery | undefined;
    if (!adminMode && role === 'USER') {
      const messageTime = message.createdAt ? new Date(String(message.createdAt)).getTime() : Number.NaN;
      const candidates = customerDeliveries
        .filter((item) => (
          !matchedDeliveryIds.has(item.clientMessageId) &&
          item.message === text &&
          (!item.conversationId || item.conversationId === conversationId)
        ))
        .map((item) => ({
          item,
          distance: Number.isFinite(messageTime) ? Math.abs(messageTime - item.createdAt) : Number.POSITIVE_INFINITY,
        }))
        .filter(({ distance }) => distance <= 5 * 60 * 1000 || !Number.isFinite(distance))
        .sort((a, b) => a.distance - b.distance);

      if (candidates.length) {
        delivery = candidates[0].item;
        matchedDeliveryIds.add(delivery.clientMessageId);
      }
    }

    const createdAt = message.createdAt ? new Date(String(message.createdAt)).getTime() : Number.NaN;
    threadItems.push({
      key: idOf(message._id) || `${role}-${index}`,
      message,
      delivery,
      timestamp: Number.isFinite(createdAt) ? createdAt : index,
    });
  }

  // Show the customer's message immediately, even before the server refreshes the thread.
  // Once the stored message appears, it is matched above and this local copy is omitted.
  if (!adminMode) {
    for (const delivery of customerDeliveries) {
      if (matchedDeliveryIds.has(delivery.clientMessageId)) continue;
      if (delivery.conversationId && delivery.conversationId !== conversationId) continue;
      threadItems.push({
        key: `local-${delivery.clientMessageId}`,
        delivery,
        timestamp: delivery.createdAt,
        isLocal: true,
      });
    }
  }

  // Keep a single lightweight reply placeholder at the end of the chat while
  // the latest accepted customer message is awaiting its actual AI response.
  // Once the linked assistant message arrives in the thread, this placeholder is
  // omitted and the real reply occupies this same end-of-thread position.
  if (!adminMode && !humanSupportActive) {
    const pendingReply = [...customerDeliveries].reverse().find((delivery) => {
      if (delivery.conversationId && delivery.conversationId !== conversationId) return false;
      if (!['sent', 'received'].includes(delivery.status)) return false;
      if (['WAITING_FOR_ADMIN', 'ASSIGNED', 'HUMAN_REPLIED'].includes(String(delivery.supportStatus ?? '').toUpperCase())) return false;
      return !hasReplyForDelivery(delivery);
    });

    if (pendingReply) {
      threadItems.push({
        key: `reply-placeholder-${pendingReply.clientMessageId}`,
        timestamp: Date.now() + 1,
        isReplyPlaceholder: true,
      });
    }
  }

  threadItems.sort((a, b) => a.timestamp - b.timestamp);

  if (!threadItems.length) {
    return <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 text-brand-accent"><FaHeadset className="h-5 w-5" /></span>
      <p className="text-sm font-semibold text-foreground">{adminMode ? 'Conversation history' : 'How can we help?'}</p>
      <p className="mt-1 max-w-[260px] text-xs leading-5 text-muted-foreground">{adminMode ? 'The customer’s messages and support replies will appear here.' : 'Send us your question. You can close this chat while we prepare a response.'}</p>
    </div>;
  }

  return <div className="space-y-3 px-3 py-3">
    {threadItems.map((item) => {
      if (item.isReplyPlaceholder) {
        return <ReplyAnticipation key={item.key} assistantName={assistantName} />;
      }

      const role = item.isLocal ? 'USER' : String(item.message?.role ?? '').toUpperCase();
      const own = adminMode ? role === 'ADMIN' : role === 'USER';
      const sender = role === 'USER'
        ? (adminMode ? 'Customer' : 'You')
        : role === 'ADMIN'
          ? 'Support team'
          : safeText(assistantName, 'Customer Care');
      const text = item.delivery?.message ?? safeText(item.message?.content ?? item.message?.message, '');
      if (!text) return null;

      const statusLabel = item.delivery?.status === 'sending'
        ? 'Sending message'
        : item.delivery?.status === 'received'
          ? 'Reply received'
          : item.delivery?.status === 'sent' || item.delivery?.status === 'waiting'
            ? 'Message sent'
            : '';

      return <div key={item.key} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[88%] min-w-0 rounded-2xl px-3 py-2 ${own ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md border border-border/70 bg-muted/60 text-foreground'}`}
          style={own ? { color: '#ffffff' } : undefined}
        >
          <div
            className={`mb-1 flex items-center gap-2 text-[9px] font-semibold ${own ? 'text-white/80' : 'text-muted-foreground'}`}
            style={own ? { color: 'rgba(255, 255, 255, 0.84)' } : undefined}
          >
            <span>{sender}</span>
            <span>{dateLabel(item.isLocal ? item.delivery?.createdAt : item.message?.createdAt)}</span>
          </div>
          <p
            className="whitespace-pre-wrap break-words text-[13px] leading-[1.65]"
            style={own ? { color: '#ffffff' } : undefined}
          >
            {text}
          </p>
          {!adminMode && own && item.delivery ? (
            <div className="mt-1 flex min-h-3.5 items-center justify-end" aria-label={statusLabel}>
              <span
                role="img"
                aria-label={statusLabel}
                title={statusLabel}
                className="inline-flex items-center justify-center"
                style={{
                  color: item.delivery.status === 'received'
                    ? '#39FF14'
                    : item.delivery.status === 'sent' || item.delivery.status === 'waiting'
                      ? 'rgba(255, 255, 255, 0.82)'
                      : 'rgba(255, 255, 255, 0.62)',
                  filter: item.delivery.status === 'received' ? 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.55))' : undefined,
                }}
              >
                {item.delivery.status === 'sending'
                  ? <FaCheck className="h-2.5 w-2.5" />
                  : <FaCheckDouble className="h-3 w-3" />}
              </span>
            </div>
          ) : null}
        </div>
      </div>;
    })}
  </div>;
}

function ReplyAnticipation({ assistantName }: { assistantName: string }) {
  const [dotCount, setDotCount] = useState(3);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setDotCount(3);
      setExpanded(true);
      return;
    }

    const timer = window.setInterval(() => {
      setDotCount((current) => (current >= 3 ? 1 : current + 1));
      setExpanded((current) => !current);
    }, 430);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-start" role="status" aria-live="polite">
      <div className="max-w-[88%] min-w-0 rounded-2xl rounded-bl-md border border-border/70 bg-muted/60 px-3 py-2 text-foreground">
        <div className="mb-1 flex items-center gap-2 text-[9px] font-semibold text-muted-foreground">
          <span>{safeText(assistantName, 'Customer Care')}</span>
        </div>
        <p className="whitespace-pre-wrap break-words text-[13px] leading-[1.65]">
          <span
            aria-hidden="true"
            className="inline-block origin-left"
            style={{
              transform: expanded ? 'scale(1.035)' : 'scale(0.965)',
              opacity: expanded ? 1 : 0.72,
              transition: 'transform 430ms ease-in-out, opacity 430ms ease-in-out',
              willChange: 'transform, opacity',
            }}
          >
            Received. replying
          </span>
          <span aria-hidden="true" className="inline-block w-[1.5em] tabular-nums">
            {'.'.repeat(dotCount)}
          </span>
          <span className="sr-only">Received. Replying.</span>
        </p>
      </div>
    </div>
  );
}

export default function CustomerCareWidget() {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const account = record(user);
  const userId = idOf(account._id ?? account.id);
  const isAdmin = safeText(account.role).toLowerCase() === 'admin';
  const isSignedIn = Boolean(user && userId);
  const hiddenOnAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(pathname);

  const defaultCorner: Corner = isAdmin ? 'bottom-left' : 'bottom-right';
  const [open, setOpen] = useState(false);
  const [corner, setCorner] = useState<Corner>('bottom-right');
  const [positionLoaded, setPositionLoaded] = useState(false);
  const activeCorner = positionLoaded ? corner : defaultCorner;
  const [supportName, setSupportName] = useState('Grace');
  const [selectedCustomerConversationId, setSelectedCustomerConversationId] = useState('');
  const [customerHasChosenNewChat, setCustomerHasChosenNewChat] = useState(false);
  const [selectedAdminConversationId, setSelectedAdminConversationId] = useState('');
  const [adminView, setAdminView] = useState<SupportInboxView>('open');
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [pendingAdminReply, setPendingAdminReply] = useState<{ conversationId: string; message: string; clientMessageId: string } | null>(null);
  const [pendingCustomerMessage, setPendingCustomerMessage] = useState<{ conversationId: string; message: string; clientMessageId: string } | null>(null);
  const [customerDeliveries, setCustomerDeliveries] = useState<CustomerDelivery[]>([]);
  const [showPosition, setShowPosition] = useState(false);

  // Notification/email deep links open the existing global Customer Care widget.
  // Both the new path-based route and legacy ?conversationId links are supported.
  useEffect(() => {
    if (authLoading || !pathname.startsWith('/customer-care')) return;

    const pathMatch = pathname.match(/^\/customer-care\/conversations\/([^/]+)$/);
    const queryConversationId = new URLSearchParams(window.location.search).get('conversationId') ?? '';
    let pathConversationId = '';
    if (pathMatch?.[1]) {
      try { pathConversationId = decodeURIComponent(pathMatch[1]); } catch { pathConversationId = pathMatch[1]; }
    }
    const requestedConversationId = pathConversationId || queryConversationId.trim();

    setOpen(true);
    setNotice(null);
    if (!isAdmin) {
      setSelectedCustomerConversationId(requestedConversationId);
      setCustomerHasChosenNewChat(!requestedConversationId);
    }
  }, [pathname, authLoading, isAdmin]);

  const storageKey = `2xpredict-customer-care-position:${userId || 'visitor'}`;
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey) as Corner | null;
      setCorner(stored && corners.includes(stored) ? stored : isAdmin ? 'bottom-left' : 'bottom-right');
    } catch { /* Local storage can be unavailable in private browsing. */
      setCorner(isAdmin ? 'bottom-left' : 'bottom-right');
    } finally {
      setPositionLoaded(true);
    }
  }, [storageKey, isAdmin]);
  useEffect(() => {
    if (!positionLoaded) return;
    try { window.localStorage.setItem(storageKey, corner); } catch { /* Position persistence is optional. */ }
  }, [storageKey, corner, positionLoaded]);
  const customerSummary = useSupportNotificationSummary({
    enabled: !authLoading && !hiddenOnAuthRoute && isSignedIn && !isAdmin,
    refetchInterval: open ? 5_000 : 60_000,
  });
  const adminSummary = useCustomerCareAdminInboxSummary({
    enabled: !authLoading && !hiddenOnAuthRoute && isAdmin,
    refetchInterval: open ? 4_000 : 60_000,
  });
  const customerConversationsQuery = useMySupportConversations(
    { limit: 20 },
    { enabled: open && !authLoading && !hiddenOnAuthRoute && isSignedIn && !isAdmin, refetchInterval: open ? 8_000 : false },
  );
  const customerConversations = useMemo(() => rows(customerConversationsQuery.data), [customerConversationsQuery.data]);
  const customerConversation = useSupportConversation(selectedCustomerConversationId || undefined, {
    enabled: open && !authLoading && !hiddenOnAuthRoute && isSignedIn && !isAdmin && Boolean(selectedCustomerConversationId),
    refetchInterval: open ? 5_000 : false,
  });
  const activeCustomerDelivery = [...customerDeliveries].reverse().find((delivery) => (
    delivery.status === 'sent' &&
    Boolean(delivery.messageId) &&
    delivery.conversationId === selectedCustomerConversationId
  ));
  const customerMessageStatus = useSupportMessageStatus(activeCustomerDelivery?.messageId, {
    enabled: open && !authLoading && !hiddenOnAuthRoute && isSignedIn && !isAdmin && Boolean(activeCustomerDelivery),
    refetchInterval: activeCustomerDelivery ? 2_000 : false,
  });
  const adminInboxQuery = useCustomerCareAdminInbox(adminView, 30, {
    enabled: open && !authLoading && !hiddenOnAuthRoute && isAdmin,
    refetchInterval: open ? 5_000 : false,
  });
  const adminRows = useMemo(() => rows(adminInboxQuery.data), [adminInboxQuery.data]);
  const adminConversation = useCustomerCareAdminConversation(selectedAdminConversationId || undefined, {
    enabled: open && !authLoading && !hiddenOnAuthRoute && isAdmin && Boolean(selectedAdminConversationId),
    refetchInterval: open ? 4_000 : false,
  });

  const sendCustomerMessage = useSendSupportMessage();
  const markCustomerRead = useMarkSupportConversationRead();
  const claimConversation = useClaimCustomerCareConversation();
  const replyAdmin = useReplyToCustomerCareConversation();
  const markAdminRead = useMarkAdminSupportConversationRead();
  const releaseConversation = useReleaseCustomerCareConversation();
  const resolveConversation = useResolveCustomerCareConversation();

  const customerDetail = record(customerConversation.data);
  const customerConversationRecord = record(customerDetail.conversation) as SupportConversation;
  const persistedAssistantName = safeText(customerConversationRecord.assistantName);
  const activeAssistantName = selectedCustomerConversationId
    ? safeText(persistedAssistantName, customerConversation.isLoading ? 'Customer Care' : supportName)
    : 'Customer Care';
  const customerMessages = Array.isArray(customerDetail.messages) ? customerDetail.messages as SupportMessage[] : [];
  const adminDetail = record(adminConversation.data);
  const adminConversationRecord = record(adminDetail.conversation) as SupportConversation;
  const adminMessages = Array.isArray(adminDetail.messages) ? adminDetail.messages as SupportMessage[] : [];
  const assignedAdminId = idOf(adminConversationRecord.assignedAdminId);
  const adminOwnsSelected = Boolean(userId && assignedAdminId === userId);
  const customerHasAttention = record(customerSummary.data).hasAttention === true;
  const adminHasAttention = record(adminSummary.data).hasAttention === true;
  const hasAttention = isAdmin ? adminHasAttention : isSignedIn ? customerHasAttention : false;

  useEffect(() => {
    if (persistedAssistantName) setSupportName(persistedAssistantName);
  }, [persistedAssistantName]);

  const hasUnreadCustomerReply = Boolean(
    customerConversationRecord.lastSupportReplyAt &&
    new Date(customerConversationRecord.lastSupportReplyAt).getTime() > new Date(customerConversationRecord.customerLastReadAt ?? 0).getTime()
  );
  const hasUnreadAdminMessage = Boolean(
    adminConversationRecord.lastCustomerMessageAt &&
    new Date(adminConversationRecord.lastCustomerMessageAt).getTime() > new Date(adminConversationRecord.adminLastReadAt ?? 0).getTime()
  );

  const storedHumanSupportStatus = String(customerConversationRecord.humanSupportStatus ?? 'AI_HANDLING');
  const localHumanSupportStatus = [...customerDeliveries].reverse().find((delivery) => (
    delivery.conversationId === selectedCustomerConversationId &&
    ['WAITING_FOR_ADMIN', 'ASSIGNED', 'HUMAN_REPLIED'].includes(String(delivery.supportStatus ?? ''))
  ))?.supportStatus;
  const customerHumanSupportStatus = ['WAITING_FOR_ADMIN', 'ASSIGNED', 'HUMAN_REPLIED'].includes(storedHumanSupportStatus)
    ? storedHumanSupportStatus
    : String(localHumanSupportStatus ?? storedHumanSupportStatus);
  const customerIsWithHumanSupport = ['WAITING_FOR_ADMIN', 'ASSIGNED', 'HUMAN_REPLIED'].includes(customerHumanSupportStatus);
  useEffect(() => {
    if (!open || authLoading || !isSignedIn || isAdmin || selectedCustomerConversationId || customerHasChosenNewChat || customerConversationsQuery.isLoading) return;
    const latest = customerConversations.find((item) => String(item.status ?? 'OPEN').toUpperCase() !== 'CLOSED');
    const latestId = latest ? idOf(latest._id ?? latest.id) : '';
    if (latestId) setSelectedCustomerConversationId(latestId);
  }, [open, authLoading, isSignedIn, isAdmin, selectedCustomerConversationId, customerHasChosenNewChat, customerConversationsQuery.isLoading, customerConversations]);

  useEffect(() => {
    if (!open || isAdmin || !selectedCustomerConversationId || customerConversation.isLoading || !customerMessages.length || !hasUnreadCustomerReply) return;
    markCustomerRead.mutate(selectedCustomerConversationId);
  }, [open, isAdmin, selectedCustomerConversationId, customerConversation.isLoading, customerConversation.dataUpdatedAt, customerMessages.length, hasUnreadCustomerReply, customerConversationRecord.lastSupportReplyAt, customerConversationRecord.customerLastReadAt, markCustomerRead.mutate]);

  useEffect(() => {
    if (!open || !isAdmin || !selectedAdminConversationId || !adminOwnsSelected || adminConversation.isLoading || !adminMessages.length || !hasUnreadAdminMessage) return;
    markAdminRead.mutate(selectedAdminConversationId);
  }, [open, isAdmin, selectedAdminConversationId, adminOwnsSelected, adminConversation.isLoading, adminConversation.dataUpdatedAt, adminMessages.length, hasUnreadAdminMessage, adminConversationRecord.lastCustomerMessageAt, adminConversationRecord.adminLastReadAt, markAdminRead.mutate]);

  const activeCustomerDeliveryClientId = activeCustomerDelivery?.clientMessageId;

  useEffect(() => {
    if (!activeCustomerDeliveryClientId) return;
    const statusRecord = record(customerMessageStatus.data);
    const status = safeText(statusRecord.status).toUpperCase();
    if (!status) return;

    const hasReply = typeof statusRecord.reply === 'string' && statusRecord.reply.trim().length > 0;
    const replyHasArrived = hasReply || status === 'COMPLETED';

    if (
      !replyHasArrived &&
      !['WAITING_FOR_ADMIN', 'ASSIGNED', 'HUMAN_REPLIED'].includes(status)
    ) {
      return;
    }

    setCustomerDeliveries((current) => current.map((delivery) => {
      if (delivery.clientMessageId !== activeCustomerDeliveryClientId) return delivery;
      return {
        ...delivery,
        status: replyHasArrived ? 'received' : 'waiting',
        supportStatus: status,
      };
    }));
  }, [
    activeCustomerDeliveryClientId,
    customerMessageStatus.dataUpdatedAt,
    customerMessageStatus.data,
  ]);

  useEffect(() => {
    if (!selectedCustomerConversationId || !customerMessages.length) return;

    const repliedMessageIds = new Set(
      customerMessages
        .filter((message) => String(message.role ?? '').toUpperCase() === 'ASSISTANT')
        .map((message) => idOf(record(message).replyToMessageId))
        .filter(Boolean),
    );
    const inboundReplyCount = customerMessages.filter((message) => {
      const role = String(message.role ?? '').toUpperCase();
      return role === 'ASSISTANT' || role === 'ADMIN';
    }).length;

    setCustomerDeliveries((current) => {
      let changed = false;
      const next = current.map((delivery) => {
        if (
          !['sent', 'waiting'].includes(delivery.status) ||
          delivery.conversationId !== selectedCustomerConversationId
        ) {
          return delivery;
        }

        const replyArrived = delivery.messageId
          ? repliedMessageIds.has(delivery.messageId)
          : inboundReplyCount > delivery.replyBaseline;
        if (!replyArrived) return delivery;

        changed = true;
        return { ...delivery, status: 'received' as const };
      });

      return changed ? next : current;
    });
  }, [selectedCustomerConversationId, customerConversation.dataUpdatedAt, customerMessages]);

  const close = useCallback(() => {
    setOpen(false);
    setNotice(null);
    setShowPosition(false);
  }, []);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || sending) return;
    setNotice(null);
    setSending(true);
    let customerClientMessageId = '';
    try {
      if (isAdmin) {
        if (!selectedAdminConversationId || !adminOwnsSelected) {
          setNotice({ kind: 'error', message: 'Accept an open request before replying.' });
          return;
        }
        // Reuse the same key when the same reply is retried after an uncertain
        // network outcome; the backend's unique index prevents duplicate replies.
        const pending = pendingAdminReply?.conversationId === selectedAdminConversationId && pendingAdminReply.message === message
          ? pendingAdminReply
          : { conversationId: selectedAdminConversationId, message, clientMessageId: makeClientMessageId() };
        setPendingAdminReply(pending);
        await replyAdmin.mutateAsync({ id: selectedAdminConversationId, message, clientMessageId: pending.clientMessageId });
        setDraft('');
        setPendingAdminReply(null);
        setNotice({ kind: 'success', message: 'Reply sent.' });
      } else {
        const selectedIsClosed = String(customerConversationRecord.status ?? '').toUpperCase() === 'CLOSED';
        const targetConversationId = !selectedIsClosed ? selectedCustomerConversationId : '';
        // Keep the request ID across retries of the same unsent draft and target
        // conversation. Switching conversations must never reuse another chat's key.
        const pending = pendingCustomerMessage?.conversationId === targetConversationId && pendingCustomerMessage.message === message
          ? pendingCustomerMessage
          : { conversationId: targetConversationId, message, clientMessageId: makeClientMessageId() };
        const replyBaseline = selectedIsClosed ? 0 : customerMessages.filter((item) => {
          const role = String(item.role ?? '').toUpperCase();
          return role === 'ASSISTANT' || role === 'ADMIN';
        }).length;

        customerClientMessageId = pending.clientMessageId;
        setPendingCustomerMessage(pending);
        setCustomerDeliveries((current) => [
          ...current.filter((item) => item.clientMessageId !== pending.clientMessageId),
          {
            clientMessageId: pending.clientMessageId,
            conversationId: targetConversationId,
            message,
            createdAt: Date.now(),
            status: 'sending' as const,
            replyBaseline,
          },
        ].slice(-50));

        const response = await sendCustomerMessage.mutateAsync({
          message,
          ...(!selectedIsClosed && selectedCustomerConversationId ? { conversationId: selectedCustomerConversationId } : {}),
          clientMessageId: pending.clientMessageId,
        });
        const responseRecord = record(response);
        const serverMessageId = safeText(responseRecord.messageId);
        const acceptedStatus = safeText(responseRecord.status).toUpperCase();
        const responseAssistantName = safeText(responseRecord.assistantName);
        if (responseAssistantName) setSupportName(responseAssistantName);
        const conversationId = safeText(responseRecord.conversationId) || targetConversationId;
        if (conversationId) { setSelectedCustomerConversationId(conversationId); setCustomerHasChosenNewChat(false); }
        setCustomerDeliveries((current) => current.map((item) => (
          item.clientMessageId === pending.clientMessageId
            ? {
                ...item,
                conversationId,
                messageId: serverMessageId || item.messageId,
                status: ['WAITING_FOR_ADMIN', 'ASSIGNED', 'HUMAN_REPLIED'].includes(acceptedStatus)
                  ? 'waiting'
                  : 'sent',
                ...(acceptedStatus ? { supportStatus: acceptedStatus } : {}),
              }
            : item
        )));
        setDraft('');
        setPendingCustomerMessage(null);
        // Delivery status is communicated by the ticks beneath the message, not a success notice.
        setNotice(null);
      }
    } catch (error) {
      if (!isAdmin && customerClientMessageId) {
        setCustomerDeliveries((current) => current.filter((item) => item.clientMessageId !== customerClientMessageId));
      }
      setNotice({ kind: 'error', message: errorText(error, 'The message could not be sent. Please try again.') });
    } finally {
      setSending(false);
    }
  }

  async function claimSelectedConversation() {
    if (!selectedAdminConversationId) return;
    setNotice(null);
    try {
      await claimConversation.mutateAsync(selectedAdminConversationId);
      setAdminView('mine');
      setNotice({ kind: 'success', message: 'Request accepted. You can now reply.' });
    } catch (error) {
      setNotice({ kind: 'error', message: errorText(error, 'This request could not be claimed. Refresh the inbox.') });
    }
  }

  async function resolveSelectedConversation() {
    if (!selectedAdminConversationId) return;
    if (!window.confirm('Resolve this support conversation?')) return;
    setNotice(null);
    try {
      await resolveConversation.mutateAsync(selectedAdminConversationId);
      setSelectedAdminConversationId('');
      setNotice({ kind: 'success', message: 'Conversation resolved.' });
    } catch (error) {
      setNotice({ kind: 'error', message: errorText(error, 'The conversation could not be resolved.') });
    }
  }

  async function releaseSelectedConversation() {
    if (!selectedAdminConversationId) return;
    setNotice(null);
    try {
      await releaseConversation.mutateAsync(selectedAdminConversationId);
      setSelectedAdminConversationId('');
      setAdminView('open');
      setNotice({ kind: 'success', message: 'Request returned to the shared queue.' });
    } catch (error) {
      setNotice({ kind: 'error', message: errorText(error, 'The conversation could not be released.') });
    }
  }

  const panelPosition = `${activeCorner.startsWith('bottom') ? 'bottom-[calc(100%+0.75rem)]' : 'top-[calc(100%+0.75rem)]'} ${activeCorner.endsWith('right') ? 'right-0' : 'left-0'}`;
  const panelTitle = isAdmin ? 'Customer Care inbox' : 'Customer Care';
  const adminListTitle = adminView === 'open' ? 'Open requests' : adminView === 'mine' ? 'My conversations' : 'All conversations';
  // The existing admin layout owns a back-to-top button at the bottom-right.
  // Keep the support launcher clear of it even when an admin explicitly chooses
  // that corner in the position menu.
  const widgetCornerClass = isAdmin && activeCorner === 'bottom-right'
    ? 'bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 md:bottom-20'
    : cornerClasses[activeCorner];

  if (hiddenOnAuthRoute || authLoading) return null;

  return <div className={`fixed z-[120] ${widgetCornerClass}`}>
    {open ? <section
      role="dialog"
      aria-label={panelTitle}
      className={`absolute ${panelPosition} flex h-[min(540px,calc(100dvh-180px))] max-h-[calc(100dvh-120px)] w-[min(360px,calc(100vw-24px))] md:h-[min(570px,calc(100dvh-96px))] md:max-h-[calc(100dvh-40px)] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl shadow-black/20 ring-1 ring-black/5`}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-border/70 bg-gradient-to-r from-card via-card to-primary/[0.06] px-3 py-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-brand-accent"><FaHeadset className="h-4 w-4" /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">{panelTitle}</p>
          <p className="truncate text-[10px] text-muted-foreground">{isAdmin ? 'Admin support workspace' : isSignedIn ? activeAssistantName : 'Help and account support'}</p>
        </div>
        <button type="button" title="Change widget position" aria-label="Change widget position" onClick={() => setShowPosition((value) => !value)} className="rounded-lg border border-border/70 px-2 py-1 text-[9px] font-medium text-muted-foreground hover:bg-muted">Position</button>
        <button type="button" onClick={close} aria-label="Close chat" title="Close chat; the response will continue in the background" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"><FaXmark className="h-3.5 w-3.5" /></button>
      </header>

      {showPosition ? <div className="flex shrink-0 flex-wrap gap-1 border-b border-border/70 bg-muted/25 px-3 py-2">
        {corners.map((item) => <button key={item} type="button" onClick={() => { setCorner(item); setPositionLoaded(true); setShowPosition(false); }} className={`rounded-md border px-2 py-1 text-[10px] ${activeCorner === item ? 'border-primary/40 bg-primary/10 font-semibold text-brand-accent' : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}>{cornerLabels[item]}</button>)}
      </div> : null}

      {!isSignedIn ? <div className="flex flex-1 flex-col justify-center gap-3 p-4">
        <div><h3 className="text-sm font-semibold">Sign in for personal support</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Your conversations are connected to your 2xPredict account. Sign in to continue a conversation or request help.</p></div>
        <Link href="/login" onClick={close} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-semibold text-white transition hover:opacity-90">Sign in <span aria-hidden="true">→</span></Link>
        <Link href="/register" onClick={close} className="inline-flex h-9 items-center justify-center rounded-xl border border-border px-3 text-xs font-semibold hover:bg-muted">Create an account</Link>
        <div className="rounded-xl border border-border/70 bg-muted/30 p-3"><p className="text-xs font-semibold">Having trouble signing in?</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">Use account recovery or email verification. Never send your password, OTP, or authentication code in a support message.</p><Link href="/forgot-password" onClick={close} className="mt-2 inline-flex text-[11px] font-semibold text-brand-accent hover:underline">Recover account</Link></div>
      </div> : isAdmin ? <>
        <nav aria-label="Admin support views" className="flex shrink-0 gap-1 border-b border-border/70 px-2 py-2">
          {(['open', 'mine', 'all'] as const).map((view) => <button key={view} type="button" onClick={() => { setAdminView(view); setSelectedAdminConversationId(''); setNotice(null); }} className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold capitalize ${adminView === view ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>{view === 'open' ? `Open (${Number(record(adminSummary.data).unclaimedRequests ?? 0)})` : view === 'mine' ? `Mine (${Number(record(adminSummary.data).assignedConversationsNeedingReply ?? 0)})` : 'All'}</button>)}
        </nav>
        {selectedAdminConversationId ? <>
          <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-3 py-2">
            <button type="button" onClick={() => setSelectedAdminConversationId('')} aria-label="Back to inbox" className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"><FaArrowLeft className="h-3 w-3" /></button>
            <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold">{safeText(adminConversationRecord.title, 'Customer support')}</p><p className="truncate text-[9px] text-muted-foreground">{safeText(adminConversationRecord.category, 'GENERAL').replaceAll('_', ' ')}</p></div>
          </div>
          {adminConversation.isLoading ? <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">Loading conversation…</div> : <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {adminConversationRecord.summary ? <div className="shrink-0 border-b border-border/60 bg-muted/20 px-3 py-2"><p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">AI handoff summary</p><p className="line-clamp-3 text-[10px] leading-4 text-foreground/80">{adminConversationRecord.summary}</p></div> : null}
            <div className="min-h-0 flex-1 overflow-y-auto"><MessageThread messages={adminMessages} adminMode assistantName={safeText(adminConversationRecord.assistantName, 'Customer Care')} /></div>
            {adminConversationRecord.status === 'OPEN' && !adminOwnsSelected ? <div className="shrink-0 border-t border-border/70 p-3">{String(adminConversationRecord.humanSupportStatus ?? 'AI_HANDLING') === 'WAITING_FOR_ADMIN' && !assignedAdminId ? <><p className="mb-2 text-[10px] leading-4 text-muted-foreground">This request is waiting in the shared queue. Accept it to take responsibility for the conversation.</p><button type="button" onClick={() => void claimSelectedConversation()} disabled={claimConversation.isPending} className="h-9 w-full rounded-xl bg-primary px-3 text-xs font-semibold text-white disabled:opacity-60">{claimConversation.isPending ? 'Accepting…' : 'Accept request'}</button></> : <p className="text-[10px] leading-4 text-muted-foreground">{assignedAdminId ? 'This conversation is assigned to another administrator.' : `${safeText(adminConversationRecord.assistantName, 'Customer Care')} is handling this conversation. A claim will become available if human assistance is requested.`}</p>}</div> : null}
            {adminOwnsSelected && adminConversationRecord.status === 'OPEN' ? <form onSubmit={submitMessage} className="shrink-0 border-t border-border/70 bg-card p-2.5">
              {notice ? <p role={notice.kind === 'error' ? 'alert' : 'status'} className={`mb-2 text-[10px] ${notice.kind === 'error' ? 'text-destructive' : 'text-status-success'}`}>{notice.message}</p> : null}
              <div className="flex items-end gap-1.5"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} maxLength={4000} placeholder="Write a support reply…" className="min-h-10 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" /><button type="submit" disabled={sending || !draft.trim()} aria-label="Send reply" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-50"><FaPaperPlane className="h-3.5 w-3.5" /></button></div>
              <div className="mt-2 flex flex-wrap gap-1.5"><button type="button" onClick={() => void releaseSelectedConversation()} disabled={releaseConversation.isPending} className="rounded-lg border border-border px-2 py-1 text-[9px] font-semibold hover:bg-muted disabled:opacity-50">Release to queue</button><button type="button" onClick={() => void resolveSelectedConversation()} disabled={resolveConversation.isPending} className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-2 py-1 text-[9px] font-semibold text-status-success hover:bg-emerald-500/10 disabled:opacity-50">Resolve</button></div>
            </form> : null}
          </div>}
        </> : <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <div className="mb-2 px-1"><p className="text-[11px] font-semibold">{adminListTitle}</p><p className="mt-0.5 text-[10px] text-muted-foreground">Select a conversation to inspect its history and status.</p></div>
          {adminInboxQuery.isLoading ? <p className="px-2 py-8 text-center text-[11px] text-muted-foreground">Loading inbox…</p> : adminRows.length ? <div className="space-y-1.5">
            {adminRows.map((item, index) => {
              const conversationId = idOf(item._id ?? item.id);
              const customer = record(item.userId);
              return <button key={conversationId || index} type="button" onClick={() => { setSelectedAdminConversationId(conversationId); setNotice(null); }} className="block w-full rounded-xl border border-border/70 bg-background p-2.5 text-left transition hover:border-primary/30 hover:bg-muted/30">
                <div className="flex items-start gap-2"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${String(item.humanSupportStatus) === 'WAITING_FOR_ADMIN' ? 'bg-amber-500' : 'bg-primary'}`} /><span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold">{safeText(item.title, 'Customer support')}</span><span className="mt-0.5 block truncate text-[9px] text-muted-foreground">{safeText(customer.email, safeText(item.category, 'GENERAL').replaceAll('_', ' '))}</span><span className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">{safeText(item.summary, 'No handoff summary available yet.')}</span></span></div>
              </button>;
            })}
          </div> : <div className="rounded-xl border border-dashed border-border p-5 text-center"><p className="text-xs font-semibold">No conversations here</p><p className="mt-1 text-[10px] text-muted-foreground">New requests and replies will appear automatically.</p></div>}
          {adminInboxQuery.isError ? <p role="alert" className="mt-2 text-[10px] text-destructive">Could not load the admin inbox. Verify your admin session and refresh.</p> : null}
        </div>}
      </> : <>
        <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-3 py-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-brand-accent"><span className="text-xs font-bold">{customerIsWithHumanSupport ? "C" : activeAssistantName.slice(0, 1)}</span></span>
          <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold">{customerIsWithHumanSupport ? 'Customer Care' : activeAssistantName}</p><p className="text-[9px] text-muted-foreground">Your messages are saved automatically</p></div>
          <select aria-label="Select conversation" value={String(customerConversationRecord.status ?? '') === 'CLOSED' ? '' : selectedCustomerConversationId} onChange={(event) => { const value = event.target.value; setSelectedCustomerConversationId(value); setCustomerHasChosenNewChat(!value); setNotice(null); }} className="max-w-[116px] rounded-lg border border-border bg-background px-1.5 py-1 text-[9px]">
            <option value="">New chat</option>
            {customerConversations.map((item, index) => <option key={idOf(item._id ?? item.id) || index} value={idOf(item._id ?? item.id)}>{safeText(item.title, 'Support conversation').slice(0, 28)}</option>)}
          </select>
        </div>
        {customerConversation.isError ? <div role="alert" className="m-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-[11px] text-destructive">This conversation could not be loaded. Close and reopen the chat to try again.</div> : null}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {customerIsWithHumanSupport ? <div className={`mx-3 mt-3 rounded-xl border px-3 py-2 ${customerHumanSupportStatus === 'WAITING_FOR_ADMIN' ? 'border-amber-500/20 bg-amber-500/5' : 'border-primary/15 bg-primary/[0.035]'}`}><p className={`text-[10px] font-semibold ${customerHumanSupportStatus === 'WAITING_FOR_ADMIN' ? 'text-status-warning' : 'text-foreground'}`}>{customerHumanSupportStatus === 'WAITING_FOR_ADMIN' ? 'Waiting for an administrator' : customerHumanSupportStatus === 'ASSIGNED' ? 'A support administrator has joined' : 'Your support team has replied'}</p><p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{customerHumanSupportStatus === 'WAITING_FOR_ADMIN' ? 'Your message has been passed to our support team. You can close this chat and continue using 2xPredict.' : customerHumanSupportStatus === 'ASSIGNED' ? 'An administrator is handling your conversation. You can close this chat while you wait.' : 'A member of Customer Care has responded in this conversation.'}</p></div> : null}
          <MessageThread
            messages={customerMessages}
            adminMode={false}
            assistantName={activeAssistantName === 'Customer Care' ? safeText(persistedAssistantName, supportName) : activeAssistantName}
            conversationId={selectedCustomerConversationId}
            customerDeliveries={customerDeliveries}
            humanSupportStatus={customerHumanSupportStatus}
          />
        </div>
        <form onSubmit={submitMessage} className="shrink-0 border-t border-border/70 bg-card p-2.5">
          {notice ? <p role={notice.kind === 'error' ? 'alert' : 'status'} className={`mb-2 text-[10px] ${notice.kind === 'error' ? 'text-destructive' : 'text-status-success'}`}>{notice.message}</p> : null}
          <div className="flex items-end gap-1.5"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} maxLength={4000} placeholder="Write your message…" className="min-h-10 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" /><button type="submit" disabled={sending || !draft.trim()} aria-label="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-50"><FaPaperPlane className="h-3.5 w-3.5" /></button></div>
          <div className="mt-1.5 flex items-center justify-between gap-2"><p className="text-[9px] leading-4 text-muted-foreground">Never send passwords or OTP codes.</p><span className="text-[9px] text-muted-foreground">Enter to send is not enabled</span></div>
        </form>
      </>}
    </section> : null}

    <button type="button" onClick={() => {
      const nextOpen = !open;
      if (nextOpen && isAdmin) {
        const summary = record(adminSummary.data);
        setAdminView(Number(summary.unclaimedRequests ?? 0) === 0 && Number(summary.assignedConversationsNeedingReply ?? 0) > 0 ? 'mine' : 'open');
      }
      if (nextOpen && !isAdmin) setCustomerHasChosenNewChat(false);
      setOpen(nextOpen);
      setNotice(null);
    }} aria-label={open ? 'Close Customer Care' : isAdmin ? 'Open admin support inbox' : 'Open Customer Care chat'} aria-expanded={open} title={isAdmin ? 'Customer Care inbox' : 'Customer Care'} className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-primary text-white shadow-xl shadow-primary/25 transition hover:-translate-y-0.5 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
      {open ? <FaXmark className="h-5 w-5" /> : <FaHeadset className="h-5 w-5" />}
      {hasAttention && !open ? <span aria-label="Customer Care needs your attention" className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-rose-500 shadow-sm"><span className="absolute inset-0 animate-ping rounded-full bg-rose-500/70" /></span> : null}
    </button>
  </div>;
}



