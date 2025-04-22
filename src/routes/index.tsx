import {createFileRoute} from '@tanstack/react-router'
import {useQuery} from "@tanstack/react-query";
import {client} from "../hono.ts";
import {Button} from "@/components/ui/button";
import {LoaderCircle} from "lucide-react";

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const {data, isSuccess} = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const response = await client.api.warehouses.$get();
      return response.json();
    }
  })

  if (!isSuccess) {
    return <div className="w-full mx-auto"><LoaderCircle className="animate-spin" size={64}/></div>
  }

  return (
    <div>
      <Button>Hello</Button>
      {data?.map(warehouse => (
        <div key={warehouse.name}>
          <p>{warehouse.name}</p>
          <p>{warehouse.capacity}</p>
        </div>
      ))}
    </div>
  )
}
