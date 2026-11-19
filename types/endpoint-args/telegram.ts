/* Request contracts for telegram endpoints. */
import type { JsonObject } from '../common';

export interface HandleWebhookArgs {
  body: JsonObject;
}
