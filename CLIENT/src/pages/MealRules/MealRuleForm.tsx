import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MealRule, MealType, Area, Device } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const daysOfWeek = [
  { id: "Mon", label: "Monday" },
  { id: "Tue", label: "Tuesday" },
  { id: "Wed", label: "Wednesday" },
  { id: "Thu", label: "Thursday" },
  { id: "Fri", label: "Friday" },
  { id: "Sat", label: "Saturday" },
  { id: "Sun", label: "Sunday" },
];

const formSchema = z.object({
  mealTypeId: z.coerce.number().int().positive("Please select a meal type"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  days: z.array(z.string()).min(1, "At least one day must be selected"),
  areaId: z.coerce.number().int().positive("Please select an area"),
  deviceId: z.coerce.number().int().positive("Please select a device"),
});

type FormValues = z.infer<typeof formSchema>;

interface MealRuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  mealRuleToEdit?: MealRule;
}

const MealRuleForm: React.FC<MealRuleFormProps> = ({
  isOpen,
  onClose,
  mealRuleToEdit,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!mealRuleToEdit;
  const [selectedDays, setSelectedDays] = useState<string[]>(
    mealRuleToEdit?.days || []
  );
  const [areaId, setAreaId] = useState<number | null>(
    mealRuleToEdit?.areaId || null
  );
  const [devices, setDevices] = useState<Device[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mealTypeId: mealRuleToEdit?.mealTypeId || 0,
      startTime: mealRuleToEdit?.startTime || "",
      endTime: mealRuleToEdit?.endTime || "",
      days: mealRuleToEdit?.days || [],
      areaId: mealRuleToEdit?.areaId || 0,
      deviceId: mealRuleToEdit?.deviceId || 0,
    },
  });
// Fetch Areas from API
const fetchAreas = async (): Promise<Area[]> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/areas`);
  if (!res.ok) throw new Error("Failed to fetch areas");
  return res.json();
};

// Fetch Meal Types from API
const fetchMealTypes = async (): Promise<MealType[]> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/mealTypes`);
  if (!res.ok) throw new Error("Failed to fetch meal types");
  return res.json();
};

// Fetch Devices by Area from API
const fetchDevicesByArea = async (areaId: number) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/devices/devices?areaId=${areaId}`
  );
  if (!res.ok) throw new Error("Failed to fetch devices");
  const data = await res.json();
  setDevices(data);
};


  const { data: areas = [] } = useQuery({
    queryKey: ["areas"],
    queryFn: fetchAreas,
  });

  const { data: mealTypes = [] } = useQuery({
    queryKey: ["mealTypes"],
    queryFn: fetchMealTypes,
  });

  useEffect(() => {
    if (areaId) {
      fetchDevicesByArea(areaId);
    } else {
      setDevices([]);
    }
  }, [areaId]);

  const handleAreaChange = (areaId: string) => {
    const parsedAreaId = parseInt(areaId);
    setAreaId(parsedAreaId);
    form.setValue("areaId", parsedAreaId);
    form.setValue("deviceId", 0);
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
    const currentDays = form.getValues("days");
    form.setValue(
      "days",
      currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day]
    );
  };

const updateMealRule = async (payload: FormValues & { days: string[] }) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/mealRules/updateMealRule`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) throw new Error("Failed to update meal rule");
  return response.json();
};


  const mutation = useMutation({
    mutationFn: updateMealRule,
    onSuccess: () => {
      queryClient.invalidateQueries(["mealRules"]);
      onClose();
    },
    onError: (error) => console.error("Mutation failed:", error),
  });

  const onSubmit = (values: FormValues) => {
    const payload = { ...values, days: selectedDays };
    mutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Meal Rule" : "Create New Meal Rule"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-3">
            {/* Area Dropdown */}
            <FormField
              control={form.control}
              name="areaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <Select
                    onValueChange={handleAreaChange}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an area" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id.toString()}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Device Dropdown */}
            <FormField
              control={form.control}
              name="deviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(parseInt(val))}
                    defaultValue={field.value.toString()}
                    disabled={!areaId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a device" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {devices.map((device) => (
                        <SelectItem key={device.id} value={device.id.toString()}>
                          {device.deviceName + " - " + device.SN}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Meal Type Dropdown */}
            <FormField
              control={form.control}
              name="mealTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Type</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(parseInt(val))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a meal type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mealTypes.map((mealType) => (
                        <SelectItem
                          key={mealType.mealTypeId}
                          value={mealType.mealTypeId.toString()}
                        >
                          {mealType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Days Checkboxes */}
            <FormField
              control={form.control}
              name="days"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Available Days</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {daysOfWeek.map((day) => (
                      <div
                        key={day.id}
                        className="flex items-center space-x-2 border rounded-md p-2 cursor-pointer hover:bg-muted/30"
                      >
                        <Checkbox
                          id={`day-${day.id}`}
                          checked={selectedDays.includes(day.id)}
                          onCheckedChange={() => toggleDay(day.id)}
                        />
                        <label htmlFor={`day-${day.id}`} className="text-sm font-medium">
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-1">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Meal Rule" : "Create Meal Rule"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MealRuleForm;
