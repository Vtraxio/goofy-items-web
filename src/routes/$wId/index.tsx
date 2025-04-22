import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/$wId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const {wId} = Route.useParams();

  return <div>Hello "/$wId/"! {wId}</div>
}
