
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { 
  Area, Department, Employee, MealType, MealRule, MealRestriction, DashboardStats 
} from "@/types";
import { toast } from "sonner";
import {
  getAreas, getDepartments, getEmployees, getMealTypes, getMealRules, getMealRestrictions,
  addArea, updateArea, deleteArea,
  addDepartment, updateDepartment, deleteDepartment,
  addEmployee, updateEmployee, deleteEmployee,
  addMealType, updateMealType, deleteMealType,
  addMealRule, updateMealRule, deleteMealRule,
  addMealRestriction, updateMealRestriction, deleteMealRestriction,
  getDashboardStats
} from "@/services/mockData";

interface AppContextType {
  areas: Area[];
  departments: Department[];
  employees: Employee[];
  mealTypes: MealType[];
  mealRules: MealRule[];
  mealRestrictions: MealRestriction[];
  dashboardStats: DashboardStats;
  
  // Area operations
  createArea: (area: Omit<Area, "id">) => void;
  updateArea: (area: Area) => void;
  removeArea: (id: number) => void;
  
  // Department operations
  createDepartment: (department: Omit<Department, "id">) => void;
  updateDepartment: (department: Department) => void;
  removeDepartment: (id: number) => void;
  
  // Employee operations
  createEmployee: (employee: Omit<Employee, "employeeId">) => void;
  updateEmployee: (employee: Employee) => void;
  removeEmployee: (id: number) => void;
  
  // Meal Type operations
  createMealType: (mealType: Omit<MealType, "id">) => void;
  updateMealType: (mealType: MealType) => void;
  removeMealType: (id: number) => void;
  getMealTypesByAreaId: (areaId: number) => MealType[];
  
  // Meal Rule operations
  createMealRule: (mealRule: Omit<MealRule, "id">) => void;
  updateMealRule: (mealRule: MealRule) => void;
  removeMealRule: (id: number) => void;
  getMealRulesByAreaId: (areaId: number) => MealRule[];
  
  // Meal Restriction operations
  createMealRestriction: (mealRestriction: Omit<MealRestriction, "id">) => void;
  updateMealRestriction: (mealRestriction: MealRestriction) => void;
  removeMealRestriction: (id: number) => void;
  getMealRestrictionsByAreaId: (areaId: number) => MealRestriction[];
  
