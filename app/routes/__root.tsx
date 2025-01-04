import {
  Outlet,
  ScrollRestoration,
  createRootRoute,
} from '@tanstack/react-router';
import { Meta, Scripts } from '@tanstack/start';
import type { ReactNode } from 'react';
import globalStyle from '@/styles/global.css?url';
import { fetchUserFromSession } from '@/serverFunctions/auth';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Gist',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: globalStyle,
      },
    ],
  }),

  component: RootComponent,
  notFoundComponent: () => <div>Not Found</div>,
  beforeLoad: async () => {
    const user = await fetchUserFromSession();

    return {
      user,
    };
  },
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className="dark">
      <head>
        <Meta />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
