import type { SendSupportMessagePayload, SupportConversationQuery, SupportIncidentQuery, CustomerCareActionQuery, CustomerCareBroadcastQuery, CustomerCareJobQuery, RetryCustomerCareBroadcastPayload, UpdateSupportIncidentPayload } from '../customer-care';
export interface SendMessageArgs { body: SendSupportMessagePayload; idempotencyKey?: string }
export interface ListMyConversationsArgs { query?: { limit?: number } }
export interface MessageIdArgs { path: { id: string } }
export interface ConversationIdArgs { path: { id: string } }
export interface ListAdminConversationsArgs { query?: SupportConversationQuery }
export interface ListAdminIncidentsArgs { query?: SupportIncidentQuery }
export interface ListAdminActionsArgs { query?: CustomerCareActionQuery }
export interface ListAdminBroadcastsArgs { query?: CustomerCareBroadcastQuery }
export interface ListAdminJobsArgs { query?: CustomerCareJobQuery }
export interface SupportRecordIdArgs { path: { id: string } }
export interface UpdateIncidentArgs extends SupportRecordIdArgs { body: UpdateSupportIncidentPayload }
export interface RetryBroadcastArgs extends SupportRecordIdArgs { body?: RetryCustomerCareBroadcastPayload }
