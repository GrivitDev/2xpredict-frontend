// lib/getApiErrorMessage.ts

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {

  const axiosError =
    error as {
      response?: {
        data?: {
          message?: string | string[];
          error?: string;
        };
      };
      message?: string;
    };


  const message =
    axiosError?.response?.data?.message;


  if (Array.isArray(message)) {

    return message.join(', ');

  }


  if (
    typeof message === 'string' &&
    message.trim()
  ) {

    return message;

  }


  const apiError =
    axiosError?.response?.data?.error;


  if (
    typeof apiError === 'string' &&
    apiError.trim()
  ) {

    return apiError;

  }


  if (
    typeof axiosError?.message === 'string' &&
    axiosError.message.trim()
  ) {

    return axiosError.message;

  }


  return fallback;

}