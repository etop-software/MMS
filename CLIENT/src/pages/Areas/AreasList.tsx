import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/common/PageHeader";
import { usePagination } from "@/hooks/use-pagination";
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
import AreaForm from "./AreaForm";
import { Area } from "@/types";
import { useQuery ,useMutation,useQueryClient} from "@tanstack/react-query";
import axios from "axios";
import TablePagination from "@/components/common/TablePagination";

// Function to fetch areas


const AreasList: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  const fetchAreas = async () => {
    const response = await axios.get("http://localhost:4000/api/areas");
    return response.data;
  };
  // Updated useQuery hook with the correct object format
  const { data: areasData, isLoading, isError } = useQuery({
    queryKey: ["areas"], // The query key
    queryFn: fetchAreas, // The function to fetch the data
  });

  const handleEdit = (area: Area) => {
    setSelectedArea(area);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (area: Area) => {
    setSelectedArea(area);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedArea) return;
  
    const deleteArea = async (id: number) => {
      const res = await fetch(`http://localhost:4000/api/areas/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete area");
      return res.json();
    };
  
    const mutation = useMutation({
      mutationFn: () => deleteArea(selectedArea.id),
      onSuccess: () => {
        queryClient.invalidateQueries(["areas"]); 
        setSelectedArea(null); 
      },
      onError: (error) => {
        console.error("Error deleting area:", error);
      },
    });
  
    mutation.mutate(); 
  };
  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    totalItems,
    setCurrentPage,
    setPageSize,
  } = usePagination(areasData ?? []);

  return (
    <div>
      <PageHeader
        title="Areas"
        description="Manage dining areas in your organization"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Area
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
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    Loading areas...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    Error fetching areas. Please try again later.
                  </TableCell>
                </TableRow>
              ) : paginatedData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    No areas found. Create your first area to get started.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData?.map((area: Area) => (
                  <TableRow key={area.id}>
                    <TableCell className="font-medium">{area.name}</TableCell>
                    <TableCell>{area.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(area)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(area)}
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

      {/* Create Area Dialog */}
      <AreaForm
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      {/* Edit Area Dialog */}
      {selectedArea && (
        <AreaForm
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          areaToEdit={selectedArea}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Area"
        description={`Are you sure you want to delete the area "${selectedArea?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default AreasList;
