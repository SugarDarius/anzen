import { env } from '~/config/env'

export const baseUrl = env.NEXT_PUBLIC_PROJECT_BASE_URL
export const siteConfig = {
  authors: [
    {
      name: 'SugarDarius',
      url: 'https://github.com/SugarDarius',
    },
  ],
  creator: 'SugarDarius',
  description:
    'Fast, flexible, framework validation agnostic, type‑safe factories for creating server actions, route handlers, page and layout Server Component files in Next.js.',
  github: {
    name: 'sugardarius/anzen',
    url: 'https://github.com/SugarDarius/anzen',
  },
  npm: {
    name: '@sugardarius/anzen',
    url: 'https://www.npmjs.com/package/@sugardarius/anzen',
  },
  socialLinks: {
    github: {
      name: 'SugarDarius',
      url: 'https://github.com/SugarDarius',
    },
    twitter: {
      name: '@azeldvin',
      url: 'https://twitter.com/azeldvin',
    },
  },
  title: '@sugardarius/anzen',
}
export type SiteConfig = typeof siteConfig
