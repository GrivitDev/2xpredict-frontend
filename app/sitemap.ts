import { MetadataRoute } from 'next';
import { SEO } from '@/config/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SEO.url,
      lastModified: new Date(),
      priority: 1,
    },

    {
      url: `${SEO.url}/predictions`,
      lastModified: new Date(),
      priority: 0.9,
    },

    {
      url: `${SEO.url}/live-scores`,
      lastModified: new Date(),
      priority: 0.9,
    },

    {
      url: `${SEO.url}/fixtures`,
      lastModified: new Date(),
      priority: 0.8,
    },

    {
      url: `${SEO.url}/articles`,
      lastModified: new Date(),
      priority: 0.8,
    },

    {
      url: `${SEO.url}/standings`,
      lastModified: new Date(),
      priority: 0.8,
    },

    {
      url: `${SEO.url}/pricing`,
      lastModified: new Date(),
      priority: 0.7,
    },
  ];
}