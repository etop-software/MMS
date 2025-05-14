import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface MealHistoryFilters {
  mealTypeId?: string;
  employeePin?: string;
  employeeName?: string;
  start_date?: string;
  end_date?: string;
  limit: number;
  offset: number;
}

interface MealHistoryResponse {
  data: any[];
  total: number;
}

const fetchMealHistory = async (filters: MealHistoryFilters): Promise<MealHistoryResponse> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/meal-history`, {
    params: {
      meal_type_id: filters.mealTypeId || null,
      employee_pin: filters.employeePin || null,
      employee_name: filters.employeeName || null,
      start_date: filters.start_date || null,
      end_date: filters.end_date || null,
      limit: filters.limit,
      offset: filters.offset,
    },
  });
  return response.data;
};


export const useMealHistory = (filters: MealHistoryFilters) => {
  return useQuery({
    queryKey: ['mealHistory', filters],
    queryFn: () => fetchMealHistory(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
};
