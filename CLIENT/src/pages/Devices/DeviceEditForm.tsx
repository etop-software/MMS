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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const formSchema = z.object({
  deviceName: z.string().min(1, "Device name is required"),
  areaId: z.number({
    required_error: "Area selection is required"
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface DeviceEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  deviceToEdit?: {
    id: number;
    deviceName: string;
    areaId: number;
  };
}

const DeviceEditForm: React.FC<DeviceEditFormProps> = ({ isOpen, onClose, deviceToEdit }) => {
  const isEditing = !!deviceToEdit;
  const queryClient = useQueryClient();

  // Fetch areas for dropdown
const { data: areas = [], isLoading: areasLoading } = useQuery({
  queryKey: ["areas"],
  queryFn: async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/areas`);
    return res.data;
  },
});

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceName: "",
      areaId: 0,
    },
  });
useEffect(() => {
  if (deviceToEdit && areas.length > 0) {
    form.reset({
      deviceName: deviceToEdit.deviceName,
      areaId: deviceToEdit.area?.id ?? 0,  // <-- get id from nested area
    });
  }
}, [deviceToEdit, areas, form]);



  const updateMutation = useMutation({
    mutationFn: (data: FormValues & { id: number }) =>
      axios.put(`${import.meta.env.VITE_API_URL}/devices/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["devices"]);
      onClose();
    },
  });

  const onSubmit = (values: FormValues) => {
    if (isEditing && deviceToEdit) {
      updateMutation.mutate({ id: deviceToEdit.id, ...values });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Device</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-3">
            <FormField
              control={form.control}
              name="deviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter device name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
<FormField
  control={form.control}
  name="areaId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Assign Area</FormLabel>
      <Select
        onValueChange={(val) => field.onChange(Number(val))}
        value={field.value ? String(field.value) : ""}
        disabled={areasLoading}
      >
        <SelectTrigger>
          <SelectValue>
            {areas.find((area) => area.id === field.value)?.name || "Select an area"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {areas.map((area: any) => (
            <SelectItem key={area.id} value={String(area.id)}>
              {area.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>


            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isLoading}>
                Update Device
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceEditForm;
