import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$wId/$iId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$wId/$iId/"!</div>
}
