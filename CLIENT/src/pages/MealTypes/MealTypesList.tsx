import React, { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
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
import { Edit, Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import MealTypeForm from "./MealTypeForm";
import { MealType } from "@/types";
import TablePagination from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/use-pagination";
// === API Calls ===

// Fetch Meal Types
const fetchMealTypes = async (): Promise<MealType[]> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/mealTypes`);
  if (!res.ok) throw new Error("Failed to fetch meal types");
  return res.json();
};

// Delete Meal Type
const deleteMealType = async (id: number) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/mealTypes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete meal type");
};



const MealTypesList: React.FC = () => {
  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(
    null
  );

  // === Queries ===
  const {
    data: mealTypes = [],
    isLoading: loadingMealTypes,
    refetch,
  } = useQuery({
    queryKey: ["mealTypes"],
    queryFn: fetchMealTypes,
  });

  // === Mutation for Delete ===
  const { mutate: deleteMealTypeMutation } = useMutation({
    mutationFn: deleteMealType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealTypes"] });
      setIsDeleteDialogOpen(false);
    },
  });

  // === Handlers ===
  const handleEdit = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMealType) {
      deleteMealTypeMutation(selectedMealType.mealTypeId);
    }
  };

  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    totalItems,
    setCurrentPage,
    setPageSize,
  } = usePagination(mealTypes);

  if (loadingMealTypes) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Meal Types"
        description="Manage different types of meals"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Meal Type
          </Button>
        }
      />

      <Card className="dashboard-card">
        <CardContent className="p-4">
          <Table className="data-table">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No meal types found. Create your first meal type to get started.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((mealType) => (
                  <TableRow key={mealType.mealTypeId}>
                    <TableCell className="font-medium">
                      {mealType.name}
                    </TableCell>
                    <TableCell>{mealType.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(mealType)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(mealType)}
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
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Create Dialog */}
      <MealTypeForm
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          refetch();
        }}
      />

      {/* Edit Dialog */}
      {selectedMealType && (
        <MealTypeForm
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            refetch();
          }}
          mealTypeToEdit={selectedMealType}
        />
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Meal Type"
        description={`Are you sure you want to delete the meal type "${selectedMealType?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default MealTypesList;
