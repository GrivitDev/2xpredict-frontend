import api from '@/lib/axios';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  fullName: string;
  username: string;
  phoneNumber: string;
  email: string;
  password: string;
  referralCode?: string;
  promoCode?: string;
}

interface VerifyOtpData {
  email: string;
  code: string;
}
interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (
  data: ChangePasswordData,
) => {
  const response = await api.post(
    '/auth/change-password',
    data,
  );

  return response.data;
};

export const loginUser = async (
  data: LoginData,
) => {
  const response = await api.post(
    '/auth/login',
    data,
  );

  if (response.data.token) {
    localStorage.setItem(
      'token',
      response.data.token,
    );
  }

  return response.data;
};

export const registerUser = async (
  data: RegisterData,
) => {
  const response = await api.post(
    '/auth/register',
    data,
  );

  return response.data;
};

export const verifyOtp = async (
  data: VerifyOtpData,
) => {
  const response = await api.post(
    '/otp/verify',
    data,
  );

  return response.data;
};

export const resendOtp = async (
  email: string,
) => {
  const response = await api.post(
    '/otp/resend',
    { email },
  );

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getCurrentUser =
  async () => {
    const token = getToken();

    const response = await api.get(
      '/auth/me',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  };
  