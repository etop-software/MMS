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
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Department } from "@/types";

// Validation schema
const formSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DepartmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  departmentToEdit?: Department;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  isOpen,
  onClose,
  departmentToEdit,
}) => {
  const queryClient = useQueryClient();
  const isEditing = Boolean(departmentToEdit);

  // API functions
  async function createDepartment(data: { name: string; description?: string }) {
    const res = await fetch(`${API_BASE_URL}/departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create department");
    }
    return res.json();
  }

  async function updateDepartment(
    id: number,
    data: { name: string; description?: string }
  ) {
    const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update department");
    }
    return res.json();
  }

  // Mutations (updated for React Query v5)
  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries(["departments"]);
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; name: string; description?: string }) =>
      updateDepartment(data.id, { name: data.name, description: data.description }),
    onSuccess: () => {
      queryClient.invalidateQueries(["departments"]);
      onClose();
    },
  });

  // React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: departmentToEdit?.name || "",
      description: departmentToEdit?.description || "",
    },
  });

  const onSubmit = (values: FormValues) => {
    if (isEditing && departmentToEdit) {
      updateMutation.mutate({
        id: departmentToEdit.id,
        name: values.name,
        description: values.description,
      });
    } else {
      createMutation.mutate({
        name: values.name,
        description: values.description,
      });
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Department" : "Create New Department"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-3" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter department name"
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
                {isEditing ? "Update Department" : "Create Department"}
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

export default DepartmentForm;
