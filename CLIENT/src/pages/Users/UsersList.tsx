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
import UserForm from "./UsersForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import TablePagination from "@/components/common/TablePagination";
import { User } from "@/types";

const UsersList: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
    return response.data;
  };

  const { data: usersData, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedUser) return;

    const deleteUser = async (id: string) => {
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/users/${id}`);
      return res.data;
    };

    const mutation = useMutation({
      mutationFn: () => deleteUser(selectedUser.user_id),
      onSuccess: () => {
        queryClient.invalidateQueries(["users"]);
        setSelectedUser(null);
      },
      onError: (error) => {
        console.error("Error deleting user:", error);
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
  } = usePagination(usersData ?? []);

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage users in your organization"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        }
      />

      <Card className="dashboard-card">
        <CardContent className="p-4">
          <Table className="data-table">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    Error fetching users. Please try again later.
                  </TableCell>
                </TableRow>
              ) : paginatedData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData?.map((user: User) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.usertype}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user)}
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

    <UserForm
  open={isCreateDialogOpen}
  onClose={() => setIsCreateDialogOpen(false)}
  selectedUser={null}
  onSubmit={(data) => {
    // your create logic
  }}
/>


      {/* Edit User Dialog */}
     {selectedUser && (
  <UserForm
    open={isEditDialogOpen}
    onClose={() => setIsEditDialogOpen(false)}
    selectedUser={selectedUser}
    onSubmit={(data) => {
      // your update logic
    }}
  />
)}


      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete the user "${selectedUser?.username}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default UsersList;
