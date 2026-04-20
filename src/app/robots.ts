import { MetadataRoute } from 'next'

/**
 * Robots.txt configuration for Discate.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/dashboard/verify-email',
    },
    sitemap: 'https://discate.com/sitemap.xml',
  }
}
