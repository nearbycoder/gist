# Gist

A modern gist management application built with React, TypeScript, and TanStack Router.

## Features

- Create and manage code snippets (gists)
- Support for multiple programming languages
- Public and private gists
- Version control for your gists
- Markdown preview support
- Modern, responsive UI

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- SQLite (for development)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd gist
```

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Set up your environment variables:

```bash
cp .env.example .env
```

4. Initialize the database:

```bash
npx prisma db push
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Development

- `app/` - Contains the application source code
- `prisma/` - Database schema and migrations
- `public/` - Static assets
- `app/components/` - Reusable React components
- `app/routes/` - Application routes and pages

## Tech Stack

- React
- TypeScript
- TanStack Start
- Prisma (ORM)
- SQLite (Database)
- Tailwind CSS (Styling)
- shadcn/ui (UI Components)
