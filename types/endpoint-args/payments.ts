import type { CreateManualPaymentPayload } from '../payments';

export interface CreateArgs {
  body: CreateManualPaymentPayload;
}

export interface ApproveArgs {
  path: { id: string };
}

export interface RejectArgs {
  path: { id: string };
}
