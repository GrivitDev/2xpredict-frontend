export interface AdminUserQueryDto {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
  role?: string;
  isVerified?: boolean;
  createdFrom?: string;
  createdTo?: string;
  plan?: string;
}
export interface SuspendUserDto {
  reason?: string;
  bannedUntil?: string | Date;
}
export interface GetUsersArgs { query?: AdminUserQueryDto }
export interface GetUserDetailsArgs { path: { id: string } }
export interface UserPathArgs { path: { id: string } }
export interface SuspendArgs extends UserPathArgs { body: SuspendUserDto }
export interface RevokeSessionArgs { path: { id: string; sessionId: string } }
export interface PaginatedUserArgs extends UserPathArgs { query?: { page?: number; limit?: number; status?: string } }
