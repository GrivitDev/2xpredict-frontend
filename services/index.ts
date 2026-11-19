/**
 * Canonical frontend service registry.
 * Each exported service maps to one NestJS backend module.
 * Controller-specific compatibility files are deliberately not exported here.
 */
export { adminUsersService } from './admin-users.service';
export { adsService } from './ads.service';
export { analyticsService } from './analytics.service';
export { authService } from './auth.service';
export { otpService } from './otp.service';
export { betLabService } from './bet-lab.service';
export { bonusesService } from './bonuses.service';
export { customerCareService } from './customer-care.service';
export { internalAdsService } from './internal-ads.service';
export { notificationsService } from './notifications.service';
export { oddsService } from './odds.service';
export { paymentGatewaysService } from './payment-gateways.service';
export { paymentsService } from './payments.service';
export { planConfigService } from './plan-config.service';
export { predictionAccessService } from './prediction-access.service';
export { predictionEngineService } from './prediction-engine.service';
export { promosService } from './promos.service';
export { referralsService } from './referrals.service';
export { settlementService } from './settlement.service';
export { sportsService } from './sports.service';
export { subscriptionsService } from './subscriptions.service';
export { systemMonitorService } from './system-monitor.service';
export { uploadsService } from './uploads.service';
export { userSessionService } from './user-session.service';
export { usersService } from './users.service';
export { websiteAnalyticsService } from './website-analytics.service';
