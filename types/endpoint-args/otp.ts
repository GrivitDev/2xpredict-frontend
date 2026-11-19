/* Request contracts for otp endpoints. */
import type { ResendOtpDto, VerifyOtpDto } from '../requests';

export interface VerifyOtpArgs {
  body: VerifyOtpDto;
}

export interface ResendOtpArgs {
  body: ResendOtpDto;
}
