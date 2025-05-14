
export interface Area {
  id: number;
  name: string;
  description?: string;
}
export interface Device {
  id: number;
  deviceName: string;
  description?: string;
  areaId: number;
  SN: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface MealType {
  id: number;
  name: string;
  areaId: number;
  description?: string;
}

export interface MealRule {
  id: number;
  mealTypeId: number;
  startTime: string;
  endTime: string;
  days: string[];
  areaId: number;
  deviceId: number;
}

export interface MealRestriction {
  id: number;
  areaId: number;
  mealTypeId: number;
  employeeId?: number;
  department?: string;
}

export interface Employee {
  employeeId: number;
  pin: number;
  password: string;
  group: number;
  // startTime: string;
  // endTime: string;
  name: string;
  privilege: number;
  department: string;
  phone: string;
  email: string;
  areaAccess: number[];
}

export interface DashboardStats {
  totalAreas: number;
  activeEmployees: number;
  totalMealTypes: number;
  totalDepartments: number;
}
