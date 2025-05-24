import React from "react";
import PageHeader from "@/components/common/PageHeader";
import ExcelImport from "./ExcelImport";
import { Toaster as Sonner, toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const EmployeeImportPage: React.FC = () => {
    const queryClient = useQueryClient();
  const navigate = useNavigate();

    const handleImportSuccess = () => {
    queryClient.invalidateQueries(["employees"]);
    toast.success("Employees imported successfully!");
    navigate("/employees");
  };

  return (
    <div>
      <PageHeader
        title="Import Employees"
        description="Upload an Excel file to import multiple employees at once."
      />
      <div className="mt-6">
        <ExcelImport
          importUrl={`${import.meta.env.VITE_API_URL}/employees/import-employees`}
            onSuccess={handleImportSuccess}
   
          onError={() => {}}
        />
      </div>
    </div>
  );
};

export default EmployeeImportPage;
