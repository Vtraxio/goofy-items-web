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
import {Checkbox} from "@/components/ui/checkbox.tsx";
import * as React from "react";
import {useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {client} from "@/hono.ts";
import {InferRequestType} from "hono";
import {toast} from "sonner";

const formSchema = z.object({
  name: z.string().nonempty(),
  weight_kg: z.coerce.number().positive(),
  weirdness: z.coerce.number().int().min(1).max(10),
  fragile: z.boolean(),
});

interface CreateItemDialogProps {
  wId: string;
}

const $itemsPost = client.api.warehouses[":id"].items.$post;
type Item = InferRequestType<typeof $itemsPost>["json"];

export const CreateItemDialog: React.FC<CreateItemDialogProps> = ({wId}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Jaszkiewicz",
      weight_kg: 120,
      weirdness: 10,
      fragile: true
    },
  })

  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();
  const addMutation = useMutation({
    mutationFn: async (item: Item) => {
      const res = await $itemsPost({
        json: item,
        param: {
          id: wId
        }
      });
      return await res.json()
    }, onSuccess: () => {
      setOpen(false);
      toast("Dodano item :D");
      void queryClient.invalidateQueries({queryKey: [wId]})
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
              <DialogTitle>Add new item.</DialogTitle>
              <DialogDescription>Describe the new item.</DialogDescription>
            </DialogHeader>
            <FormField control={form.control} name="name" render={({field}) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field}/>
                </FormControl>
                <FormDescription>
                  Name of the newly created item.
                </FormDescription>
              </FormItem>
            )}/>
            <FormField control={form.control} name="weight_kg" render={({field}) => (
              <FormItem>
                <FormLabel>Weight</FormLabel>
                <FormControl>
                  <Input type="number" step={0.001} min={0} {...field}/>
                </FormControl>
                <FormDescription>
                  How much the item weights in kg.
                </FormDescription>
              </FormItem>
            )}/>
            <FormField control={form.control} name="weirdness" render={({field}) => (
              <FormItem>
                <FormLabel>Weirdness</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={10} {...field}/>
                </FormControl>
                <FormDescription>
                  How weird the item is, scale 1-10.
                </FormDescription>
              </FormItem>
            )}/>
            <FormField control={form.control} name="fragile" render={({field}) => (
              <FormItem>
                <FormLabel>Fragile</FormLabel>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                </FormControl>
                <FormDescription>
                  If the item is fragile.
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