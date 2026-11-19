const DEFAULT_SITE_URL = 'https://www.2xpredict.com';

function resolveSiteUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    DEFAULT_SITE_URL;

  try {
    return new URL(configuredUrl).toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SEO = {
  url: resolveSiteUrl(),
  title: '2xPredict',
  description:
    'Football insights, match statistics and carefully analysed predictions on 2xPredict.',
  keywords: [
    '2xPredict',
    'football predictions',
    'football statistics',
    'match analysis',
    'football insights',
  ],
  image: '/banner.png',
};
