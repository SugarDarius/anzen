import { createHash } from 'node:crypto'

import { baseUrl } from '~/config/site'

const DISCOVERY_SCHEMA =
  'https://schemas.agentskills.io/discovery/0.2.0/schema.json' as const

interface SkillBundle {
  readonly description: string
  readonly skillMd: string
}

const anzenSkillMd = `---
name: anzen
description: Use Anzen factories for type-safe Next.js App Router server actions, route handlers, pages, and layouts.
---

# Anzen

This project publishes **@sugardarius/anzen** — framework-validation-agnostic factories for Next.js route handlers, Server Components, and **safe server actions** built with \`createSafeServerAction\` (optional [Standard Schema](https://standardschema.dev/) input validation, optional authorization, and a consistent \`{ success, output | error }\` result shape).

## When to use this skill

Use when generating or refactoring:

- \`'use server'\` modules: \`createSafeServerAction\` for actions with or without an \`input\` schema (callers may pass a plain object or \`FormData\` when a schema is set)
- \`route.ts\` handlers (GET, POST, and other exports)
- \`page.tsx\` and \`layout.tsx\` as Server Components
- Typed access to segment params and search params via factory patterns

## Conventions

- Prefer Anzen factory helpers from the package API instead of ad-hoc typing.
- For server actions, use \`createSafeServerAction\` and keep \`'use server'\` at the top of the module; avoid ad-hoc validation or error envelopes when the factory already covers the flow.
- Match import style and path aliases in the host app (for example \`~\` in this docs site).
- Keep Server Components free of client-only APIs unless the module is a Client Component.

## References

- Docs 
  — Safe server action (\`www/content/docs/server-action.mdx\`): https://github.com/SugarDarius/anzen/blob/main/www/content/docs/server-action.mdx
  - Safe route handler (\`www/content/docs/route-handler.mdx\`): https://github.com/SugarDarius/anzen/blob/main/www/content/docs/route-handler.mdx
  - Safe page server component (\`www/content/docs/page-server-component.mdx\`): https://github.com/SugarDarius/anzen/blob/main/www/content/docs/page-server-component.mdx
  - Safe layout server component (\`www/content/docs/layout-server-component.mdx\`): https://github.com/SugarDarius/anzen/blob/main/www/content/docs/layout-server-component.mdx
- npm: https://www.npmjs.com/package/@sugardarius/anzen
- Repository: https://github.com/SugarDarius/anzen
`

export const agentSkillArtifacts: Record<string, SkillBundle> = {
  anzen: {
    description:
      'Use Anzen factories for type-safe Next.js App Router server actions, route handlers, pages, and layouts.',
    skillMd: anzenSkillMd,
  },
}

export function skillArtifactUrl(skillName: string): string {
  return new URL(
    `/.well-known/agent-skills/${skillName}/SKILL.md`,
    baseUrl,
  ).toString()
}

export function sha256DigestOfUtf8(text: string): string {
  const hex = createHash('sha256').update(text, 'utf-8').digest('hex')
  return `sha256:${hex}`
}

export function getAgentSkillsDiscoveryIndex(): {
  $schema: string
  skills: {
    name: string
    type: 'skill-md'
    description: string
    url: string
    digest: string
  }[]
} {
  const skills = Object.entries(agentSkillArtifacts).map(([name, bundle]) => ({
    description: bundle.description,
    digest: sha256DigestOfUtf8(bundle.skillMd),
    name,
    type: 'skill-md' as const,
    url: skillArtifactUrl(name),
  }))

  skills.sort((a, b) => a.name.localeCompare(b.name))

  return {
    $schema: DISCOVERY_SCHEMA,
    skills,
  }
}

export function getSkillMarkdown(skillName: string): string | undefined {
  return agentSkillArtifacts[skillName]?.skillMd
}
