import {createFileRoute, Link} from '@tanstack/react-router'
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {client} from "@/hono.ts";
import {InferResponseType} from "hono";
import {ColumnDef} from "@tanstack/react-table";
import {DataTable} from "@/components/data-table.tsx";
import {Button} from "@/components/ui/button.tsx";
import {SquareArrowOutUpRight, TrashIcon} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {useState} from "react";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {toast} from "sonner";
import {CreateItemDialog} from "@/components/create-item-dialog.tsx";

export const Route = createFileRoute('/$wId/')({
  component: RouteComponent,
})

const $itemsGet = client.api.warehouses[":id"].items.$get;
type Item = InferResponseType<typeof $itemsGet>[0];

const columns: ColumnDef<Item>[] = [
  {accessorKey: "name", header: "Name"},
  {accessorKey: "weightKg", header: "Weight"},
  {accessorKey: "weirdness", header: "Weirdness"},
  {accessorKey: "fragile", header: "Fragile", cell: (cell) => cell.row.original.fragile ? "YES" : "NO"},
  {
    id: "action", cell: (cell) => <ActionCell item={cell.row.original}/>
  }
]

interface ActionCellProps {
  item: Item
}

const ActionCell: React.FC<ActionCellProps> = ({item}) => {
  const id = item.cuid;
  const {wId} = Route.useParams();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await client.api.warehouses[":id"].items[":iid"].$delete({
        param: {
          id: wId,
          iid: id
        }
      });
      return await res.json()
    }, onSuccess: () => {
      toast("Usunięto item :D");
      void queryClient.invalidateQueries({queryKey: [wId]})
    }, onError: () => {
      toast("Coś jebło :O");
    }
  })

  return <div className="flex space-x-2 justify-end">
    <Button asChild size="icon" variant="outline">
      <Link to="/$wId/$iId" params={{wId, iId: id}}>
        <SquareArrowOutUpRight/>
      </Link>
    </Button>
    <Button size="icon" variant="destructive" onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}>
      <TrashIcon/>
    </Button>
  </div>
}

function RouteComponent() {
  const {wId} = Route.useParams();

  const warehouseQuery = useQuery({
    queryKey: [wId],
    queryFn: async () => {
      const response = await client.api.warehouses[':id'].$get({
        param: {
          id: wId
        }
      })
      return response.json();
    }
  })

  const [enabled, setEnabled] = useState(false);
  const [minWeight, setMinWeight] = useState(0);

  const itemsQuery = useQuery({
    queryKey: [wId, enabled ? minWeight : false],
    queryFn: async () => {
      const response = await $itemsGet({
        param: {
          id: wId
        },
        query: {
          min: enabled ? minWeight.toString() : undefined
        }
      })
      return response.json();
    }
  })

  if (!warehouseQuery.isSuccess) {
    return <p>Czekaj...</p>
  }

  return (
    <div className="max-w-[96rem] w-[90%] mx-auto mt-4 mb-8">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-bold my-2">{warehouseQuery.data.name}</h1>
        <CreateItemDialog wId={wId}/>
      </div>
      <p>Capacity: {warehouseQuery.data.capacity}</p>
      <p>Items: {warehouseQuery.data.items}</p>
      <p>Max Weight: {warehouseQuery.data.max_weight}</p>
      <p>Average Weirdness: {warehouseQuery.data.average_weirdness.toFixed(3)}</p>
      <p>Total Weight: {warehouseQuery.data.weight.toFixed(3)}</p>
      <div className="flex space-x-2  items-center">
        <Input className="w-16" type="number" min={0} value={minWeight}
               onChange={e => setMinWeight(e.target.valueAsNumber)}/>
        <Checkbox checked={enabled} onCheckedChange={e => setEnabled(!!e.valueOf())}/>
      </div>

      {itemsQuery.isSuccess && (
        <DataTable columns={columns} data={itemsQuery.data}/>
      )}
    </div>
  )
}
