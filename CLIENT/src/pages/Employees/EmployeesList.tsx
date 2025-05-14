import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmployeeForm from "./EmployeeForm";
import { Employee } from "@/types";
import TablePagination from "@/components/common/TablePagination";
import { usePagination } from "@/hooks/use-pagination";
import axios from "axios";

// Fetch Employees from API
const fetchEmployees = async (): Promise<Employee[]> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/employees/employees`);
  if (!res.ok) throw new Error("Failed to fetch employees");
  const data = await res.json();
  return data.data;
};

// Delete Employee from API
const deleteEmployee = async (employeeId: number) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/employees/employees/${employeeId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete employee");
};

// Fetch Areas from API (for select/dropdown, etc.)
const fetchAreas = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/areas`);
  return response.data;
};

const EmployeesList: React.FC = () => {
  const queryClient = useQueryClient();

  // Use React Query to fetch areas data
  const { data: areasData } = useQuery({
    queryKey: ["areas"],
    queryFn: fetchAreas,
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Query for employee list
  const { data: employees = [], isLoading, isError } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  // Pagination logic
  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    totalItems,
    setCurrentPage,
    setPageSize,
  } = usePagination(employees);

  // Edit Employee Handler
  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  // Delete Employee Handler
  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  // Confirm Employee Deletion
  const confirmDelete = () => {
    if (selectedEmployee?.employeeId) {
      deleteMutation.mutate(selectedEmployee.employeeId);
      setIsDeleteDialogOpen(false);
    }
  };

  // Loading and Error States
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Failed to load employees</div>;

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage employees and their area access"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        }
      />

      <Card className="dashboard-card">
        <CardContent className="p-4">
          <Table className="data-table">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Area Access</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No employees found. Create your first employee to get started.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.employeeId ?? employee.id}</TableCell>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.department ?? "-"}</TableCell>
                    <TableCell>{employee.email ?? "-"}</TableCell>
                    <TableCell>
                      {employee.areaAccess?.map((access) => (
                        <Badge key={access.areaId} variant="outline" className="bg-primary/5">
                          {access.area?.name ?? `Area ${access.areaId}`}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(employee)}
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

      <EmployeeForm
        key={isEditDialogOpen ? selectedEmployee?.employeeId : "create"}
        isOpen={isEditDialogOpen || isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedEmployee(null);
        }}
        employeeToEdit={isEditDialogOpen ? selectedEmployee : undefined}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Employee"
        description={`Are you sure you want to delete "${selectedEmployee?.name}"?`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default EmployeesList;
