import {createFileRoute, Link} from '@tanstack/react-router'
import {useQuery} from "@tanstack/react-query";
import {client} from "../hono.ts";
import {LoaderCircle, SquareArrowOutUpRight, TrashIcon} from "lucide-react";
import {ColumnDef} from "@tanstack/react-table";
import {InferResponseType} from "hono";
import {DataTable} from "@/components/data-table.tsx";
import {Button} from "@/components/ui/button.tsx";

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

type Warehouse = InferResponseType<typeof client.api.warehouses.$get, 200>[0]

const columns: ColumnDef<Warehouse>[] = [
  {accessorKey: "name", header: "Name"},
  {accessorKey: "capacity", header: "Capacity"},
  {accessorKey: "items", header: "Current Items"},
  {accessorKey: "max_weight", header: "Maximum Weight"},
  {header: "Total Weight", accessorFn: (row) => row.weight.toFixed(3)},
  {header: "Average Weirdness", accessorFn: (row) => row.average_weirdness.toFixed(3)},
  {
    id: "action", cell: (cell) => {
      const id = cell.row.original.id;

      return <div className="flex space-x-2 justify-end">
        <Button asChild size="icon" variant="outline">
          <Link to="/$wId" params={{wId: id}}>
            <SquareArrowOutUpRight/>
          </Link>
        </Button>
        <Button size="icon" variant="destructive">
          <TrashIcon/>
        </Button>
      </div>
    }
  }
]

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
    <div className="max-w-[96rem] w-[90%] mx-auto mt-4">
      <h1 className="text-2xl font-bold my-2">All Warehouses</h1>
      <DataTable columns={columns} data={data}/>
    </div>
  )
}
