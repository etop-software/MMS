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
import DesignationForm from "./DesignationForm";
import { Designation } from "@/types";
import TablePagination from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/use-pagination";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function fetchDesignations(): Promise<Designation[]> {
  const res = await fetch(`${API_BASE_URL}/designations`);
  if (!res.ok) {
    throw new Error("Failed to fetch designations");
  }
  return res.json();
}

async function deleteDesignation(id: number) {
  const res = await fetch(`${API_BASE_URL}/designations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete designation");
  }
  return res.json();
}

const DesignationsList: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: designations = [], isLoading, isError } = useQuery({
    queryKey: ["designations"],
    queryFn: fetchDesignations,
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteDesignation,
    onSuccess: () => {
      queryClient.invalidateQueries(["designations"]);
      setIsDeleteDialogOpen(false);
      setSelectedDesignation(null);
    },
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    totalItems,
    setCurrentPage,
    setPageSize,
  } = usePagination(designations);

  const handleEdit = (designation: Designation) => {
    setSelectedDesignation(designation);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (designation: Designation) => {
    setSelectedDesignation(designation);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDesignation) {
      deleteMutation.mutate(selectedDesignation.id);
    }
  };

  if (isLoading) return <p>Loading designations...</p>;
  if (isError) return <p>Error loading designations.</p>;

  return (
    <div>
      <PageHeader
        title="Designations"
        description="Manage designations in your organization"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Designation
          </Button>
        }
      />

      <Card className="dashboard-card">
        <CardContent className="p-4">
          <Table className="data-table">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    No designations found. Create your first designation to get started.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((designation) => (
                  <TableRow key={designation.id}>
                    <TableCell className="font-medium">{designation.title}</TableCell>
                    <TableCell>{designation.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(designation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(designation)}
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

      {/* Create Designation Dialog */}
      <DesignationForm
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      {/* Edit Designation Dialog */}
      {selectedDesignation && (
        <DesignationForm
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          designationToEdit={selectedDesignation}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Designation"
        description={`Are you sure you want to delete the designation "${selectedDesignation?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default DesignationsList;
