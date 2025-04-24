import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Plus} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {client} from "@/hono.ts";
import {InferRequestType} from "hono";
import {toast} from "sonner";

const formSchema = z.object({
  name: z.string().nonempty(),
  capacity: z.coerce.number().positive(),
  max_weight: z.coerce.number().positive(),
});

const $warehousePost = client.api.warehouses.$post;
type Item = InferRequestType<typeof $warehousePost>["json"];

export const CreateWarehouseDialog = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Amazing Warehouse",
      capacity: 100,
      max_weight: 100
    },
  })

  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();
  const addMutation = useMutation({
    mutationFn: async (item: Item) => {
      const res = await $warehousePost({
        json: item,
      });
      return await res.json()
    }, onSuccess: () => {
      setOpen(false);
      toast("Dodano magazyn :D");
      void queryClient.invalidateQueries({queryKey: ["warehouses"]})
    }, onError: () => {
      toast("Coś poszło nie tak :(");
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    addMutation.mutate(values)
    console.log(values)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus/>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form} >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Add new warehouse.</DialogTitle>
              <DialogDescription>Describe the new warehouse.</DialogDescription>
            </DialogHeader>
            <FormField control={form.control} name="name" render={({field}) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field}/>
                </FormControl>
                <FormDescription>
                  Name of the newly created warehouse.
                </FormDescription>
              </FormItem>
            )}/>
            <FormField control={form.control} name="capacity" render={({field}) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field}/>
                </FormControl>
                <FormDescription>
                  How many items the warehouse can hold.
                </FormDescription>
              </FormItem>
            )}/>
            <FormField control={form.control} name="max_weight" render={({field}) => (
              <FormItem>
                <FormLabel>Max Weight</FormLabel>
                <FormControl>
                  <Input type="number" step={0.001} min={0} {...field}/>
                </FormControl>
                <FormDescription>
                  How much weight the warehouse can hold.
                </FormDescription>
              </FormItem>
            )}/>
            <DialogFooter>
              <Button variant="outline" type="submit">
                Add
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}