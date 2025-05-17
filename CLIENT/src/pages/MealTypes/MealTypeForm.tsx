import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MealType } from "@/types";
import { Toaster as Sonner, toast } from "sonner"
// ✅ Schema
const formSchema = z.object({
  name: z.string().min(1, "Meal type name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MealTypeFormProps {
  isOpen: boolean;
  onClose: () => void;
  mealTypeToEdit?: MealType;
}


const createMealType = async (data: FormValues) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/mealTypes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create meal type");
  return res.json();
};

// ✅ Update Meal Type API call
const updateMealType = async (id: number, data: FormValues) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/mealTypes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update meal type");
  return res.json();
};



const MealTypeForm: React.FC<MealTypeFormProps> = ({
  isOpen,
  onClose,
  mealTypeToEdit,
}) => {
  const isEditing = !!mealTypeToEdit;
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: mealTypeToEdit?.name || "",
      description: mealTypeToEdit?.description || "",
    },
  });

const createMutation = useMutation({
  mutationFn: createMealType,
  onSuccess: () => {
    toast.success("Meal type created successfully");
    queryClient.invalidateQueries({ queryKey: ["mealTypes"] });
    onClose();
  },
  onError: (err: any) => {
    toast.error("Failed to create meal type");
    console.error(err);
  },
});

const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: number; data: FormValues }) =>
    updateMealType(id, data),
  onSuccess: () => {
    toast.success("Meal type updated successfully");
    queryClient.invalidateQueries({ queryKey: ["mealTypes"] });
    onClose();
  },
  onError: (err: any) => {
    toast.error("Failed to update meal type");
    console.error(err);
  },
});


  const onSubmit = (values: FormValues) => {
    if (isEditing && mealTypeToEdit) {
      updateMutation.mutate({ id: mealTypeToEdit.mealTypeId, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Meal Type" : "Create New Meal Type"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meal type name" {...field} />
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
                    <Textarea placeholder="Optional description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading}>
                {isEditing ? "Update Meal Type" : "Create Meal Type"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MealTypeForm;
