import axios from 'axios';

/** Extract a useful server/client error message without leaking raw response objects. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown; error?: unknown } | undefined;
    const message = data?.message ?? data?.error;
    if (Array.isArray(message)) {
      const parts = message.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      if (parts.length) return parts.join(' ');
    }
    if (typeof message === 'string' && message.trim()) return message;
    if (!error.response) return 'Unable to reach the server. Check your connection and try again.';
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

