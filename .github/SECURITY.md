# Security Policy

Thank you for helping keep **@sugardarius/anzen** and its users safe. We take security reports seriously and appreciate responsible disclosure.

## Supported Versions

Only the **current release on the [`main`](https://github.com/SugarDarius/anzen/tree/main) branch** is supported for security fixes. Older tags, release branches, and forks are not maintained for security updates.

| Version                     | Supported |
| --------------------------- | --------- |
| Latest on `main`            | ✅        |
| Any other version or branch | ❌        |

Before reporting, please confirm the vulnerability reproduces against the latest commit on `main`. If it only affects an older published version, upgrade first and retest.

## Reporting a Vulnerability

**Please do not open a public issue for undisclosed security vulnerabilities.**

If you believe you have found a security issue, report it through one of the following channels:

1. **GitHub (preferred)** — [Open a new issue](https://github.com/SugarDarius/anzen/issues/new) and clearly mark it as a security report in the title (for example, `[Security]`). Include enough detail for us to reproduce and assess the impact. If the issue is sensitive, say so in the description and we can move the conversation to a private channel.
2. **Twitter/X** — Contact [@azeldvin](https://twitter.com/azeldvin) with a brief summary and a way to reach you for follow-up. Please avoid posting exploit details publicly.

### What to Include

To help us respond quickly, your report should include:

- A clear description of the vulnerability and its potential impact
- Steps to reproduce, ideally against the latest `main` branch
- Affected APIs, modules, or usage patterns (for example, server actions, route handlers, server components)
- Your `@sugardarius/anzen`, Next.js, and Node.js versions
- Any proof-of-concept code, logs, or screenshots (keep these private until we coordinate disclosure)

## Response Expectations

We aim to acknowledge reports within **7 days**. We will work with you to understand the issue, develop a fix on `main`, and coordinate disclosure timing when appropriate.

We may ask for additional information or suggest mitigations while a fix is in progress. We ask that you do not publicly disclose the vulnerability until we have had a reasonable opportunity to address it.

## Scope

This policy covers security issues in the **@sugardarius/anzen** library itself. Vulnerabilities in Next.js, React, your application code, or third-party dependencies should be reported to the respective projects unless they are directly introduced or materially worsened by this library.

## Recognition

We are grateful to security researchers and community members who report issues responsibly. With your permission, we are happy to acknowledge your contribution when a fix is released.
