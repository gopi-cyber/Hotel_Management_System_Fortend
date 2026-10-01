import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LuxeStay Luxury Hotels & Residences',
    short_name: 'LuxeStay',
    description: 'Bespoke 5-star hotel management, luxury suites, and 24/7 guest concierge.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#08090C',
    theme_color: '#08090C',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
