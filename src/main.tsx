import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";

import {routeTree} from "./routeTree.gen";
import {createRouter, RouterProvider} from "@tanstack/react-router";
import {ThemeProvider} from "@/components/theme-provider.tsx";

const router = createRouter({routeTree});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router}/>
      </ThemeProvider>
      <ReactQueryDevtools/>
    </QueryClientProvider>
  </StrictMode>,
)
