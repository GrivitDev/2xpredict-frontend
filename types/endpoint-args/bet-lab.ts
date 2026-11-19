import type { BetLabFixtureQuery, BetLabHistoryQuery, PlaceBetLabSlipPayload, PlaceBetLabTicketPayload } from '../bet-lab';
import type { BetLabMonitorEventsQuery } from '../monitoring';
export interface GetFixturesArgs { query?: BetLabFixtureQuery }
export interface GetMarketsArgs { path: { eventId: string } }
export interface GetOddsArgs { path: { eventId: string } }
export interface PlaceSingleTicketArgs { body: PlaceBetLabTicketPayload }
export interface PlaceAccumulatorArgs { body: PlaceBetLabSlipPayload }
export interface GetTicketsArgs { query?: BetLabHistoryQuery }
export interface GetTicketArgs { path: { ticketId: string } }
export interface BetLabLedgerQuery { page?: number; limit?: number }
export interface GetLedgerArgs { query?: BetLabLedgerQuery }
export type BetLabAdminEventsQuery = BetLabMonitorEventsQuery;
export interface GetRecentEventsArgs { query?: BetLabAdminEventsQuery }
