import { QueryProvider } from '@/web/client/providers/query-providers';
import { TanStackRouterDevtools } from '@/web/client/providers/router-devtools';

// import { ThemeProvider } from '@/client/providers/theme-provider';
// import { Toaster } from '@/components/ui/sonner';
import type { QueryClient } from '@tanstack/react-query';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import React from 'react';
import { Fragment } from 'react/jsx-runtime';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootRouteComponent,
});

function RootRouteComponent() {
  return (
    <Fragment>
      <QueryProvider>
        <Outlet />
      </QueryProvider>
      <React.Suspense>
        <TanStackRouterDevtools />
      </React.Suspense>
    </Fragment>
  );
}
