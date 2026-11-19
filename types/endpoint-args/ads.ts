import type { AdAnalyticsQuery, AdEventQuery, AdsListQuery, CreateAdPayload, ExternalAdPolicy, UpdateAdPayload, AdAudienceKey, AdContentSource, AdDevice, AdPage, AdPosition, AdTriggerEvent, TrackAdEventPayload } from '../ads';
export interface GetAdsQuery { page: AdPage; device?: AdDevice; position?: AdPosition; triggerEvent?: AdTriggerEvent; visitorKey?: string; sessionKey?: string }
export interface GetAdsArgs { query: GetAdsQuery }
export interface TrackEventArgs { path: { id: string }; body: TrackAdEventPayload }
export interface RecordImpressionArgs { path: { id: string }; body?: Pick<TrackAdEventPayload, 'eventKey' | 'visitorKey' | 'sessionKey'> }
export interface RecordClickArgs extends RecordImpressionArgs {}
export interface CreateArgs { body: CreateAdPayload }
export interface FindOneArgs { path: { id: string } }
export interface UpdateArgs { path: { id: string }; body: UpdateAdPayload }
export interface RemoveArgs { path: { id: string } }
export interface ToggleStatusArgs { path: { id: string } }
export interface ListArgs { query?: AdsListQuery }
export interface AnalyticsArgs { query?: AdAnalyticsQuery }
export interface EventsArgs { query?: AdEventQuery }
export interface DiscoverArgs { query?: { kind?: AdContentSource } }
export interface PreviewArgs { path: { id: string }; query: { audience: AdAudienceKey } }
export interface UpdateExternalPolicyArgs { body: Partial<ExternalAdPolicy> }
