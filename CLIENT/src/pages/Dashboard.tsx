import React from "react";
import { useAppContext } from "@/context/AppContext";
import StatsCard from "@/components/common/StatsCard";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Coffee, Layers } from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ChartContainer, 
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const Dashboard: React.FC = () => {
  // Static data for dashboard
  const dashboardStats = {
    totalEmployees: 245,
    totalAreas: 5,
    totalMealTypes: 12,
    totalDepartments: 8
  };

  // Static data for areas
  const areas = [
    { id: 1, name: "Main Cafeteria" },
    { id: 2, name: "Executive Dining" },
    { id: 3, name: "Staff Lounge" },
    { id: 4, name: "Outdoor Area" },
    { id: 5, name: "VIP Section" }
  ];

  // Static data for meal rules
  const mealRules = [
    { id: 1, areaId: 1, name: "Standard Access" },
    { id: 2, areaId: 1, name: "Extended Hours" },
    { id: 3, areaId: 2, name: "Executive Only" },
    { id: 4, areaId: 3, name: "Staff Only" },
    { id: 5, areaId: 4, name: "Weekend Access" },
    { id: 6, areaId: 5, name: "VIP Access" },
    { id: 7, areaId: 1, name: "Holiday Special" },
    { id: 8, areaId: 2, name: "Board Meeting" }
  ];

  // Static data for meal types
  const mealTypes = [
    { id: 1, areaId: 1, name: "Breakfast" },
    { id: 2, areaId: 1, name: "Lunch" },
    { id: 3, areaId: 1, name: "Dinner" },
    { id: 4, areaId: 2, name: "Executive Breakfast" },
    { id: 5, areaId: 2, name: "Executive Lunch" },
    { id: 6, areaId: 3, name: "Staff Breakfast" },
    { id: 7, areaId: 3, name: "Staff Lunch" },
    { id: 8, areaId: 4, name: "Outdoor BBQ" },
    { id: 9, areaId: 4, name: "Picnic Lunch" },
    { id: 10, areaId: 5, name: "VIP Breakfast" },
    { id: 11, areaId: 5, name: "VIP Lunch" },
    { id: 12, areaId: 5, name: "VIP Dinner" }
  ];

  // Static data for departments
  const departments = [
    { id: 1, name: "Engineering" },
    { id: 2, name: "Marketing" },
    { id: 3, name: "Sales" },
    { id: 4, name: "HR" },
    { id: 5, name: "Finance" },
    { id: 6, name: "Operations" },
    { id: 7, name: "Executive" },
    { id: 8, name: "Customer Support" }
  ];

  // Static data for employees
  const employees = [
    { id: 1, name: "John Doe", department: "Engineering" },
    { id: 2, name: "Jane Smith", department: "Marketing" },
    { id: 3, name: "Bob Johnson", department: "Sales" },
    // ... more employees would be here in a real scenario
  ];

  // Data preparation for area distribution pie chart
  const areaData = areas.map(area => ({
    name: area.name,
    value: mealRules.filter(rule => rule.areaId === area.id).length
  }));

  // Data preparation for meal types by area
  const mealTypesByArea = areas.map(area => {
    const count = mealTypes.filter(mt => mt.areaId === area.id).length;
    return {
      name: area.name,
      mealTypes: count
    };
  });

  // Data preparation for employee department distribution
  const departmentData = departments.map(dept => ({
    name: dept.name,
    employees: dept.name === "Engineering" ? 78 :
               dept.name === "Marketing" ? 45 :
               dept.name === "Sales" ? 36 :
               dept.name === "HR" ? 12 :
               dept.name === "Finance" ? 18 :
               dept.name === "Operations" ? 24 :
               dept.name === "Executive" ? 8 :
               dept.name === "Customer Support" ? 24 : 0
  }));

  // Recent activity data
  const recentActivity = [
    { id: 1, employee: "John Doe", area: "Main Cafeteria", mealType: "Lunch", time: "12:30 PM", date: "2023-06-15" },
    { id: 2, employee: "Jane Smith", area: "Executive Dining", mealType: "Breakfast", time: "08:15 AM", date: "2023-06-15" },
    { id: 3, employee: "Bob Johnson", area: "Staff Lounge", mealType: "Lunch", time: "01:00 PM", date: "2023-06-15" },
    { id: 4, employee: "Alice Brown", area: "Main Cafeteria", mealType: "Dinner", time: "06:45 PM", date: "2023-06-14" },
    { id: 5, employee: "Charlie Wilson", area: "VIP Section", mealType: "Lunch", time: "12:00 PM", date: "2023-06-14" },
  ];

  // COLORS for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#1EAEDB'];

  return (
    <div>
      <PageHeader
        title="Meal Management Dashboard"
        description="Overview of your meal management system"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard 
          title="Total Employees"
          value={dashboardStats.totalEmployees}
          icon={<Users className="h-6 w-6" />}
          description="Active employees in system"
        />
        <StatsCard 
          title="Dining Areas"
          value={dashboardStats.totalAreas}
          icon={<Building2 className="h-6 w-6" />}
          description="Available dining locations"
        />
        <StatsCard 
          title="Meal Types"
          value={dashboardStats.totalMealTypes}
          icon={<Coffee className="h-6 w-6" />}
          description="Different meal options"
        />
        <StatsCard 
          title="Departments"
          value={dashboardStats.totalDepartments}
          icon={<Layers className="h-6 w-6" />}
          description="Company departments"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Area Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={areaData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {areaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meal Types by Area</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mealTypesByArea}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="mealTypes" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Distribution by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="employees" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.employee}</TableCell>
                    <TableCell>{activity.area}</TableCell>
                    <TableCell>{activity.mealType}</TableCell>
                    <TableCell>{activity.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
