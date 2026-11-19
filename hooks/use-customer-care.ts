'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerCareService } from '../services/customer-care.service';
import type { SendSupportMessagePayload } from '../types/customer-care';

export interface CustomerSupportQueryOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export const customerCareQueryKeys = {
  all: ['customer-care'] as const,
  conversations: (query: { limit?: number } = {}) => ['customer-care', 'conversations', query] as const,
  conversation: (id: string) => ['customer-care', 'conversation', id] as const,
  messageStatus: (id: string) => ['customer-care', 'message-status', id] as const,
  notificationSummary: () => ['customer-care', 'notification-summary'] as const,
};

export function useMySupportConversations(query: { limit?: number } = {}, options: CustomerSupportQueryOptions = {}) {
  return useQuery({
    queryKey: customerCareQueryKeys.conversations(query),
    queryFn: () => customerCareService.getMyConversations(query),
    staleTime: 5_000,
    ...options,
  });
}

export function useSupportConversation(id?: string, options: CustomerSupportQueryOptions = {}) {
  return useQuery({
    queryKey: customerCareQueryKeys.conversation(id ?? ''),
    queryFn: () => customerCareService.getConversation(id as string),
    staleTime: 2_000,
    ...options,
    enabled: Boolean(id) && options.enabled !== false,
  });
}

export function useSupportNotificationSummary(options: CustomerSupportQueryOptions = {}) {
  return useQuery({
    queryKey: customerCareQueryKeys.notificationSummary(),
    queryFn: () => customerCareService.getNotificationSummary(),
    staleTime: 2_000,
    ...options,
  });
}

export function useSupportMessageStatus(
  id?: string,
  options: CustomerSupportQueryOptions = {},
) {
  return useQuery({
    queryKey: customerCareQueryKeys.messageStatus(id ?? ''),
    queryFn: () => customerCareService.getMessageStatus(id as string),
    staleTime: 0,
    ...options,
    enabled: Boolean(id) && options.enabled !== false,
  });
}

export function useSendSupportMessage() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendSupportMessagePayload) => customerCareService.sendMessage({ body: payload, idempotencyKey: payload.clientMessageId }),
    onSuccess: () => {
      // Don't make a successful send wait for the entire conversation refetch.
      // The message-status query tracks the reply; these refreshes can run in parallel.
      void Promise.all([
        client.invalidateQueries({ queryKey: ['customer-care', 'conversations'] }),
        client.invalidateQueries({ queryKey: ['customer-care', 'conversation'] }),
        client.invalidateQueries({ queryKey: customerCareQueryKeys.notificationSummary() }),
      ]).catch(() => undefined);
    },
  });
}

export function useMarkSupportConversationRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerCareService.markConversationRead(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: customerCareQueryKeys.notificationSummary() }),
        client.invalidateQueries({ queryKey: customerCareQueryKeys.conversation(id) }),
      ]);
    },
  });
}

export function useCloseSupportConversation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerCareService.closeConversation(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['customer-care', 'conversations'] }),
        client.invalidateQueries({ queryKey: customerCareQueryKeys.conversation(id) }),
        client.invalidateQueries({ queryKey: customerCareQueryKeys.notificationSummary() }),
      ]);
    },
  });
}
