
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AreasList from "./pages/Areas/AreasList";
import DepartmentsList from "./pages/Departments/DepartmentsList";
import EmployeesList from "./pages/Employees/EmployeesList";
import MealTypesList from "./pages/MealTypes/MealTypesList";
import MealRulesList from "./pages/MealRules/MealRulesList";
import MealRestrictionsList from "./pages/MealRestrictions/MealRestrictionsList";
import MealHistoryReport from "./pages/reports/MealHistoryReport";
import { AppProvider } from "./context/AppContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/areas" element={<AreasList />} />
              <Route path="/departments" element={<DepartmentsList />} />
              <Route path="/employees" element={<EmployeesList />} />
              <Route path="/meal-types" element={<MealTypesList />} />
              <Route path="/meal-rules" element={<MealRulesList />} />
              <Route path="/meal-restrictions" element={<MealRestrictionsList />} />
              <Route path="/meal-history" element={<MealHistoryReport />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
