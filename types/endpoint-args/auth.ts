/* Request contracts for auth endpoints. */
import type { ChangePasswordBody, LoginDto, RegisterDto, RequestEmailChangeDto, RequestPasswordResetBody, ResetPasswordBody, VerifyEmailChangeDto } from '../requests';

export interface RegisterArgs {
  body: RegisterDto;
}

export interface LoginArgs {
  body: LoginDto;
}

export interface RequestPasswordResetArgs {
  body: RequestPasswordResetBody;
}

export interface ResetPasswordArgs {
  body: ResetPasswordBody;
}

export interface RequestEmailChangeArgs {
  body: RequestEmailChangeDto;
}

export interface VerifyCurrentEmailForChangeArgs {
  body: VerifyEmailChangeDto;
}

export interface VerifyNewEmailForChangeArgs {
  body: VerifyEmailChangeDto;
}

export interface ChangePasswordArgs {
  body: ChangePasswordBody;
}
