export type SupportConversationStatus = 'OPEN' | 'RESOLVED' | 'CLOSED';
export type HumanSupportStatus = 'AI_HANDLING' | 'WAITING_FOR_ADMIN' | 'ASSIGNED' | 'HUMAN_REPLIED';
export type SupportInboxView = 'open' | 'mine' | 'all';
export type SupportIncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type SupportIncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CustomerCareJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type CustomerCareBroadcastStatus = 'GENERATING' | 'READY' | 'SENDING' | 'SENT' | 'SKIPPED' | 'FAILED';

export interface SendSupportMessagePayload {
  conversationId?: string;
  clientMessageId?: string;
  message: string;
}
export interface SendAdminSupportReplyPayload { message: string; clientMessageId?: string }
export interface SupportConversationQuery { limit?: number; status?: SupportConversationStatus }
export interface SupportIncidentQuery { limit?: number; status?: SupportIncidentStatus; severity?: SupportIncidentSeverity }
export interface CustomerCareActionQuery { limit?: number; type?: string; outcome?: string }
export interface CustomerCareBroadcastQuery { limit?: number; status?: CustomerCareBroadcastStatus }
export interface CustomerCareJobQuery { limit?: number; status?: CustomerCareJobStatus }
export interface UpdateSupportIncidentPayload { status?: SupportIncidentStatus; resolutionNotes?: string }
export interface RetryCustomerCareBroadcastPayload { confirmNotPosted?: boolean }
export interface CustomerCarePage<T> { items: T[]; total: number; limit: number; view?: string }

export interface SupportConversation {
  _id: string;
  userId?: string | Record<string, unknown>;
  title?: string;
  subject?: string;
  assistantName?: string;
  status?: SupportConversationStatus;
  category?: string;
  summary?: string;
  humanSupportStatus?: HumanSupportStatus;
  assignedAdminId?: string | Record<string, unknown> | null;
  claimedAt?: string;
  handoffRequestedAt?: string;
  lastCustomerMessageAt?: string;
  lastSupportReplyAt?: string;
  customerLastReadAt?: string;
  adminLastReadAt?: string;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}
export interface SupportMessage {
  _id: string;
  conversationId?: string;
  userId?: string;
  role?: 'USER' | 'ASSISTANT' | 'ADMIN' | 'TOOL' | 'SYSTEM' | string;
  content?: string;
  message?: string;
  status?: string;
  replyStatus?: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}
export interface SupportConversationDetail {
  conversation: SupportConversation;
  messages: SupportMessage[];
  actions?: Record<string, unknown>[];
  incidents?: Record<string, unknown>[];
}
export interface CustomerCareNotificationSummary {
  waitingForReply: number;
  unreadReplies: number;
  hasAttention: boolean;
}
export interface AdminCustomerCareNotificationSummary {
  unclaimedRequests: number;
  assignedConversationsNeedingReply: number;
  assignedUnreadMessages: number;
  hasAttention: boolean;
}
export interface SupportIncident { _id: string; status: SupportIncidentStatus; severity?: SupportIncidentSeverity; resolutionNotes?: string; [key: string]: unknown }
export interface CustomerCareMonitor { [key: string]: unknown }
