'use client';
/* React Query hooks for every telegram controller endpoint. */
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { telegramService } from '../services/telegram.service';
import type { HandleWebhookArgs } from '../types/endpoint-args/telegram';

export function useHandleWebhookMutation<TData = any>(options?: ApiMutationHookOptions<TData, HandleWebhookArgs>) {
  return useMutation<TData, Error, HandleWebhookArgs>({
    mutationFn: (args: HandleWebhookArgs) => telegramService.handleWebhook<TData>(args),
    ...options,
  });
}

