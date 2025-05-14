import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FullScreenLoader from '@/components/ui/FullScreenLoader';
import axios from 'axios';
import { useExportMealHistory } from '@/hooks/useExportMealHistory';

const MealHistoryReport = () => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null); // Store PDF blob URL
  const [mealTypes, setMealTypes] = useState([]); // Meal types for dropdown

  const form = useForm({
    defaultValues: {
      mealTypeId: '',
      employeePin: '',
      employeeName: '',
      start_date: '',
      end_date: '',
    },
  });

  const exportMutation = useExportMealHistory();

  // Fetch meal types for dropdown
useEffect(() => {
  const fetchMealTypes = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/mealTypes`);
      setMealTypes(response.data || []);
    } catch (error) {
      console.error("Failed to fetch meal types:", error);
    }
  };
  fetchMealTypes();
}, []);


  // Generate PDF and display it in the viewer
  const handleGeneratePDF = () => {
    const filters = form.getValues();
    exportMutation.mutate(
      { type: 'pdf', filters },
      {
        onSuccess: (blob) => {
          if (pdfBlobUrl) {
            URL.revokeObjectURL(pdfBlobUrl); // Clean up previous URL
          }
          const blobUrl = URL.createObjectURL(blob);
          setPdfBlobUrl(blobUrl); // Set new URL for iframe
        },
        onError: (error) => {
          console.error('PDF generation failed:', error);
          alert('Failed to generate PDF.');
        },
      }
    );
  };

  // Export to Excel (download as in the first snippet)
  const handleExportExcel = () => {
    const filters = form.getValues();
    exportMutation.mutate(
      { type: 'xlsx', filters },
      {
        onSuccess: (blob) => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'meal_history.xlsx';
          document.body.appendChild(link);
          link.click();
          link.remove();
        },
        onError: (error) => {
          console.error('Export failed:', error);
          alert('Failed to export Excel file.');
        },
      }
    );
  };

  // Clean up blob URL on unmount or when pdfBlobUrl changes
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Meal History Report</h1>

      <Form {...form}>
        <form className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <FormField
              control={form.control}
              name="mealTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Type</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="border rounded px-2 py-2 w-full text-sm"
                    >
                      <option value="">All Meal Types</option>
                      {mealTypes.map((type) => (
                        <option key={type.mealTypeId} value={type.mealTypeId}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employeePin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee PIN</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employeeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-x-2">
            <Button
              type="button"
              onClick={handleGeneratePDF}
              disabled={exportMutation.isPending}
            >
              Submit 
            </Button>
            <Button
              type="button"
              onClick={handleExportExcel}
              disabled={exportMutation.isPending}
              variant="outline"
            >
              Export to Excel
            </Button>
          </div>

          {exportMutation.isPending && <FullScreenLoader />}
        </form>
      </Form>

      {/* PDF Viewer replacing the table */}
      {pdfBlobUrl && (
        <div className="mt-6">
          <iframe
            src={pdfBlobUrl}
            className="w-full h-[100vh] border rounded"
            title="Meal History PDF"
          />
        </div>
      )}
    </div>
  );
};

export default MealHistoryReport;