# STEM Impact Academy

A full-stack learning management platform for STEM education in Kenya, built with Next.js and Firebase.

## Tech Stack

| Layer       | Technology                         |
| ----------- | ---------------------------------- |
| Framework   | Next.js 16 (App Router)            |
| UI          | React 19, Tailwind CSS 4           |
| Language    | TypeScript 5 (strict)              |
| Auth        | Firebase Authentication            |
| Database    | Cloud Firestore                    |
| Storage     | Firebase Storage                   |
| Email       | Resend                             |
| Hosting     | Firebase Hosting                   |
| CI          | GitHub Actions                     |

## Architecture

```
src/
├── app/                  # Next.js App Router
│   ├── student/          # Student dashboard, lessons, badges, portfolio
│   ├── teacher/          # Teacher dashboard, courses, grading, analytics
│   ├── admin/
│   │   ├── global/       # Super-admin: users, schools, content, audit
│   │   └── school/       # School admin: students, teachers, classrooms
│   ├── course-creator/   # Multi-step course creation wizard
│   └── api/              # API route handlers
├── components/           # Reusable UI components
├── hooks/                # Custom React hooks (data fetching, auth, uploads)
├── lib/                  # Utilities, Firebase config, types, email service
└── contexts/             # React context providers (auth)
```

### Roles

The platform supports five user roles with route-level access control:

- **Student** — browse courses, complete lessons, earn badges
- **Teacher** — create courses, manage classrooms, grade submissions
- **School Admin** — manage school-level students, teachers, and analytics
- **Admin** — manage pending approvals and teacher accounts
- **Super Admin** — platform-wide settings, all schools, audit logs

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Firebase project with Authentication, Firestore, and Storage enabled
- A [Resend](https://resend.com) account for transactional emails

### Setup

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd academy-stem-kenya
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in all values in `.env.local` — see `.env.example` for documentation.

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Start development server           |
| `npm run build`      | Production build                   |
| `npm start`          | Start production server            |
| `npm run lint`       | Run ESLint                         |
| `npm test`           | Run tests (Vitest)                 |
| `npm run test:watch` | Run tests in watch mode            |
| `npm run format`     | Format code with Prettier          |
| `npm run format:check` | Check formatting without changes |

## Testing

Tests are written with [Vitest](https://vitest.dev) and located in `src/__tests__/`.

```bash
npm test              # single run
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

## Deployment

The project is configured for Firebase Hosting:

```bash
npm run build
firebase deploy
```

## Project Conventions

- **Components**: PascalCase `.tsx` files in `src/components/`
- **Hooks**: `useX` naming in `src/hooks/`
- **Utilities**: kebab-case `.ts` files in `src/lib/`
- **Types**: centralized in `src/lib/types.ts`
- **Imports**: use `@/` path alias (maps to `src/`)
- **Formatting**: Prettier with ESLint integration
