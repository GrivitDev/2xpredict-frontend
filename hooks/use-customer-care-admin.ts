'use client';
import { useCustomerCareMonitor, monitoringQueryKeys, type MonitorHookOptions } from './use-monitoring';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerCareAdminService } from '../services/customer-care.service';
import type {
  CustomerCareActionQuery, CustomerCareBroadcastQuery, CustomerCareJobQuery,
  SupportConversationQuery, SupportIncidentQuery, RetryCustomerCareBroadcastPayload,
  UpdateSupportIncidentPayload, SupportInboxView,
} from '../types/customer-care';

export const customerCareAdminQueryKeys = {
  all: ['admin-customer-care'] as const,
  inboxSummary: () => ['admin-customer-care', 'inbox-summary'] as const,
  inbox: (view: SupportInboxView, limit = 50) => ['admin-customer-care', 'inbox', view, limit] as const,
  monitor: monitoringQueryKeys.customerCare(),
  conversations: (query: SupportConversationQuery = {}) => ['admin-customer-care', 'conversations', query] as const,
  conversation: (id: string) => ['admin-customer-care', 'conversation', id] as const,
  incidents: (query: SupportIncidentQuery = {}) => ['admin-customer-care', 'incidents', query] as const,
  incident: (id: string) => ['admin-customer-care', 'incident', id] as const,
  actions: (query: CustomerCareActionQuery = {}) => ['admin-customer-care', 'actions', query] as const,
  broadcasts: (query: CustomerCareBroadcastQuery = {}) => ['admin-customer-care', 'broadcasts', query] as const,
  jobs: (query: CustomerCareJobQuery = {}) => ['admin-customer-care', 'jobs', query] as const,
};

export function useCustomerCareAdminMonitor(options: MonitorHookOptions = {}) { return useCustomerCareMonitor(options); }
export function useCustomerCareAdminInboxSummary(options: MonitorHookOptions = {}) {
  return useQuery({ queryKey: customerCareAdminQueryKeys.inboxSummary(), queryFn: () => customerCareAdminService.getInboxSummary(), staleTime: 2_000, ...options });
}
export function useCustomerCareAdminInbox(view: SupportInboxView = 'open', limit = 50, options: MonitorHookOptions = {}) {
  return useQuery({ queryKey: customerCareAdminQueryKeys.inbox(view, limit), queryFn: () => customerCareAdminService.getInbox({ view, limit }), staleTime: 2_000, ...options });
}
function invalidateInbox(client: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    client.invalidateQueries({ queryKey: customerCareAdminQueryKeys.inboxSummary() }),
    client.invalidateQueries({ queryKey: ['admin-customer-care', 'inbox'] }),
    client.invalidateQueries({ queryKey: customerCareAdminQueryKeys.conversations() }),
    client.invalidateQueries({ queryKey: customerCareAdminQueryKeys.all }),
  ]);
}
export function useClaimCustomerCareConversation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => customerCareAdminService.claimConversation(id), onSuccess: async () => { await invalidateInbox(client); } });
}
export function useReplyToCustomerCareConversation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, message, clientMessageId }: { id: string; message: string; clientMessageId?: string }) => customerCareAdminService.replyToConversation(id, { message, clientMessageId }), onSuccess: async (_data, variables) => { await Promise.all([invalidateInbox(client), client.invalidateQueries({ queryKey: customerCareAdminQueryKeys.conversation(variables.id) })]); } });
}
export function useMarkAdminSupportConversationRead() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => customerCareAdminService.markConversationRead(id), onSuccess: async (_data, id) => { await Promise.all([client.invalidateQueries({ queryKey: customerCareAdminQueryKeys.conversation(id) }), client.invalidateQueries({ queryKey: customerCareAdminQueryKeys.inboxSummary() })]); } });
}
export function useReleaseCustomerCareConversation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => customerCareAdminService.releaseConversation(id), onSuccess: async () => { await invalidateInbox(client); } });
}
export function useResolveCustomerCareConversation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => customerCareAdminService.resolveConversation(id), onSuccess: async (_data, id) => { await Promise.all([invalidateInbox(client), client.invalidateQueries({ queryKey: customerCareAdminQueryKeys.conversation(id) })]); } });
}

