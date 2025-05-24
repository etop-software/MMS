import React, { useState } from "react";
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
import DepartmentForm from "./DepartmentForm";
import { Department } from "@/types";
import TablePagination from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/use-pagination";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function fetchDepartments(): Promise<Department[]> {
  const res = await fetch(`${API_BASE_URL}/departments`);
  if (!res.ok) {
    throw new Error("Failed to fetch departments");
  }
  return res.json();
}

async function deleteDepartment(id: number) {
  const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete department");
  }
  return res.json();
}

const DepartmentsList: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch departments with React Query
  const { data: departments = [], isLoading, isError } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries(["departments"]);
      setIsDeleteDialogOpen(false);
      setSelectedDepartment(null);
    },
  });

  // Setup pagination with fetched departments
  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    totalItems,
    setCurrentPage,
    setPageSize,
  } = usePagination(departments);

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDepartment) {
      deleteMutation.mutate(selectedDepartment.id);
    }
  };

  if (isLoading) return <p>Loading departments...</p>;
  if (isError) return <p>Error loading departments.</p>;

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Manage departments in your organization"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
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
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    No departments found. Create your first department to get started.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>{department.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(department)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(department)}
                          disabled={deleteMutation.isLoading}
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

      {/* Create Department Dialog */}
      <DepartmentForm
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      {/* Edit Department Dialog */}
      {selectedDepartment && (
        <DepartmentForm
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          departmentToEdit={selectedDepartment}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Department"
        description={`Are you sure you want to delete the department "${selectedDepartment?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default DepartmentsList;
