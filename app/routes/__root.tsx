import {
  HeadContent,
  Outlet,
  ScriptOnce,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import React, { Suspense } from 'react';
import type { ReactNode } from 'react';
import globalStyle from '@/styles/global.css?url';
import { fetchUserFromSession } from '@/serverFunctions/auth';
import { getThemeCookie, useThemeStore } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/toaster';

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import('@tanstack/react-router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        }))
      );

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, user-scalable=no',
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
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),

  component: RootComponent,
  notFoundComponent: () => <div>Not Found</div>,
  loader: async () => {
    return {
      themeCookie: await getThemeCookie(),
    };
  },
  beforeLoad: async () => {
    const { email, impersonatedBy } = await fetchUserFromSession();

    return {
      email,
      impersonatedBy,
    };
  },
});

function RootComponent() {
  return (
    <RootDocument>
      <Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </Suspense>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { themeCookie } = Route.useLoaderData();

  React.useEffect(() => {
    useThemeStore.setState({ mode: themeCookie });
  }, []);

  const themeClass = themeCookie === 'dark' ? 'dark' : '';

  return (
    <html className={themeClass}>
      <head>
        {/* If the theme is set to auto, inject a tiny script to set the proper class on html based on the user preference */}
        {themeCookie === 'auto' ? (
          <ScriptOnce
            sync
            children={`window.matchMedia('(prefers-color-scheme: dark)').matches ? document.documentElement.classList.add('dark') : null`}
          />
        ) : null}
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
