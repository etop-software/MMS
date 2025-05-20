import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
import DeviceList from "./pages/Devices/DeviceList";
import Login from "./pages/Users/Login"; 
import ChangePassword from "./pages/Users/ChangePassword";
import { AppProvider } from "./context/AppContext";
import Users from "./pages/Users/UsersList";


const queryClient = new QueryClient();

const isAuthenticated = localStorage.getItem("token");

const ProtectedRoute = ({ element }) => {
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* <Route
              path="/"
              element={<ProtectedRoute element={<Navigate to="/dashboard" replace />} />}
            /> */}

            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<Layout><Dashboard /></Layout>} />}
            />
            <Route
              path="/users"
              element={<ProtectedRoute element={<Layout><Users /></Layout>} />}
            />
            <Route
              path="/areas"
              element={<ProtectedRoute element={<Layout><AreasList /></Layout>} />}
            />
            <Route
              path="/departments"
              element={<ProtectedRoute element={<Layout><DepartmentsList /></Layout>} />}
            />
            <Route
              path="/employees"
              element={<ProtectedRoute element={<Layout><EmployeesList /></Layout>} />}
            />
            <Route
              path="/meal-types"
              element={<ProtectedRoute element={<Layout><MealTypesList /></Layout>} />}
            />
            <Route
              path="/meal-rules"
              element={<ProtectedRoute element={<Layout><MealRulesList /></Layout>} />}
            />
            <Route
              path="/meal-restrictions"
              element={<ProtectedRoute element={<Layout><MealRestrictionsList /></Layout>} />}
            />
            <Route
              path="/meal-history"
              element={<ProtectedRoute element={<Layout><MealHistoryReport /></Layout>} />}
            />
            <Route
              path="/devices"
              element={<ProtectedRoute element={<Layout><DeviceList /></Layout>} />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
