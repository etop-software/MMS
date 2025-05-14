import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Area } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const formSchema = z.object({
  name: z.string().min(1, "Area name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AreaFormProps {
  isOpen: boolean;
  onClose: () => void;
  areaToEdit?: Area;
}

const AreaForm: React.FC<AreaFormProps> = ({
  isOpen,
  onClose,
  areaToEdit
}) => {
  const isEditing = !!areaToEdit;
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (areaToEdit) {
      form.reset({
        name: areaToEdit.name,
        description: areaToEdit.description || "",
      });
    }
  }, [areaToEdit, form]);

 // Mutation for creating area
const createMutation = useMutation({
  mutationFn: (data: FormValues) =>
    axios.post(`${import.meta.env.VITE_API_URL}/areas`, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["areas"] });
    onClose();
  },
});

const updateMutation = useMutation({
  mutationFn: (data: { id: number; name: string; description?: string }) =>
    axios.put(`${import.meta.env.VITE_API_URL}/areas/${data.id}`, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["areas"] });
    onClose();
  },
});



  const onSubmit = (values: FormValues) => {
    if (isEditing && areaToEdit) {
      updateMutation.mutate({ id: areaToEdit.id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Area" : "Create New Area"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter area name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter a brief description (optional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEditing ? "Update Area" : "Create Area"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AreaForm;
