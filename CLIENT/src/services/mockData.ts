
import { Area, Department, Employee, MealType, MealRule, MealRestriction } from "@/types";

// Mock Areas
export const areas: Area[] = [
  { id: 1, name: "Main Cafeteria", description: "Primary dining area for all employees" },
  { id: 2, name: "Executive Lounge", description: "Dining area for executives and senior management" },
  { id: 3, name: "Engineering Wing", description: "Snack area in the engineering department" }
];

// Mock Departments
export const departments: Department[] = [
  { id: 1, name: "Engineering", description: "Software development and IT infrastructure" },
  { id: 2, name: "Marketing", description: "Brand development and market research" },
  { id: 3, name: "HR", description: "Human resources and employee management" },
  { id: 4, name: "Finance", description: "Financial planning and accounting" },
  { id: 5, name: "Operations", description: "Day to day business operations" }
];

// Mock Employees
export const employees: Employee[] = [
  // {
  //   employeeId: 1001,
  //   pin: 1001,
  //   password: "1234",
  //   group: 0,
  //   startTime: "09:00",
  //   endTime: "18:00",
  //   name: "Alex Morgan",
  //   privilege: 1,
  //   department: "Engineering",
  //   phone: "+1 555-1234",
  //   email: "alex.morgan@company.com",
  //   areaAccess: [1, 2, 3]
  // },
  // {
  //   employeeId: 1002,
  //   pin: 1002,
  //   password: "1234",
  //   group: 0,
  //   startTime: "08:00",
  //   endTime: "17:00",
  //   name: "Jordan Lee",
  //   privilege: 0,
  //   department: "Marketing",
  //   phone: "+1 555-2345",
  //   email: "jordan.lee@company.com",
  //   areaAccess: [1]
  // },
  // {
  //   employeeId: 1003,
  //   pin: 1003,
  //   password: "1234",
  //   group: 0,
  //   startTime: "09:00",
  //   endTime: "18:00",
  //   name: "Taylor Williams",
  //   privilege: 0,
  //   department: "HR",
  //   phone: "+1 555-3456",
  //   email: "taylor.williams@company.com",
  //   areaAccess: [1, 2]
  // },
  // {
  //   employeeId: 1004,
  //   pin: 1004,
  //   password: "1234",
  //   group: 1,
  //   startTime: "08:30",
  //   endTime: "17:30",
  //   name: "Casey Smith",
  //   privilege: 1,
  //   department: "Finance",
  //   phone: "+1 555-4567",
  //   email: "casey.smith@company.com",
  //   areaAccess: [1, 2]
  // },
  // {
  //   employeeId: 1005,
  //   pin: 1005,
  //   password: "1234",
  //   group: 0,
  //   startTime: "09:00",
  //   endTime: "18:00",
  //   name: "Morgan Chen",
  //   privilege: 0,
  //   department: "Engineering",
  //   phone: "+1 555-5678",
  //   email: "morgan.chen@company.com",
  //   areaAccess: [1, 3]
  // }
];

// Mock Meal Types
export const mealTypes: MealType[] = [
  { id: 2, name: "Breakfast", areaId: 1, description: "Morning meal options" },
  { id: 3, name: "Lunch", areaId: 1, description: "Midday meal options" },
  { id: 4, name: "Dinner", areaId: 1, description: "Evening meal options" },
  { id: 5, name: "Snacks", areaId: 1, description: "All-day snack options" },
  { id: 2, name: "Breakfast", areaId: 2, description: "Executive breakfast options" },
  { id: 3, name: "Lunch", areaId: 2, description: "Executive lunch options" },
  { id: 4, name: "Dinner", areaId: 2, description: "Evening meal options" },
  { id: 5, name: "Snacks", areaId: 2, description: "All-day snack options" },
  { id: 2, name: "Breakfast", areaId: 3, description: "Executive breakfast options" },
  { id: 3, name: "Lunch", areaId: 3, description: "Executive lunch options" },
  { id: 4, name: "Dinner", areaId: 3, description: "Evening meal options" },
  { id: 5, name: "Snacks", areaId: 3, description: "All-day snack options" }
];

