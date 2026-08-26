import type {
  MetadataRoute,
} from 'next';

import {
  SEO,
} from '@/config/seo';


export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();


  return [
    {
      url: SEO.url,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },

    {
      url: `${SEO.url}/community`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },

    {
      url: `${SEO.url}/pricing`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    {
      url: `${SEO.url}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    {
      url: `${SEO.url}/privacy-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },

    {
      url: `${SEO.url}/terms-and-conditions`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}