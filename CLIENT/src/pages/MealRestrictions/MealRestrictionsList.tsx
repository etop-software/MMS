
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
import { Edit, Plus, Trash2, User, Users } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import MealRestrictionForm from "./MealRestrictionForm";
import { MealRestriction } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TablePagination from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/use-pagination";

const MealRestrictionsList: React.FC = () => {
  const { mealRestrictions, removeMealRestriction, areas, mealTypes, employees } = useAppContext();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMealRestriction, setSelectedMealRestriction] = useState<MealRestriction | null>(null);
  const [filterAreaId, setFilterAreaId] = useState<string>("all");

  // Filter meal restrictions by area
  const filteredMealRestrictions = filterAreaId === "all" 
    ? mealRestrictions 
    : mealRestrictions.filter(mr => mr.areaId === parseInt(filterAreaId));

  // Setup pagination
  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    totalItems,
    setCurrentPage,
    setPageSize
  } = usePagination(filteredMealRestrictions);
  
  const handleEdit = (mealRestriction: MealRestriction) => {
    setSelectedMealRestriction(mealRestriction);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (mealRestriction: MealRestriction) => {
    setSelectedMealRestriction(mealRestriction);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMealRestriction) {
      removeMealRestriction(selectedMealRestriction.id);
    }
  };

  // Helper functions for display
  const getAreaName = (areaId: number) => {
    const area = areas.find(a => a.id === areaId);
    return area ? area.name : `Area ${areaId}`;
  };

  const getMealTypeName = (mealTypeId: number) => {
    const mealType = mealTypes.find(mt => mt.id === mealTypeId);
    return mealType ? mealType.name : `Meal Type ${mealTypeId}`;
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(e => e.employeeId === employeeId);
    return employee ? employee.name : `Employee ${employeeId}`;
  };

  // Get restriction type and subject
  const getRestrictionInfo = (restriction: MealRestriction) => {
    if (restriction.employeeId) {
      return {
        type: "Employee",
        subject: getEmployeeName(restriction.employeeId),
        icon: <User className="h-4 w-4" />
      };
    } else if (restriction.department) {
      return {
        type: "Department",
        subject: restriction.department,
        icon: <Users className="h-4 w-4" />
      };
    }
    return {
      type: "Unknown",
      subject: "Unknown",
      icon: null
    };
  };

  return (
    <div>
      <PageHeader
        title="Meal Restrictions"
        description="Control access to meal types by employee or department"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Restriction
          </Button>
        }
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          Filter by Area
        </label>
        <Select 
          defaultValue="all"
          onValueChange={setFilterAreaId}
        >
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
                <TableHead>Area</TableHead>
                <TableHead>Meal Type</TableHead>
                <TableHead>Restriction Type</TableHead>
                <TableHead>Applied To</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    {filterAreaId === "all" 
                      ? "No meal restrictions found. Create your first restriction to get started."
                      : "No meal restrictions found for the selected area."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((mealRestriction) => {
                  const restrictionInfo = getRestrictionInfo(mealRestriction);
                  
                  return (
                    <TableRow key={mealRestriction.id}>
                      <TableCell>
                        {getAreaName(mealRestriction.areaId)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getMealTypeName(mealRestriction.mealTypeId)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/5 flex items-center gap-1 w-fit">
                          {restrictionInfo.icon}
                          <span>{restrictionInfo.type}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {restrictionInfo.subject}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(mealRestriction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(mealRestriction)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Pagination moved outside the card */}
      {totalItems > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Create Meal Restriction Dialog */}
      <MealRestrictionForm
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      {/* Edit Meal Restriction Dialog */}
      {selectedMealRestriction && (
        <MealRestrictionForm
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          mealRestrictionToEdit={selectedMealRestriction}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Meal Restriction"
        description="Are you sure you want to delete this meal restriction? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default MealRestrictionsList;
