import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface ExportParams {
  type: 'csv' | 'pdf';
  filters: {
    mealTypeId?: string;
    employeePin?: string;
    employeeName?: string;
    start_date?: string;
    end_date?: string;
  };
}

const exportMealHistory = async ({ type, filters }: ExportParams): Promise<Blob> => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/meal-history-reports/export/${type}`,
    {
      params: {
        meal_type_id: filters.mealTypeId || null,
        employee_pin: filters.employeePin || null,
        employee_name: filters.employeeName || null,
        start_date: filters.start_date || null,
        end_date: filters.end_date || null,
      },
      responseType: 'blob',
    }
  );
  return response.data;
};


export const useExportMealHistory = () => {
  return useMutation({
    mutationFn: exportMealHistory,
  });
};
