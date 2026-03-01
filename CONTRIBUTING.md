# Contributing to STEM Impact Academy

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. Fork and clone the repository.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in the values.
4. Start the dev server: `npm run dev`

## Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes following the conventions below.
3. Run checks before committing:
   ```bash
   npm run format
   npm run lint
   npm test
   ```
4. Push your branch and open a pull request against `main`.

## Code Conventions

- **Components**: PascalCase `.tsx` files in `src/components/`
- **Hooks**: `useX` naming in `src/hooks/`
- **Utilities**: kebab-case `.ts` files in `src/lib/`
- **Types**: add to `src/lib/types.ts`
- **Constants**: add to `src/lib/constants.ts`
- **Imports**: use the `@/` path alias

## Commit Messages

Use clear, imperative-mood messages:

```
Add student badge notification system
Fix enrollment count on teacher dashboard
Update course creation form validation
```

## Pull Requests

- Keep PRs focused on a single change.
- Include a description of what changed and why.
- Ensure CI passes before requesting review.
