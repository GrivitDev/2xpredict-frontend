import { apiRequest } from '../lib/axios';
import type { SendMessageArgs } from '../types/endpoint-args/customer-care';
import type {
  ListAdminActionsArgs, ListAdminBroadcastsArgs, ListAdminConversationsArgs,
  ListAdminIncidentsArgs, ListAdminJobsArgs, RetryBroadcastArgs,
  SupportRecordIdArgs, UpdateIncidentArgs,
} from '../types/endpoint-args/customer-care';
import type {
  AdminCustomerCareNotificationSummary, CustomerCareMonitor,
  CustomerCareNotificationSummary, CustomerCarePage, SendAdminSupportReplyPayload,
  SendSupportMessagePayload, SupportConversation, SupportConversationDetail,
  SupportInboxView, SupportIncident, SupportMessage, UpdateSupportIncidentPayload,
  RetryCustomerCareBroadcastPayload,
} from '../types/customer-care';

const adminMethods = {
  getMonitor: () => apiRequest<CustomerCareMonitor>({ method: 'GET', path: '/admin/customer-care/monitor' }),
  getInboxSummary: () => apiRequest<AdminCustomerCareNotificationSummary>({ method: 'GET', path: '/admin/customer-care/inbox/summary' }),
  getInbox: (query: { view: SupportInboxView; limit?: number }) =>
    apiRequest<CustomerCarePage<SupportConversation>>({ method: 'GET', path: '/admin/customer-care/inbox', query }),
  claimConversation: (id: string) =>
    apiRequest<SupportConversationDetail>({ method: 'POST', path: '/admin/customer-care/conversations/:id/claim', pathParams: { id }, body: {} }),
  replyToConversation: (id: string, body: SendAdminSupportReplyPayload) =>
    apiRequest<Record<string, unknown>>({ method: 'POST', path: '/admin/customer-care/conversations/:id/reply', pathParams: { id }, body }),
  markAdminConversationRead: (id: string) =>
    apiRequest<Record<string, unknown>>({ method: 'POST', path: '/admin/customer-care/conversations/:id/read', pathParams: { id }, body: {} }),
  releaseConversation: (id: string) =>
    apiRequest<Record<string, unknown>>({ method: 'POST', path: '/admin/customer-care/conversations/:id/release', pathParams: { id }, body: {} }),
  resolveConversation: (id: string) =>
    apiRequest<Record<string, unknown>>({ method: 'POST', path: '/admin/customer-care/conversations/:id/resolve', pathParams: { id }, body: {} }),
  listConversations: (args: ListAdminConversationsArgs = {}) =>
    apiRequest<unknown>({ method: 'GET', path: '/admin/customer-care/conversations', query: args.query }),
  getAdminConversation: (args: SupportRecordIdArgs) =>
    apiRequest<SupportConversationDetail>({ method: 'GET', path: '/admin/customer-care/conversations/:id', pathParams: args.path }),
  getIncident: (args: SupportRecordIdArgs) =>
    apiRequest<SupportIncident>({ method: 'GET', path: '/admin/customer-care/incidents/:id', pathParams: args.path }),
  listIncidents: (args: ListAdminIncidentsArgs = {}) =>
    apiRequest<unknown>({ method: 'GET', path: '/admin/customer-care/incidents', query: args.query }),
  updateIncident: (args: UpdateIncidentArgs) =>
    apiRequest<SupportIncident>({ method: 'PATCH', path: '/admin/customer-care/incidents/:id', pathParams: args.path, body: args.body }),
  listActions: (args: ListAdminActionsArgs = {}) =>
    apiRequest<unknown>({ method: 'GET', path: '/admin/customer-care/actions', query: args.query }),
  listBroadcasts: (args: ListAdminBroadcastsArgs = {}) =>
    apiRequest<unknown>({ method: 'GET', path: '/admin/customer-care/broadcasts', query: args.query }),
  retryBroadcast: (args: RetryBroadcastArgs) =>
    apiRequest<unknown>({ method: 'POST', path: '/admin/customer-care/broadcasts/:id/retry', pathParams: args.path, body: args.body ?? {} }),
  retryJob: (args: SupportRecordIdArgs) =>
    apiRequest<unknown>({ method: 'POST', path: '/admin/customer-care/jobs/:id/retry', pathParams: args.path }),
  listJobs: (args: ListAdminJobsArgs = {}) =>
    apiRequest<unknown>({ method: 'GET', path: '/admin/customer-care/jobs', query: args.query }),
} as const;

/** Single client for user and admin endpoints in Customer Care. */
export const customerCareService = {
  sendMessage: (args: SendMessageArgs) =>
    apiRequest<Record<string, unknown>>({
      method: 'POST', path: '/customer-care/message', body: args.body,
      config: args.idempotencyKey ? { headers: { 'idempotency-key': args.idempotencyKey } } : undefined,
    }),
  getMyConversations: (query: { limit?: number } = {}) =>
    apiRequest<CustomerCarePage<SupportConversation>>({ method: 'GET', path: '/customer-care/conversations', query }),
  getNotificationSummary: () =>
    apiRequest<CustomerCareNotificationSummary>({ method: 'GET', path: '/customer-care/notifications/summary' }),
  markConversationRead: (id: string) =>
    apiRequest<Record<string, unknown>>({ method: 'POST', path: '/customer-care/conversations/:id/read', pathParams: { id }, body: {} }),
  getMessageStatus: (id: string) =>
    apiRequest<SupportMessage>({ method: 'GET', path: '/customer-care/messages/:id/status', pathParams: { id } }),
  getConversation: (id: string) =>
    apiRequest<SupportConversationDetail>({ method: 'GET', path: '/customer-care/conversations/:id', pathParams: { id } }),
  closeConversation: (id: string) =>
    apiRequest<Record<string, unknown>>({ method: 'POST', path: '/customer-care/conversations/:id/close', pathParams: { id }, body: {} }),
  ...adminMethods,
} as const;

/** Compatibility view for the former admin-only service import. */
export const customerCareAdminService = {
  ...adminMethods,
  getConversation: adminMethods.getAdminConversation,
  markConversationRead: adminMethods.markAdminConversationRead,
} as const;

export type { SendSupportMessagePayload, UpdateSupportIncidentPayload, RetryCustomerCareBroadcastPayload };
