import React, { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Employee } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";

// ... all imports remain the same

const formSchema = z.object({
  name: z.string().min(1, "Employee name is required"),
  pin: z.coerce.number().int().positive("PIN must be a positive number"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  group: z.coerce.number().int(),
  privilege: z.coerce.number().int(),
  department: z.string().min(1, "Department is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email format"),
  areaAccess: z.array(z.number()).min(1, "At least one area must be selected"),
  selectedDevices: z.object({}).optional(),
});

const EmployeeForm: React.FC<EmployeeFormProps> = ({ isOpen, onClose, employeeToEdit }) => {
  const { departments } = useAppContext();
  const queryClient = useQueryClient();
  const [selectedAreas, setSelectedAreas] = useState<number[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Record<number, number[]>>({});
  const [loadingDevices, setLoadingDevices] = useState<number[]>([]);
  const [devicesByArea, setDevicesByArea] = useState<Record<number, any[]>>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      pin: 0,
      password: "",
      group: 0,
      privilege: 0,
      department: "",
      phone: "",
      email: "",
      areaAccess: [],
      selectedDevices: {},
    },
  });

  useEffect(() => {
    if (employeeToEdit) {
      const areaIds = employeeToEdit.areaAccess?.map((a) => a.areaId) || [];
      const deviceMap: Record<number, number[]> = {};

      employeeToEdit.deviceAccess?.forEach((d) => {
        if (!deviceMap[d.areaId]) deviceMap[d.areaId] = [];
        deviceMap[d.areaId].push(d.deviceId);
      });

      form.reset({
        ...employeeToEdit,
        areaAccess: areaIds,
        selectedDevices: deviceMap,
      });

      setSelectedAreas(areaIds);
      setSelectedDevices(deviceMap);
      areaIds.forEach((areaId) => {
        if (!devicesByArea[areaId]) fetchDevicesByArea(areaId);
      });
    } else {
      form.reset();
      setSelectedAreas([]);
      setSelectedDevices({});
    }
  }, [employeeToEdit, isOpen]);

  const fetchAreas = async () => {
    const res = await axios.get("http://localhost:4000/api/areas");
    return res.data;
  };
  const { data: areasData } = useQuery({ queryKey: ["areas"], queryFn: fetchAreas });

  const fetchDevicesByArea = async (areaId: number) => {
    try {
      setLoadingDevices((prev) => [...prev, areaId]);
      const res = await fetch(`http://localhost:4000/api/devices/devices?areaId=${areaId}`);
      const data = await res.json();
      setDevicesByArea((prev) => ({ ...prev, [areaId]: data }));
    } finally {
      setLoadingDevices((prev) => prev.filter((id) => id !== areaId));
    }
  };

  const toggleArea = (areaId: number) => {
    const updated = selectedAreas.includes(areaId)
      ? selectedAreas.filter((id) => id !== areaId)
      : [...selectedAreas, areaId];

    setSelectedAreas(updated);
    form.setValue("areaAccess", updated);

    if (!selectedAreas.includes(areaId) && !devicesByArea[areaId]) {
      fetchDevicesByArea(areaId);
    }

    if (updated.includes(areaId)) {
      setSelectedDevices((prev) => ({
        ...prev,
        [areaId]: devicesByArea[areaId]?.map((d) => d.id) || [],
      }));
    } else {
      setSelectedDevices((prev) => {
        const { [areaId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const toggleDevice = (areaId: number, deviceId: number) => {
    const updatedDevices = selectedDevices[areaId] || [];
    const updated = updatedDevices.includes(deviceId)
      ? updatedDevices.filter((id) => id !== deviceId)
      : [...updatedDevices, deviceId];

    setSelectedDevices((prev) => ({ ...prev, [areaId]: updated }));

    const allSelected = updated.length === devicesByArea[areaId]?.length;
    if (allSelected && !selectedAreas.includes(areaId)) {
      const updatedAreas = [...selectedAreas, areaId];
      setSelectedAreas(updatedAreas);
      form.setValue("areaAccess", updatedAreas);
    } else if (updated.length === 0) {
      const filtered = selectedAreas.filter((id) => id !== areaId);
      setSelectedAreas(filtered);
      form.setValue("areaAccess", filtered);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: Omit<Employee, "employeeId">) => {
      const url = employeeToEdit
        ? `http://localhost:4000/api/employees/employees/${employeeToEdit.employeeId}`
        : "http://localhost:4000/api/employees/employees";
      const method = employeeToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save employee");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onClose();
    },
  });

  const onSubmit = (values: FormValues) => {
    const invalidAreas = selectedAreas.filter(
      (areaId) => !selectedDevices[areaId] || selectedDevices[areaId].length === 0
    );
    if (invalidAreas.length > 0) {
      alert("Each selected area must have at least one selected device.");
      return;
    }

    const payload: Omit<Employee, "employeeId"> = {
      ...values,
      areaAccess: selectedAreas,
      selectedDevices,
    };
    mutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{employeeToEdit ? "Edit Employee" : "Create New Employee"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-3">
            {/* Fields omitted for brevity, keep your original UI field structure here */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PIN */}
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN</FormLabel>
                    <FormControl><Input {...field} type="number" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input {...field} type="password" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

           

              {/* Department */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="areaAccess"
              render={() => (
                <FormItem>
                  <FormLabel>Area Access</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {areasData?.map((area) => {
                      const isChecked = selectedAreas.includes(area.id);
                      const isIndeterminate =
                        selectedDevices[area.id]?.length > 0 &&
                        selectedDevices[area.id]?.length !== devicesByArea[area.id]?.length;

                      return (
                        <div key={area.id} className="border rounded-md p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <Checkbox
                              id={`area-${area.id}`}
                              checked={isChecked}
                              indeterminate={isIndeterminate}
                              onCheckedChange={() => toggleArea(area.id)}
                              disabled={devicesByArea[area.id]?.length === 0}
                            />
                            <label htmlFor={`area-${area.id}`} className="text-sm font-medium cursor-pointer">
                              {area.name}
                            </label>
                          </div>
                          {isChecked && (
                            <div className="ml-6 mt-1">
                              {loadingDevices.includes(area.id) ? (
                                <p className="text-sm text-gray-500">Loading devices...</p>
                              ) : (
                                <div>
                                  {devicesByArea[area.id]?.length ? (
                                    <div>
                                      <p className="text-sm text-gray-700">Select devices:</p>
                                      <div className="space-y-2">
                                        {devicesByArea[area.id].map((device) => (
                                          <div key={device.id} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`device-${device.id}`}
                                              checked={selectedDevices[area.id]?.includes(device.id)}
                                              onCheckedChange={() => toggleDevice(area.id, device.id)}
                                            />
                                            <label htmlFor={`device-${device.id}`} className="text-sm cursor-pointer">
                                              {device.deviceName}
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-400">No devices found for this area.</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={mutation.isLoading}>
                {mutation.isLoading
                  ? (employeeToEdit ? "Updating..." : "Creating...")
                  : (employeeToEdit ? "Update Employee" : "Create Employee")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeForm;
