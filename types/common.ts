import type {
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';

export interface Pagination {
  page: number;
  pageSize?: number;
  limit?: number;
  total: number;
  pages: number;
}

export interface PageResult<T> {
  items: T[];
  pagination?: Pagination;
  accessPlan?: string;
  locked?: boolean;
  message?: string;
}

export interface LimitPageResult<T> {
  items: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface IdRecord {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DateRangeQuery {
  from?: string;
  to?: string;
}

/** Standard message-only responses returned by session and account actions. */
export interface ApiMessage {
  message: string;
}

/** Generic JSON object accepted by webhook and external callback endpoints. */
export type JsonObject = Record<string, unknown>;

/** Admin user listing response returned by UsersService.findAll(). */
export interface UsersPage<TUser> {
  users: TUser[];
  total: number;
  page: number;
  totalPages: number;
}

export type QueryParamValue = string | number | boolean | undefined;
export type QueryParams = Record<string, QueryParamValue>;

/**
 * Options available to a query hook caller. The hook retains ownership of its
 * queryKey and queryFn so consumers cannot replace the endpoint contract.
 */
export type ApiQueryHookOptions<
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TError = Error,
> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData>,
  'queryKey' | 'queryFn'
>;

/**
 * Options available to a mutation hook caller. The service-backed mutationFn
 * remains owned by the hook and cannot be overridden by the consumer.
 */
export type ApiMutationHookOptions<
  TData = unknown,
  TVariables = void,
  TError = Error,
  TContext = unknown,
> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  'mutationFn'
>;

/** Source-derived route metadata used by the frontend/backend contract inventory. */
export interface ApiEndpointDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'ALL';
  path: string;
  controller: string;
  handler: string;
  serviceFile: string | null;
  service: string | null;
  hookFile: string | null;
  hook: string | null;
  fileField: string | null;
  serverToServer: boolean;
  auth?: string;
  roles?: string;
  stream?: boolean;
}
