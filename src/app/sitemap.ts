
import { MetadataRoute } from 'next'

/**
 * Dynamic sitemap generation for Discate.
 * This file helps search engines index the elite mentorship platform correctly.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://discate.com'
  const lastModified = new Date('2026-04-23')

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/dashboard/assessments`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/dashboard/essay-lab`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/dashboard/history`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/dashboard/performance`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.6,
    },
  ]
}
