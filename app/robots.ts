import { MetadataRoute } from 'next';
import { SEO } from '@/config/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },

    sitemap: `${SEO.url}/sitemap.xml`,
  };
}