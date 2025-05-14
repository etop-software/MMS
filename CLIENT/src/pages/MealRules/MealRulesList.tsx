import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import MealRuleForm from "./MealRuleForm";
import { MealRule, Device, Area } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TablePagination from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/use-pagination";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch devices by area function
const fetchDevicesByArea = async (areaId: number): Promise<Device[]> => {
  const res = await fetch(`http://localhost:4000/api/devices/devices?areaId=${areaId}`);
  if (!res.ok) throw new Error("Failed to fetch devices");
  return res.json();
};

const MealRulesList: React.FC = () => {
  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMealRule, setSelectedMealRule] = useState<MealRule | null>(null);
  const [filterAreaId, setFilterAreaId] = useState<string>("all");
  const [devicesByArea, setDevicesByArea] = useState<Map<number, Device[]>>(new Map());

  const {
    data: mealRules = [],
    isLoading,
  } = useQuery({
    queryKey: ["mealRules"],
    queryFn: async () => {
      const res = await fetch("http://localhost:4000/api/mealRules/meal-rules");
      const json = await res.json();
      return json.data;
    },
  });

  // === Fetch Meal Types and Areas ===
  const fetchMealTypes = async (): Promise<MealType[]> => {
    const res = await fetch("http://localhost:4000/api/mealTypes");
    if (!res.ok) throw new Error("Failed to fetch meal types");
    return res.json();
  };

  const fetchAreas = async (): Promise<Area[]> => {
    const res = await fetch("http://localhost:4000/api/areas");
    if (!res.ok) throw new Error("Failed to fetch areas");
    return res.json();
  };

  const {
    data: mealTypes = [],
    isLoading: loadingMealTypes,
    refetch,
  } = useQuery({
    queryKey: ["mealTypes"],
    queryFn: fetchMealTypes,
  });

  const {
    data: areas = [],
    isLoading: loadingAreas,
  } = useQuery({
    queryKey: ["areas"],
    queryFn: fetchAreas,
  });

  // === Delete Mutation ===
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await removeMealRule(id); // Backend call to delete meal rule
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealRules"] });
    },
  });

  const handleEdit = (mealRule: MealRule) => {
    setSelectedMealRule(mealRule);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (mealRule: MealRule) => {
    setSelectedMealRule(mealRule);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMealRule) {
      deleteMutation.mutate(selectedMealRule.id);
      setIsDeleteDialogOpen(false);
    }
  };

  // Fetch and store devices based on the selected area
  const fetchAndSetDevicesByArea = (areaId: string) => {
    const parsedAreaId = parseInt(areaId);
    if (parsedAreaId !== NaN) {
      fetchDevicesByArea(parsedAreaId).then((devices) => {
        setDevicesByArea((prevDevices) => {
          const updatedDevices = new Map(prevDevices);
          updatedDevices.set(parsedAreaId, devices);
          return updatedDevices;
        });
      });
    }
  };

  const filteredMealRules = filterAreaId === "all"
    ? mealRules
    : mealRules.filter((mr) => mr.areaId === parseInt(filterAreaId));

  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    totalItems,
    setCurrentPage,
    setPageSize,
  } = usePagination(filteredMealRules);

  

  return (
    <div>
      <PageHeader
        title="Meal Rules"
        description="Define when meals are available in each area"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Meal Rule
          </Button>
        }
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          Filter by Area
        </label>
        <Select defaultValue="all" onValueChange={(value) => {
          setFilterAreaId(value);
          fetchAndSetDevicesByArea(value); // Fetch devices when area is changed
        }}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="All Areas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area.id} value={area.id.toString()}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="dashboard-card">
        <CardContent className="p-4">
          <Table className="data-table">
            <TableHeader>
              <TableRow>
                <TableHead>Meal Type</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Device</TableHead> {/* New column for Device */}
                <TableHead>Time</TableHead>
                <TableHead>Days</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    Loading meal rules...
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    {filterAreaId === "all"
                      ? "No meal rules found. Create your first meal rule to get started."
                      : "No meal rules found for the selected area."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((mealRule) => (
                  <TableRow key={mealRule.id}>
                    <TableCell>{(mealRule?.mealType?.name)}</TableCell>
                    <TableCell>{(mealRule?.area?.name)}</TableCell>
                    <TableCell>{(mealRule?.device?.deviceName)}</TableCell> {/* Display device name */}
                    <TableCell>
                      {mealRule.startTime} - {mealRule.endTime}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {mealRule.days.map((day) => (
                          <Badge key={day} variant="outline" className="bg-primary/5">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(mealRule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(mealRule)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalItems > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onPageSize
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Dialogs */}
      <MealRuleForm
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["mealRules"] });
          setIsCreateDialogOpen(false);
        }}
      />

      {selectedMealRule && (
        <MealRuleForm
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          mealRuleToEdit={selectedMealRule}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["mealRules"] });
            setIsEditDialogOpen(false);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Meal Rule"
        description="Are you sure you want to delete this meal rule?"
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default MealRulesList;
