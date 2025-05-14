
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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppContext } from "@/context/AppContext";
import { MealRestriction, MealType } from "@/types";

// Schema with conditional fields based on restriction type
const formSchema = z.object({
  areaId: z.coerce.number().int().positive("Please select an area"),
  mealTypeId: z.coerce.number().int().positive("Please select a meal type"),
  restrictionType: z.enum(["employee", "department"]),
  employeeId: z.coerce.number().optional(),
  department: z.string().optional(),
}).refine((data) => {
  if (data.restrictionType === "employee") {
    return !!data.employeeId;
  } else if (data.restrictionType === "department") {
    return !!data.department;
  }
  return true;
}, {
  message: "Please select an employee or department based on your restriction type",
  path: ["restrictionType"],
});

type FormValues = z.infer<typeof formSchema>;

interface MealRestrictionFormProps {
  isOpen: boolean;
  onClose: () => void;
  mealRestrictionToEdit?: MealRestriction;
}

const MealRestrictionForm: React.FC<MealRestrictionFormProps> = ({
  isOpen,
  onClose,
  mealRestrictionToEdit
}) => {
  const { createMealRestriction, updateMealRestriction, areas, mealTypes, departments, employees } = useAppContext();
  const isEditing = !!mealRestrictionToEdit;
  
  const [areaId, setAreaId] = useState<number | null>(
    mealRestrictionToEdit?.areaId || null
  );
  const [filteredMealTypes, setFilteredMealTypes] = useState<MealType[]>([]);
  const [restrictionType, setRestrictionType] = useState<"employee" | "department">(
    mealRestrictionToEdit?.employeeId ? "employee" : "department"
  );

  // Determine initial restriction type
  const getInitialRestrictionType = () => {
    if (!mealRestrictionToEdit) return "employee";
    return mealRestrictionToEdit.employeeId ? "employee" : "department";
  };

  // Filter meal types based on selected area
  useEffect(() => {
    if (areaId) {
      const filtered = mealTypes.filter(mt => mt.areaId === areaId);
      setFilteredMealTypes(filtered);
    } else {
      setFilteredMealTypes([]);
    }
  }, [areaId, mealTypes]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      areaId: mealRestrictionToEdit?.areaId || 0,
      mealTypeId: mealRestrictionToEdit?.mealTypeId || 0,
      restrictionType: getInitialRestrictionType(),
      employeeId: mealRestrictionToEdit?.employeeId || undefined,
      department: mealRestrictionToEdit?.department || undefined,
    },
  });

  const handleAreaChange = (areaId: string) => {
    const parsedAreaId = parseInt(areaId);
    setAreaId(parsedAreaId);
    form.setValue("areaId", parsedAreaId);
    form.setValue("mealTypeId", 0); // Reset meal type when area changes
  };

  const handleRestrictionTypeChange = (type: "employee" | "department") => {
    setRestrictionType(type);
    form.setValue("restrictionType", type);
    
    // Clear the other field when switching types
    if (type === "employee") {
      form.setValue("department", undefined);
    } else {
      form.setValue("employeeId", undefined);
    }
  };

  const onSubmit = (values: FormValues) => {
    const mealRestrictionData = {
      areaId: values.areaId,
      mealTypeId: values.mealTypeId,
      employeeId: values.restrictionType === "employee" ? values.employeeId : undefined,
      department: values.restrictionType === "department" ? values.department : undefined,
    };
    
    if (isEditing && mealRestrictionToEdit) {
      updateMealRestriction({
        id: mealRestrictionToEdit.id,
        ...mealRestrictionData,
      });
    } else {
      createMealRestriction(mealRestrictionData);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Meal Restriction" : "Create New Meal Restriction"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-3">
            <FormField
              control={form.control}
              name="areaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <Select 
                    onValueChange={handleAreaChange} 
                    defaultValue={field.value ? field.value.toString() : ""}
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

            <FormField
              control={form.control}
              name="mealTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Type</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value ? field.value.toString() : ""}
                    disabled={!areaId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !areaId 
                            ? "Select an area first" 
                            : filteredMealTypes.length === 0 
                              ? "No meal types available for this area" 
                              : "Select a meal type"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredMealTypes.map((mealType) => (
                        <SelectItem key={mealType.id} value={mealType.id.toString()}>
                          {mealType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="restrictionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restriction Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      defaultValue={field.value}
                      onValueChange={(value) => handleRestrictionTypeChange(value as "employee" | "department")}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="employee" id="employee" />
                        <label htmlFor="employee" className="text-sm font-medium">Employee</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="department" id="department" />
                        <label htmlFor="department" className="text-sm font-medium">Department</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional fields based on restriction type */}
            {restrictionType === "employee" ? (
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.employeeId} value={employee.employeeId.toString()}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.name}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Restriction" : "Create Restriction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MealRestrictionForm;
