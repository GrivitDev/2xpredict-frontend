import axios, {
  AxiosHeaders,
  type AxiosHeaderValue,
  type AxiosRequestConfig,
  type Method,
} from 'axios';
import Cookies from 'js-cookie';

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

function normalizeBaseUrl(value: string | undefined): string {
  const raw = (value || 'http://localhost:5000').replace(/\/+$/, '');
  return raw.endsWith('/api') ? raw : `${raw}/api`;
}

const normalizedApiBaseUrl = normalizeBaseUrl(configuredApiUrl);

const api = axios.create({
  baseURL: normalizedApiBaseUrl,
  withCredentials: true,
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = Cookies.get('token') || window.localStorage.getItem('token');

    if (token) {
      config.headers = config.headers ?? AxiosHeaders.from({});
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export type ApiPathParamValue = string | number;
export type ApiPathParams = Record<string, ApiPathParamValue>;

/**
 * Axios options controlled by the transport layer are deliberately excluded.
 * Callers must provide method, path, query and body through the API contract.
 */
export type ApiAxiosConfig = Omit<
  AxiosRequestConfig,
  'method' | 'url' | 'params' | 'data'
>;

export interface ApiRequestOptions<
  TQuery extends object = object,
  TBody = unknown,
> {
  method: Method;
  path: string;
  pathParams?: ApiPathParams;
  query?: TQuery;
  body?: TBody;
  file?: File;
  fileField?: string;
  config?: ApiAxiosConfig;
}

function resolvePath(path: string, params?: ApiPathParams): string {
  const resolved = path.replace(
    /:([A-Za-z_$][\w$]*)/g,
    (placeholder, key: string) => {
      const value = params?.[key];

      if (value === undefined || value === null) {
        throw new Error(
          `Missing route parameter ":${key}" while resolving API path: ${path}`,
        );
      }

      return encodeURIComponent(String(value));
    },
  );

  return resolved.startsWith('/') ? resolved : `/${resolved}`;
}

function appendFormDataValue(
  formData: FormData,
  key: string,
  value: unknown,
): void {
  if (value === undefined || value === null) return;

  if (value instanceof Blob) {
    formData.append(key, value);
    return;
  }

  if (typeof value === 'string') {
    formData.append(key, value);
    return;
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    formData.append(key, String(value));
    return;
  }

  formData.append(key, JSON.stringify(value));
}

export async function apiRequest<
  TResponse,
  TQuery extends object = object,
  TBody = unknown,
>(options: ApiRequestOptions<TQuery, TBody>): Promise<TResponse> {
  const url = resolvePath(options.path, options.pathParams);
  let data: unknown = options.body;
  const headers = AxiosHeaders.from();
  if (options.config?.headers) {
    // AxiosRequestConfig.headers includes a partial method-header shape that
    // is broader than AxiosHeaders.from()'s accepted raw-header type. Copying
    // entries through set() preserves values without weakening request config.
    for (const [name, value] of Object.entries(options.config.headers)) {
      if (value !== undefined) headers.set(name, value as AxiosHeaderValue);
    }
  }

  if (options.file) {
    const formData = new FormData();
    formData.append(options.fileField || 'file', options.file);

    if (options.body && typeof options.body === 'object') {
      for (const [key, value] of Object.entries(
        options.body as Record<string, unknown>,
      )) {
        appendFormDataValue(formData, key, value);
      }
    }

    data = formData;
    // The browser must set the multipart boundary itself.
    headers.delete('Content-Type');
  }

  const response = await api.request<TResponse>({
    ...(options.config ?? {}),
    method: options.method,
    url,
    params: options.query,
    data,
    headers,
  });

  return response.data;
}

export const apiBaseURL = (): string => api.defaults.baseURL ?? '';

export const API_BASE_URL = (configuredApiUrl || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/+$/, '');

export const getCurrentAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return Cookies.get('token') || window.localStorage.getItem('token');
};

export default api;
