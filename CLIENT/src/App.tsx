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

// Create a QueryClient instance for React Query
const queryClient = new QueryClient();

// ProtectedRoute component to ensure user is authenticated
const ProtectedRoute = ({ element }) => {
  // Check if the user has a valid token in localStorage
  const isAuthenticated = localStorage.getItem("token");

  // If the user is authenticated, render the passed element (child route)
  if (isAuthenticated) {
    return element;
  }

  // If not authenticated, redirect to login page
  return <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Login and Change Password Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}  // Default route to dashboard
            />
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<Layout><Dashboard /></Layout>} />}  // Protected route
            />
            <Route
              path="/users"
              element={<ProtectedRoute element={<Layout><Users /></Layout>} />}  // Protected route
            />
            <Route
              path="/areas"
              element={<ProtectedRoute element={<Layout><AreasList /></Layout>} />}  // Protected route
            />
            <Route
              path="/departments"
              element={<ProtectedRoute element={<Layout><DepartmentsList /></Layout>} />}  // Protected route
            />
            <Route
              path="/employees"
              element={<ProtectedRoute element={<Layout><EmployeesList /></Layout>} />}  // Protected route
            />
            <Route
              path="/meal-types"
              element={<ProtectedRoute element={<Layout><MealTypesList /></Layout>} />}  // Protected route
            />
            <Route
              path="/meal-rules"
              element={<ProtectedRoute element={<Layout><MealRulesList /></Layout>} />}  // Protected route
            />
            <Route
              path="/meal-restrictions"
              element={<ProtectedRoute element={<Layout><MealRestrictionsList /></Layout>} />}  // Protected route
            />
            <Route
              path="/meal-history"
              element={<ProtectedRoute element={<Layout><MealHistoryReport /></Layout>} />}  // Protected route
            />
            <Route
              path="/devices"
              element={<ProtectedRoute element={<Layout><DeviceList /></Layout>} />}  // Protected route
            />

            {/* Catch-all for undefined routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
