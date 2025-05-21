import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster as Sonner, toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Employee } from "@/types";

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
  RFID: z.string().optional(),
});

const EmployeeForm: React.FC<EmployeeFormProps> = ({ isOpen, onClose, employeeToEdit }) => {
  const { departments } = useAppContext();
  const queryClient = useQueryClient();
  const [selectedAreas, setSelectedAreas] = useState<number[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Record<number, number[]>>({});
  const [selectedMealRules, setSelectedMealRules] = useState<Record<number, number[]>>({});
  const [loadingDevices, setLoadingDevices] = useState<number[]>([]);
  const [devicesByArea, setDevicesByArea] = useState<Record<number, any[]>>({});

  const form = useForm({
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
      RFID: "",
    },
  });

useEffect(() => {
  if (employeeToEdit) {
    // 1) Get raw area & device access from employee
    const initialAreas = employeeToEdit.areaAccess?.map((a) => a.areaId) || [];
    const rawDeviceMap: Record<number, number[]> = {};
    employeeToEdit.deviceAccess?.forEach(({ areaId, deviceId }) => {
      if (!rawDeviceMap[areaId]) rawDeviceMap[areaId] = [];
      rawDeviceMap[areaId].push(deviceId);
    });

    // 2) Build meal‐rule map from employeeMealAccesses
    const ruleMap: Record<number, number[]> = {};
    employeeToEdit.employeeMealAccesses?.forEach(({ deviceId, mealRuleId }) => {
      if (!ruleMap[deviceId]) ruleMap[deviceId] = [];
      ruleMap[deviceId].push(mealRuleId);
    });

    // 3) Prune devices that have no meal rules checked
    const prunedDeviceMap: Record<number, number[]> = {};
    for (const [areaIdStr, deviceIds] of Object.entries(rawDeviceMap)) {
      const areaId = Number(areaIdStr);
      const kept = deviceIds.filter((devId) => (ruleMap[devId] || []).length > 0);
      if (kept.length) prunedDeviceMap[areaId] = kept;
    }

    // 4) Prune areas that, after device pruning, have no devices left
    const prunedAreas = Object.keys(prunedDeviceMap).map((a) => Number(a));

    // 5) Reset form + state
    form.reset({
      ...employeeToEdit,
      areaAccess: prunedAreas,
      selectedDevices: prunedDeviceMap,
    });
    setSelectedAreas(prunedAreas);
    setSelectedDevices(prunedDeviceMap);
    setSelectedMealRules(ruleMap);

    // 6) Fetch devices (and their meal‐rules) for each pruned area
    prunedAreas.forEach((areaId) => {
      if (!devicesByArea[areaId]) fetchDevicesByArea(areaId);
    });
  } else {
    form.reset();
    setSelectedAreas([]);
    setSelectedDevices({});
    setSelectedMealRules({});
  }
}, [employeeToEdit, isOpen]);




  const fetchAreas = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/areas`);
    return res.data;
  };
  const { data: areasData = [] } = useQuery({ queryKey: ["areas"], queryFn: fetchAreas });

  const fetchDevicesByArea = async (areaId: number) => {
    try {
      setLoadingDevices((prev) => [...prev, areaId]);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/devices/devices?areaId=${areaId}`);
      const devices = await res.json();

      const devicesWithRules = await Promise.all(
        devices.map(async (device: any) => {
          const mealRuleRes = await fetch(`${import.meta.env.VITE_API_URL}/devices/meal-rules?deviceId=${device.id}`);
          const mealRules = await mealRuleRes.json();
          return { ...device, mealRules };
        })
      );

      setDevicesByArea((prev) => ({ ...prev, [areaId]: devicesWithRules }));
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

  const toggleMealRule = (deviceId: number, ruleId: number) => {
    setSelectedMealRules((prev) => {
      const current = prev[deviceId] || [];
      const updated = current.includes(ruleId)
        ? current.filter((id) => id !== ruleId)
        : [...current, ruleId];
      return { ...prev, [deviceId]: updated };
    });
  };

  const mutation = useMutation({
    mutationFn: async (data: Omit<Employee, "employeeId">) => {
      const baseUrl = import.meta.env.VITE_API_URL;
      if (!baseUrl) throw new Error("API URL is not defined in the environment variables.");

      const url = employeeToEdit
        ? `${baseUrl}/employees/employees/${employeeToEdit.employeeId}`
        : `${baseUrl}/employees/employees`;

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
      toast.success(employeeToEdit ? "Employee updated successfully" : "Employee created successfully");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onClose();
    },
  });

  const onSubmit = (values: any) => {
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
      selectedMealRules,
    };

    mutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>{employeeToEdit ? "Edit Employee" : "Create New Employee"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <FormField
                control={form.control}
                name="RFID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RFID</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {areasData.map((area: any) => (
                      <div key={area.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`area-${area.id}`}
                          checked={selectedAreas.includes(area.id)}
                          onCheckedChange={() => toggleArea(area.id)}
                        />
                        <label htmlFor={`area-${area.id}`} className="text-sm cursor-pointer">
                          {area.name}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedAreas.map((areaId) => (
                      <div key={areaId}>
                        <div className="grid grid-cols-1 gap-2">
                          {devicesByArea[areaId]?.map((device) => (
                            <div key={device.id} className="flex flex-col space-y-1">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`device-${device.id}`}
                                  checked={selectedDevices[areaId]?.includes(device.id)}
                                  onCheckedChange={() => toggleDevice(areaId, device.id)}
                                />
                                <label htmlFor={`device-${device.id}`} className="text-sm cursor-pointer">
                                  {device.deviceName}
                                </label>
                              </div>

                              {device.mealRules?.length > 0 && (
                                <div className="ml-6 space-y-1">
                                  {device.mealRules.map((rule: any) => (
                                    <div key={rule.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`rule-${device.id}-${rule.id}`}
                                        checked={selectedMealRules[device.id]?.includes(rule.id) || false}
                                        onCheckedChange={() => toggleMealRule(device.id, rule.id)}
                                      />
                                      <label htmlFor={`rule-${device.id}-${rule.id}`} className="text-xs text-gray-700 cursor-pointer">
                                        {rule.mealType?.name}: {rule.startTime} - {rule.endTime}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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
