import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Check, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ExcelImportProps = {
  importUrl: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

const ExcelImport: React.FC<ExcelImportProps> = ({ importUrl, onSuccess, onError }) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    if (e.target.files?.length) {
      setImportFile(e.target.files[0]);
    }
  };

 const handleImport = async () => {
  if (!importFile) {
    setError("Please select a file first");
    return;
  }

  setError(null);
  setImporting(true);
  setSuccess(false);

  try {
    const formData = new FormData();
    formData.append("file", importFile);

    const res = await fetch(importUrl, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();

      // Use errorData.error (not message) and strip "Error: " prefix if exists
      let errorMsg = errorData.error || "Import failed";
      if (errorMsg.startsWith("Error: ")) {
        errorMsg = errorMsg.slice(7);
      }
      throw new Error(errorMsg);
    }

    setImportFile(null);
    setSuccess(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onSuccess?.();
  } catch (err: any) {
    const errorMsg = err.message || "An error occurred during import";

    setError(errorMsg);
    onError?.(errorMsg);
  } finally {
    setImporting(false);
  }
};


  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-green-600" />
          Import Employees from Excel
        </h3>

        <div className="mb-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${importFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
            onClick={triggerFileInput}
          >
            {importFile ? (
              <div className="flex flex-col items-center">
                <Check className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm font-medium text-gray-900">{importFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(importFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">Click to select Excel file</p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports .xls and .xlsx formats
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx"
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <Check className="h-4 w-4" />
            <AlertDescription>File imported successfully!</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleImport}
            disabled={importing || !importFile}
            className="bg-blue-500 hover:bg-blue-500 text-white"
          >
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Import Excel
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExcelImport;
