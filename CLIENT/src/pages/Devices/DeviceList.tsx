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
import { Edit } from "lucide-react";
import DeviceEditForm from "./DeviceEditForm";
import { Device } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import TablePagination from "@/components/common/TablePagination";

const fetchDevices = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/devices`);
  console.log(res.data);
  return res.data;
};

const DeviceList: React.FC = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const { data: devicesData, isLoading, isError } = useQuery({
    queryKey: ["devices"],
    queryFn: fetchDevices,
  });

  const handleEdit = (device: Device) => {
    setSelectedDevice(device);
    setIsEditDialogOpen(true);
  };

  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    totalItems,
    setCurrentPage,
    setPageSize,
  } = usePagination(devicesData ?? []);

  // Helper to check online status
  const isOnline = (updatedAt: string | Date) => {
    const updated = new Date(updatedAt);
    const now = new Date();
    return now.getTime() - updated.getTime() <= 60 * 1000; // 1 minute in ms
  };

  return (
    <div>
      <PageHeader
        title="Devices"
        description="Manage devices in your organization"
      />

      <Card className="dashboard-card">
        <CardContent className="p-4">
          <Table className="data-table">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SN</TableHead>
                <TableHead>Punches</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>FPs</TableHead>
                <TableHead>Faces</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                    Loading devices...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                    Error fetching devices. Please try again later.
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                    No devices found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((device: Device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium underline ">{device.deviceName}</TableCell>
                    <TableCell>{device.SN}</TableCell>
                    <TableCell>{device.transactionCount ?? "-"}</TableCell>
                    <TableCell>{device.ipAddress ?? "-"}</TableCell>
                    <TableCell>{device.userCount ?? "-"}</TableCell>
                    <TableCell>{device.fpCount ?? "-"}</TableCell>
                    <TableCell>{device.faceCount ?? "-"}</TableCell>
                    <TableCell>{device.area?.name ?? "No Area Assigned"}</TableCell>
                    <TableCell>
                      <span
                        className={
                          isOnline(device.updatedAt)
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {isOnline(device.updatedAt) ? "Online" : "Offline"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(device)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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

      {/* Edit Device Dialog */}
      {selectedDevice && (
        <DeviceEditForm
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          deviceToEdit={selectedDevice}
        />
      )}
    </div>
  );
};

export default DeviceList;
