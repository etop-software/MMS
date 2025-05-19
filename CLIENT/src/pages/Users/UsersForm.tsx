import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const userFormSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().optional(),
  userType: z.enum(["Admin", "NormalUser"], {
    required_error: "User Type is required",
  }),
  areaAccess: z.array(z.string()).optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  selectedUser: {
    user_id: string;
    username: string;
    usertype: "Admin" | "NormalUser";
    areaAccess?: string[];
  } | null;
}

const UserForm: React.FC<UserFormProps> = ({
  open,
  onClose,
  selectedUser,
}) => {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      user_id: "",
      username: "",
      password: "",
      userType: "NormalUser",
      areaAccess: [],
    },
  });

  const queryClient = useQueryClient();

  // Fetch areas
  const fetchAreas = async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/areas`);
    return response.data;
  };

  const { data: areasData, isLoading: isAreasLoading } = useQuery({
    queryKey: ["areas"],
    queryFn: fetchAreas,
  });

const userMutation = useMutation({
  mutationFn: (data: UserFormData) => {
    const payload = {
      ...data,
      areaAccess: data.areaAccess?.map(Number), // 🔁 convert string[] to number[]
    };

    if (selectedUser) {
      // Update user
      return axios.put(`${import.meta.env.VITE_API_URL}/users/${data.user_id}`, payload);
    } else {
      // Add user
      return axios.post(`${import.meta.env.VITE_API_URL}/users`, payload);
    }
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    onClose();
  },
  onError: (error) => {
    console.error("Mutation error:", error);
    // You can show a toast or alert here
  },
});



  // Populate form on edit
  useEffect(() => {
    if (selectedUser) {
      form.reset({
        user_id: selectedUser.user_id,
        username: selectedUser.username,
        password: "",
        userType: selectedUser.usertype,
        areaAccess: selectedUser.areaAccess?.map(String) ?? [],
      });
    } else {
      form.reset();
    }
  }, [selectedUser]);

  // Submit handler
  const handleSubmit = (data: UserFormData) => {
    userMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{selectedUser ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!!selectedUser} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Type</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full border rounded p-2">
                      <option value="Admin">Admin</option>
                      <option value="NormalUser">Normal User</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="areaAccess"
              render={({ field }) => {
                const current = field.value || [];
                const allAreaIds = areasData?.map((a) => a.id.toString()) || [];

                const allSelected = allAreaIds.length > 0 && current.length === allAreaIds.length;
                const isIndeterminate = current.length > 0 && current.length < allAreaIds.length;

                const toggleSelectAll = (checked: boolean) => {
                  if (checked) {
                    field.onChange(allAreaIds);
                  } else {
                    field.onChange([]);
                  }
                };

                return (
                  <FormItem>
                    <FormLabel>Area Access</FormLabel>
                    {isAreasLoading ? (
                      <p className="text-sm text-muted-foreground">Loading areas...</p>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id="select-all"
                            checked={allSelected}
                            indeterminate={isIndeterminate}
                            onCheckedChange={toggleSelectAll}
                          />
                          <label
                            htmlFor="select-all"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Select All
                          </label>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {areasData?.map((area: any) => {
                            const areaIdStr = area.id.toString();
                            const isChecked = current.includes(areaIdStr);

                            return (
                              <div key={area.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`area-${area.id}`}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    const updated = checked
                                      ? [...current, areaIdStr]
                                      : current.filter((id: string) => id !== areaIdStr);
                                    field.onChange(updated);
                                  }}
                                />
                                <label
                                  htmlFor={`area-${area.id}`}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {area.name}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <DialogFooter className="pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={userMutation.isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={userMutation.isLoading}>
                {userMutation.isLoading
                  ? selectedUser
                    ? "Updating..."
                    : "Creating..."
                  : selectedUser
                  ? "Update User"
                  : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