// Mock Meal Rules
export const mealRules: MealRule[] = [
  // {
  //   id: 1,
  //   mealTypeId: 1,
  //   startTime: "07:00",
  //   endTime: "10:00",
  //   days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  //   areaId: 1
  // },
  // {
  //   id: 2,
  //   mealTypeId: 2,
  //   startTime: "12:00",
  //   endTime: "14:00",
  //   days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  //   areaId: 1
  // },
  // {
  //   id: 3,
  //   mealTypeId: 3,
  //   startTime: "18:00",
  //   endTime: "20:00",
  //   days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  //   areaId: 1
  // },
  // {
  //   id: 4,
  //   mealTypeId: 4,
  //   startTime: "08:00",
  //   endTime: "09:30",
  //   days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  //   areaId: 2
  // },
  // {
  //   id: 5,
  //   mealTypeId: 5,
  //   startTime: "12:00",
  //   endTime: "14:00",
  //   days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  //   areaId: 2
  // },
  // {
  //   id: 6,
  //   mealTypeId: 6,
  //   startTime: "09:00",
  //   endTime: "17:00",
  //   days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  //   areaId: 3
  // }
];

// Mock Meal Restrictions
export const mealRestrictions: MealRestriction[] = [
  // {
  //   id: 1,
  //   areaId: 2,
  //   mealTypeId: 4,
  //   employeeId: 1001
  // },
  // {
  //   id: 2,
  //   areaId: 2,
  //   mealTypeId: 5,
  //   department: "Engineering"
  // },
  // {
  //   id: 3,
  //   areaId: 3,
  //   mealTypeId: 6,
  //   department: "Engineering"
  // }
];

// Mock data service functions
let nextAreaId = areas.length + 1;
let nextDepartmentId = departments.length + 1;
let nextMealTypeId = mealTypes.length + 1;
let nextMealRuleId = mealRules.length + 1;
let nextMealRestrictionId = mealRestrictions.length + 1;
let nextEmployeeId = 1006;

// Helper functions to manipulate mock data
export const getAreas = (): Area[] => [...areas];
export const getAreaById = (id: number): Area | undefined => areas.find(area => area.id === id);
export const addArea = (area: Omit<Area, "id">): Area => {
  const newArea = { id: nextAreaId++, ...area };
  areas.push(newArea);
  return newArea;
};
export const updateArea = (area: Area): Area | undefined => {
  const index = areas.findIndex(a => a.id === area.id);
  if (index !== -1) {
    areas[index] = area;
    return area;
  }
  return undefined;
};
export const deleteArea = (id: number): boolean => {
  const index = areas.findIndex(area => area.id === id);
  if (index !== -1) {
    areas.splice(index, 1);
    return true;
  }
  return false;
};

export const getDepartments = (): Department[] => [...departments];
export const getDepartmentById = (id: number): Department | undefined => departments.find(dept => dept.id === id);
export const addDepartment = (department: Omit<Department, "id">): Department => {
  const newDepartment = { id: nextDepartmentId++, ...department };
  departments.push(newDepartment);
  return newDepartment;
};
export const updateDepartment = (department: Department): Department | undefined => {
  const index = departments.findIndex(d => d.id === department.id);
  if (index !== -1) {
    departments[index] = department;
    return department;
  }
  return undefined;
};
export const deleteDepartment = (id: number): boolean => {
  const index = departments.findIndex(dept => dept.id === id);
  if (index !== -1) {
    departments.splice(index, 1);
    return true;
  }
  return false;
};

