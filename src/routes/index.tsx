import {createFileRoute, Link} from '@tanstack/react-router'
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {client} from "../hono.ts";
import {LoaderCircle, SquareArrowOutUpRight, TrashIcon} from "lucide-react";
import {ColumnDef} from "@tanstack/react-table";
import {InferResponseType} from "hono";
import {DataTable} from "@/components/data-table.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CreateWarehouseDialog} from "@/components/create-warehouse-dialog.tsx";
import {toast} from "sonner";

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
    id: "action", cell: (cell) => <ActionCell warehouse={cell.row.original}/>
  }
]

interface ActionCellProps {
  warehouse: Warehouse;
}

const ActionCell: React.FC<ActionCellProps> = ({warehouse}) => {
  const queryClient = useQueryClient();

  const deleteWarehouseRotation = useMutation({
    mutationFn: async () => {
      const res = await client.api.warehouses[":id"].$delete({
        param: {
          id: warehouse.id
        }
      });
      return await res.json()
    }, onSuccess: () => {
      toast("Usunięto magazyn :D");
      void queryClient.invalidateQueries({queryKey: ["warehouses"]})
    }, onError: () => {
      toast("Coś jebło :O");
    }
  })

  return <div className="flex space-x-2 justify-end">
    <Button asChild size="icon" variant="outline">
      <Link to="/$wId" params={{wId: warehouse.id}}>
        <SquareArrowOutUpRight/>
      </Link>
    </Button>
    <Button size="icon" variant="destructive" onClick={() => deleteWarehouseRotation.mutate()}
            disabled={deleteWarehouseRotation.isPending}>
      <TrashIcon/>
    </Button>
  </div>
}

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
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-bold my-2">All Warehouses</h1>
        <CreateWarehouseDialog/>
      </div>
      <DataTable columns={columns} data={data}/>
    </div>
  )
}
