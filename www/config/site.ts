import { env } from '~/config/env'

export const baseUrl = env.NEXT_PUBLIC_PROJECT_BASE_URL
export const siteConfig = {
  title: '@sugardarius/anzen',
  description:
    'Fast, flexible, framework validation agnostic, type‑safe factories for creating route handlers, page and layout Server Component files in Next.js.',
  socialLinks: {
    twitter: {
      url: 'https://twitter.com/azeldvin',
      name: '@azeldvin',
    },
    github: {
      url: 'https://github.com/SugarDarius',
      name: 'SugarDarius',
    },
  },
  npm: {
    url: 'https://www.npmjs.com/package/@sugardarius/anzen',
    name: '@sugardarius/anzen',
  },
  github: {
    url: 'https://github.com/SugarDarius/anzen',
    name: 'sugardarius/anzen',
  },
  authors: [
    {
      name: 'SugarDarius',
      url: 'https://github.com/SugarDarius',
    },
  ],
  creator: 'SugarDarius',
}
export type SiteConfig = typeof siteConfig
