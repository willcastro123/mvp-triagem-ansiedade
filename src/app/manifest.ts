import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ZentiaMind - Saúde Mental',
    short_name: 'ZentiaMind',
    description: 'Aplicativo completo para cuidar da sua saúde mental com ferramentas de meditação, registro de humor, chat IA e muito mais.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#9333ea',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    categories: ['health', 'lifestyle', 'medical'],
    screenshots: [
      {
        src: '/screenshot-1.png',
        sizes: '1080x1920',
        type: 'image/png'
      }
    ]
  }
}