export const getEmployees = (): Employee[] => [...employees];
export const getEmployeeById = (id: number): Employee | undefined => employees.find(emp => emp.employeeId === id);
export const addEmployee = (employee: Omit<Employee, "employeeId">): Employee => {
  const newEmployee = { employeeId: nextEmployeeId++, ...employee };
  employees.push(newEmployee);
  return newEmployee;
};
export const updateEmployee = (employee: Employee): Employee | undefined => {
  const index = employees.findIndex(e => e.employeeId === employee.employeeId);
  if (index !== -1) {
    employees[index] = employee;
    return employee;
  }
  return undefined;
};
export const deleteEmployee = (id: number): boolean => {
  const index = employees.findIndex(emp => emp.employeeId === id);
  if (index !== -1) {
    employees.splice(index, 1);
    return true;
  }
  return false;
};

export const getMealTypes = (): MealType[] => [...mealTypes];
export const getMealTypesByAreaId = (areaId: number): MealType[] => 
  mealTypes.filter(mealType => mealType.areaId === areaId);
export const getMealTypeById = (id: number): MealType | undefined => mealTypes.find(mt => mt.id === id);
export const addMealType = (mealType: Omit<MealType, "id">): MealType => {
  const newMealType = { id: nextMealTypeId++, ...mealType };
  mealTypes.push(newMealType);
  return newMealType;
};
export const updateMealType = (mealType: MealType): MealType | undefined => {
  const index = mealTypes.findIndex(mt => mt.id === mealType.id);
  if (index !== -1) {
    mealTypes[index] = mealType;
    return mealType;
  }
  return undefined;
};
export const deleteMealType = (id: number): boolean => {
  const index = mealTypes.findIndex(mt => mt.id === id);
  if (index !== -1) {
    mealTypes.splice(index, 1);
    return true;
  }
  return false;
};

export const getMealRules = (): MealRule[] => [...mealRules];
export const getMealRulesByAreaId = (areaId: number): MealRule[] => 
  mealRules.filter(mealRule => mealRule.areaId === areaId);
export const getMealRuleById = (id: number): MealRule | undefined => mealRules.find(mr => mr.id === id);
export const addMealRule = (mealRule: Omit<MealRule, "id">): MealRule => {
  const newMealRule = { id: nextMealRuleId++, ...mealRule };
  mealRules.push(newMealRule);
  return newMealRule;
};
export const updateMealRule = (mealRule: MealRule): MealRule | undefined => {
  const index = mealRules.findIndex(mr => mr.id === mealRule.id);
  if (index !== -1) {
    mealRules[index] = mealRule;
    return mealRule;
  }
  return undefined;
};
export const deleteMealRule = (id: number): boolean => {
  const index = mealRules.findIndex(mr => mr.id === id);
  if (index !== -1) {
    mealRules.splice(index, 1);
    return true;
  }
  return false;
};

export const getMealRestrictions = (): MealRestriction[] => [...mealRestrictions];
export const getMealRestrictionsByAreaId = (areaId: number): MealRestriction[] => 
  mealRestrictions.filter(mealRestriction => mealRestriction.areaId === areaId);
export const getMealRestrictionById = (id: number): MealRestriction | undefined => mealRestrictions.find(mr => mr.id === id);
export const addMealRestriction = (mealRestriction: Omit<MealRestriction, "id">): MealRestriction => {
  const newMealRestriction = { id: nextMealRestrictionId++, ...mealRestriction };
  mealRestrictions.push(newMealRestriction);
  return newMealRestriction;
};
export const updateMealRestriction = (mealRestriction: MealRestriction): MealRestriction | undefined => {
  const index = mealRestrictions.findIndex(mr => mr.id === mealRestriction.id);
  if (index !== -1) {
    mealRestrictions[index] = mealRestriction;
    return mealRestriction;
  }
  return undefined;
};
export const deleteMealRestriction = (id: number): boolean => {
  const index = mealRestrictions.findIndex(mr => mr.id === id);
  if (index !== -1) {
    mealRestrictions.splice(index, 1);
    return true;
  }
  return false;
};

// Calculate dashboard stats
export const getDashboardStats = () => {
  return {
    totalAreas: areas.length,
    activeEmployees: employees.length,
    totalMealTypes: mealTypes.length,
    totalDepartments: departments.length
  };
};
