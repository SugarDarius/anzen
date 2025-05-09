import { env } from '~/config/env'

export const baseUrl = env.NEXT_PUBLIC_PROJECT_BASE_URL
export const siteConfig = {
  title: '@sugardarius/anzen',
  description:
    'A fast, framework validation agnostic, type-safe factory for creating Next.JS App Router route handlers.',
  socialLinks: {
    twitter: {
      url: 'https://twitter.com/azeldvin',
      name: '@azeldvin',
    },
    github: {
      url: 'https://github.com/SugarDarius/anzen',
      name: 'SugarDarius',
    },
  },
  authors: [
    {
      name: 'SugarDarius',
      url: baseUrl,
    },
  ],
  creator: 'SugarDarius',
}
export type SiteConfig = typeof siteConfig