  // Refresh data
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [mealRules, setMealRules] = useState<MealRule[]>([]);
  const [mealRestrictions, setMealRestrictions] = useState<MealRestriction[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalAreas: 0,
    activeEmployees: 0,
    totalMealTypes: 0,
    totalDepartments: 0
  });

  // Load initial data
  const refreshData = () => {
    setAreas(getAreas());
    setDepartments(getDepartments());
    setEmployees(getEmployees());
    setMealTypes(getMealTypes());
    setMealRules(getMealRules());
    setMealRestrictions(getMealRestrictions());
    setDashboardStats(getDashboardStats());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Area operations
  const createArea = (area: Omit<Area, "id">) => {
    try {
      const newArea = addArea(area);
      setAreas([...getAreas()]);
      setDashboardStats(getDashboardStats());
      toast.success(`Area "${area.name}" created successfully`);
    } catch (error) {
      toast.error("Failed to create area");
      console.error(error);
    }
  };

  const updateAreaHandler = (area: Area) => {
    try {
      const updatedArea = updateArea(area);
      if (updatedArea) {
        setAreas([...getAreas()]);
        toast.success(`Area "${area.name}" updated successfully`);
      } else {
        toast.error("Area not found");
      }
    } catch (error) {
      toast.error("Failed to update area");
      console.error(error);
    }
  };

  const removeArea = (id: number) => {
    try {
      const success = deleteArea(id);
      if (success) {
        setAreas([...getAreas()]);
        setDashboardStats(getDashboardStats());
        toast.success("Area deleted successfully");
      } else {
        toast.error("Area not found");
      }
    } catch (error) {
      toast.error("Failed to delete area");
      console.error(error);
    }
  };

  // Department operations
  const createDepartment = (department: Omit<Department, "id">) => {
    try {
      const newDepartment = addDepartment(department);
      setDepartments([...getDepartments()]);
      setDashboardStats(getDashboardStats());
      toast.success(`Department "${department.name}" created successfully`);
    } catch (error) {
      toast.error("Failed to create department");
      console.error(error);
    }
  };

  const updateDepartmentHandler = (department: Department) => {
    try {
      const updatedDepartment = updateDepartment(department);
      if (updatedDepartment) {
        setDepartments([...getDepartments()]);
        toast.success(`Department "${department.name}" updated successfully`);
      } else {
        toast.error("Department not found");
      }
    } catch (error) {
      toast.error("Failed to update department");
      console.error(error);
    }
  };

  const removeDepartment = (id: number) => {
    try {
      const success = deleteDepartment(id);
      if (success) {
        setDepartments([...getDepartments()]);
        setDashboardStats(getDashboardStats());
        toast.success("Department deleted successfully");
      } else {
        toast.error("Department not found");
      }
    } catch (error) {
      toast.error("Failed to delete department");
      console.error(error);
    }
  };

  // Employee operations
  const createEmployee = (employee: Omit<Employee, "employeeId">) => {
    try {
      const newEmployee = addEmployee(employee);
      setEmployees([...getEmployees()]);
      setDashboardStats(getDashboardStats());
      toast.success(`Employee "${employee.name}" created successfully`);
    } catch (error) {
      toast.error("Failed to create employee");
      console.error(error);
    }
  };

  const updateEmployeeHandler = (employee: Employee) => {
    try {
      const updatedEmployee = updateEmployee(employee);
      if (updatedEmployee) {
        setEmployees([...getEmployees()]);
        toast.success(`Employee "${employee.name}" updated successfully`);
      } else {
        toast.error("Employee not found");
      }
    } catch (error) {
      toast.error("Failed to update employee");
      console.error(error);
    }
  };

  const removeEmployee = (id: number) => {
    try {
      const success = deleteEmployee(id);
      if (success) {
        setEmployees([...getEmployees()]);
        setDashboardStats(getDashboardStats());
        toast.success("Employee deleted successfully");
      } else {
        toast.error("Employee not found");
      }
    } catch (error) {
      toast.error("Failed to delete employee");
      console.error(error);
    }
  };

  // Meal Type operations
  const createMealType = (mealType: Omit<MealType, "id">) => {
    try {
      const newMealType = addMealType(mealType);
      setMealTypes([...getMealTypes()]);
      setDashboardStats(getDashboardStats());
      toast.success(`Meal type "${mealType.name}" created successfully`);
    } catch (error) {
      toast.error("Failed to create meal type");
      console.error(error);
    }
  };

  const updateMealTypeHandler = (mealType: MealType) => {
    try {
      const updatedMealType = updateMealType(mealType);
      if (updatedMealType) {
        setMealTypes([...getMealTypes()]);
        toast.success(`Meal type "${mealType.name}" updated successfully`);
      } else {
        toast.error("Meal type not found");
      }
    } catch (error) {
      toast.error("Failed to update meal type");
      console.error(error);
    }
  };

  const removeMealType = (id: number) => {
    try {
      const success = deleteMealType(id);
      if (success) {
        setMealTypes([...getMealTypes()]);
        setDashboardStats(getDashboardStats());
        toast.success("Meal type deleted successfully");
      } else {
        toast.error("Meal type not found");
      }
    } catch (error) {
      toast.error("Failed to delete meal type");
      console.error(error);
    }
  };

  const getMealTypesByAreaId = (areaId: number) => {
    return mealTypes.filter(mt => mt.areaId === areaId);
  };

  // Meal Rule operations
  const createMealRule = (mealRule: Omit<MealRule, "id">) => {
    try {
      const newMealRule = addMealRule(mealRule);
      setMealRules([...getMealRules()]);
      toast.success("Meal rule created successfully");
    } catch (error) {
      toast.error("Failed to create meal rule");
      console.error(error);
    }
  };

  const updateMealRuleHandler = (mealRule: MealRule) => {
    try {
      const updatedMealRule = updateMealRule(mealRule);
      if (updatedMealRule) {
        setMealRules([...getMealRules()]);
        toast.success("Meal rule updated successfully");
      } else {
        toast.error("Meal rule not found");
      }
    } catch (error) {
      toast.error("Failed to update meal rule");
      console.error(error);
    }
  };

  const removeMealRule = (id: number) => {
    try {
      const success = deleteMealRule(id);
      if (success) {
        setMealRules([...getMealRules()]);
        toast.success("Meal rule deleted successfully");
      } else {
        toast.error("Meal rule not found");
      }
    } catch (error) {
      toast.error("Failed to delete meal rule");
      console.error(error);
    }
  };

  const getMealRulesByAreaId = (areaId: number) => {
    return mealRules.filter(mr => mr.areaId === areaId);
  };

  // Meal Restriction operations
  const createMealRestriction = (mealRestriction: Omit<MealRestriction, "id">) => {
    try {
      const newMealRestriction = addMealRestriction(mealRestriction);
      setMealRestrictions([...getMealRestrictions()]);
      toast.success("Meal restriction created successfully");
    } catch (error) {
      toast.error("Failed to create meal restriction");
      console.error(error);
    }
  };

  const updateMealRestrictionHandler = (mealRestriction: MealRestriction) => {
    try {
      const updatedMealRestriction = updateMealRestriction(mealRestriction);
      if (updatedMealRestriction) {
        setMealRestrictions([...getMealRestrictions()]);
        toast.success("Meal restriction updated successfully");
      } else {
        toast.error("Meal restriction not found");
      }
    } catch (error) {
      toast.error("Failed to update meal restriction");
      console.error(error);
    }
  };

  const removeMealRestriction = (id: number) => {
    try {
      const success = deleteMealRestriction(id);
      if (success) {
        setMealRestrictions([...getMealRestrictions()]);
        toast.success("Meal restriction deleted successfully");
      } else {
        toast.error("Meal restriction not found");
      }
    } catch (error) {
      toast.error("Failed to delete meal restriction");
      console.error(error);
    }
  };

  const getMealRestrictionsByAreaId = (areaId: number) => {
    return mealRestrictions.filter(mr => mr.areaId === areaId);
  };

  const value = {
    areas,
    departments,
    employees,
    mealTypes,
    mealRules,
    mealRestrictions,
    dashboardStats,
    
    createArea,
    updateArea: updateAreaHandler,
    removeArea,
    
    createDepartment,
    updateDepartment: updateDepartmentHandler,
    removeDepartment,
    
    createEmployee,
    updateEmployee: updateEmployeeHandler,
    removeEmployee,
    
    createMealType,
    updateMealType: updateMealTypeHandler,
    removeMealType,
    getMealTypesByAreaId,
    
    createMealRule,
    updateMealRule: updateMealRuleHandler,
    removeMealRule,
    getMealRulesByAreaId,
    
    createMealRestriction,
    updateMealRestriction: updateMealRestrictionHandler,
    removeMealRestriction,
    getMealRestrictionsByAreaId,
    
    refreshData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
