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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Schema definition
const userFormSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().optional(),
  userType: z.enum(["Admin", "NormalUser"], {
    required_error: "User Type is required",
  }),
  areaAccess: z.array(z.string()).optional(),
});

// Form data type
type UserFormData = z.infer<typeof userFormSchema>;

// Props definition
interface UserFormProps {
  open: boolean;
  onClose: () => void;
  selectedUser: {
    user_id: string;
    username: string;
    usertype: "Admin" | "NormalUser";
    areaAccess?: string[];
  } | null;
  onSubmit: (data: UserFormData) => void;
}

const UserForm: React.FC<UserFormProps> = ({
  open,
  onClose,
  selectedUser,
  onSubmit,
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

  // Fetch areas
  const fetchAreas = async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/areas`);
    return response.data;
  };

  const { data: areasData, isLoading: isAreasLoading } = useQuery({
    queryKey: ["areas"],
    queryFn: fetchAreas,
  });

  // Populate form on edit
  useEffect(() => {
    if (selectedUser) {
      form.reset({
        user_id: selectedUser.user_id,
        username: selectedUser.username,
        password: "",
        userType: selectedUser.usertype,
        areaAccess: selectedUser.areaAccess ?? [],
      });
    } else {
      form.reset();
    }
  }, [selectedUser]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{selectedUser ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
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

            {/* Area Access Checkboxes */}
            <FormField
              control={form.control}
              name="areaAccess"
              render={() => (
                <FormItem>
                  <FormLabel>Area Access</FormLabel>
                  {isAreasLoading ? (
                    <p className="text-sm text-muted-foreground">Loading areas...</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {areasData?.map((area: any) => (
                        <label key={area.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value={area.id}
                            checked={form.watch("areaAccess")?.includes(area.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const current = form.getValues("areaAccess") || [];
                              if (checked) {
                                form.setValue("areaAccess", [...current, area.id]);
                              } else {
                                form.setValue(
                                  "areaAccess",
                                  current.filter((id: string) => id !== area.id)
                                );
                              }
                            }}
                          />
                          <span>{area.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedUser ? "Update User" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