export function useCustomerCareAdminConversations(query: SupportConversationQuery = {}, options: MonitorHookOptions = {}) { return useQuery({ queryKey: customerCareAdminQueryKeys.conversations(query), queryFn: () => customerCareAdminService.listConversations({ query }), staleTime: 10_000, ...options }); }
export function useCustomerCareAdminConversation(id?: string, options: MonitorHookOptions = {}) { return useQuery({ queryKey: customerCareAdminQueryKeys.conversation(id ?? ''), queryFn: () => customerCareAdminService.getConversation({ path: { id: id as string } }), staleTime: 10_000, ...options, enabled: Boolean(id) && options.enabled !== false }); }
export function useCustomerCareAdminIncidents(query: SupportIncidentQuery = {}, options: MonitorHookOptions = {}) { return useQuery({ queryKey: customerCareAdminQueryKeys.incidents(query), queryFn: () => customerCareAdminService.listIncidents({ query }), staleTime: 10_000, ...options }); }
export function useCustomerCareAdminIncident(id?: string, options: MonitorHookOptions = {}) { return useQuery({ queryKey: customerCareAdminQueryKeys.incident(id ?? ''), queryFn: () => customerCareAdminService.getIncident({ path: { id: id as string } }), staleTime: 10_000, ...options, enabled: Boolean(id) && options.enabled !== false }); }
export function useCustomerCareAdminActions(query: CustomerCareActionQuery = {}, options: MonitorHookOptions = {}) { return useQuery({ queryKey: customerCareAdminQueryKeys.actions(query), queryFn: () => customerCareAdminService.listActions({ query }), staleTime: 10_000, ...options }); }
export function useCustomerCareAdminBroadcasts(query: CustomerCareBroadcastQuery = {}, options: MonitorHookOptions = {}) { return useQuery({ queryKey: customerCareAdminQueryKeys.broadcasts(query), queryFn: () => customerCareAdminService.listBroadcasts({ query }), staleTime: 10_000, ...options }); }
export function useCustomerCareAdminJobs(query: CustomerCareJobQuery = {}, options: MonitorHookOptions = {}) { return useQuery({ queryKey: customerCareAdminQueryKeys.jobs(query), queryFn: () => customerCareAdminService.listJobs({ query }), staleTime: 10_000, ...options }); }

export function useUpdateCustomerCareIncident() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, body }: { id: string; body: UpdateSupportIncidentPayload }) => customerCareAdminService.updateIncident({ path: { id }, body }), onSuccess: async (_data, variables) => { await Promise.all([client.invalidateQueries({ queryKey: customerCareAdminQueryKeys.incidents() }), client.invalidateQueries({ queryKey: customerCareAdminQueryKeys.incident(variables.id) }), client.invalidateQueries({ queryKey: customerCareAdminQueryKeys.monitor })]); } });
}
export function useRetryCustomerCareBroadcast() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, body }: { id: string; body?: RetryCustomerCareBroadcastPayload }) => customerCareAdminService.retryBroadcast({ path: { id }, body }), onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: customerCareAdminQueryKeys.broadcasts() }), client.invalidateQueries({ queryKey: customerCareAdminQueryKeys.jobs() }), client.invalidateQueries({ queryKey: customerCareAdminQueryKeys.monitor })]); } });
}
export function useRetryCustomerCareJob() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => customerCareAdminService.retryJob({ path: { id } }), onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: customerCareAdminQueryKeys.jobs() }), client.invalidateQueries({ queryKey: customerCareAdminQueryKeys.monitor })]); } });
}

