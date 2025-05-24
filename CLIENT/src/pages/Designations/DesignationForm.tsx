import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Designation } from "@/types";

const formSchema = z.object({
  title: z.string().min(1, "Designation title is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DesignationFormProps {
  isOpen: boolean;
  onClose: () => void;
  designationToEdit?: Designation;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const DesignationForm: React.FC<DesignationFormProps> = ({
  isOpen,
  onClose,
  designationToEdit,
}) => {
  const queryClient = useQueryClient();
  const isEditing = Boolean(designationToEdit);

  async function createDesignation(data: { title: string; description?: string }) {
    const res = await fetch(`${API_BASE_URL}/designations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create designation");
    }
    return res.json();
  }

  async function updateDesignation(
    id: number,
    data: { title: string; description?: string }
  ) {
    const res = await fetch(`${API_BASE_URL}/designations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update designation");
    }
    return res.json();
  }

  const createMutation = useMutation({
    mutationFn: createDesignation,
    onSuccess: () => {
      queryClient.invalidateQueries(["designations"]);
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; title: string; description?: string }) =>
      updateDesignation(data.id, { title: data.title, description: data.description }),
    onSuccess: () => {
      queryClient.invalidateQueries(["designations"]);
      onClose();
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: designationToEdit?.title || "",
      description: designationToEdit?.description || "",
    },
  });

  const onSubmit = (values: FormValues) => {
    if (isEditing && designationToEdit) {
      updateMutation.mutate({
        id: designationToEdit.id,
        title: values.title,
        description: values.description,
      });
    } else {
      createMutation.mutate({
        title: values.title,
        description: values.description,
      });
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Designation" : "Create New Designation"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-3" noValidate>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter designation title"
                      {...field}
                      disabled={isLoading}
                    />
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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isEditing ? "Update Designation" : "Create Designation"}
              </Button>
            </DialogFooter>

            {(createMutation.isError || updateMutation.isError) && (
              <p className="text-red-600 mt-2 text-center text-sm">
                {(createMutation.error as Error)?.message ||
                  (updateMutation.error as Error)?.message ||
                  "An error occurred."}
              </p>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DesignationForm;
