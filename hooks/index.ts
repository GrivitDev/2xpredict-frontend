export * as adminUsersHooks from './use-admin-users';
export * as adsHooks from './use-ads';
export * as analyticsHooks from './use-analytics';
export * as authHooks from './use-auth';
export * as otpHooks from './use-otp';
export * as betLabHooks from './use-bet-lab';
export * as bonusesHooks from './use-bonuses';
export * as customerCareHooks from './use-customer-care';
export * as internalAdsHooks from './use-internal-ads';
export * as notificationsHooks from './use-notifications';
export * as oddsHooks from './use-odds';
export * as paymentGatewaysHooks from './use-payment-gateways';
export * as paymentsHooks from './use-payments';
export * as planConfigHooks from './use-plan-config';
export * as predictionAccessHooks from './use-prediction-access';
export * as predictionEngineHooks from './use-prediction-engine';
export * as promosHooks from './use-promos';
export * as referralsHooks from './use-referrals';
export * as settlementHooks from './use-settlement-admin';
export * as sportsHooks from './use-sports';
export * as subscriptionsHooks from './use-subscriptions';
export * as systemMonitorHooks from './use-monitoring';
export * as uploadsHooks from './use-uploads';
export * as userSessionHooks from './use-user-session';
export * as usersHooks from './use-users';
export * as websiteAnalyticsHooks from './use-website-analytics';

// Presentation/infrastructure hooks are intentionally separate from NestJS domain modules.
export * as adminRealtimeHooks from './use-admin-realtime';
export * as matchPresentationHooks from './use-match-presentation';

// Authenticated Socket.IO bridge for private user notification events.
export * as userNotificationRealtimeHooks from './use-user-notification-realtime';
