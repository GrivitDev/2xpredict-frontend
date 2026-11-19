/* Generated from backend controller: telegram/telegram.controller.ts. */
import { apiRequest } from '../lib/axios';
import type { HandleWebhookArgs } from '../types/endpoint-args/telegram';

export const telegramService = {
  handleWebhook: <TResponse = any>(args: HandleWebhookArgs) => {
    return apiRequest<TResponse>({
      method: 'POST',
      path: '/telegram/webhook',
      body: args.body,
    });
  },
} as const;

