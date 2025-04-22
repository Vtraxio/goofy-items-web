import {createRootRoute, Outlet} from '@tanstack/react-router'
import {TanStackRouterDevtools} from "@tanstack/react-router-devtools";
import {ModeToggle} from "@/components/mode-toggle";

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="h-screen">
      <nav className="flex items-center justify-between px-4 py-2 bg-background dark:bg-input/30 border-b dark:border-input">
        <h1 className="italic text-2xl">Amazing Goofy Item Storage</h1>
        <ModeToggle/>
      </nav>
      <Outlet/>
      <TanStackRouterDevtools/>
    </div>
  )
}
