import { apiRequest } from '../lib/axios';
import type { ApproveArgs, CreateArgs, RejectArgs } from '../types/endpoint-args/payments';
import type { CreatePaymentResponse, Payment, PaymentDecisionResponse } from '../types/payments';

/** Client for the Payments NestJS module. */
export const paymentsService = {
  create: (args: CreateArgs) =>
    apiRequest<CreatePaymentResponse>({ method: 'POST', path: '/payments', body: args.body }),
  getMyPayments: () =>
    apiRequest<Payment[]>({ method: 'GET', path: '/payments/me' }),
  approve: (args: ApproveArgs) =>
    apiRequest<PaymentDecisionResponse>({ method: 'PATCH', path: '/payments/:id/approve', pathParams: args.path }),
  reject: (args: RejectArgs) =>
    apiRequest<Payment>({ method: 'PATCH', path: '/payments/:id/reject', pathParams: args.path }),
  pending: () =>
    apiRequest<Payment[]>({ method: 'GET', path: '/payments/pending' }),
  all: () =>
    apiRequest<Payment[]>({ method: 'GET', path: '/payments' }),
} as const;
