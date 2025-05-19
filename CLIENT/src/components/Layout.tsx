
import React, { ReactNode } from "react";
import  {useEffect, useState} from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, Users, Coffee, CalendarClock, Settings, ChevronRight ,FileSpreadsheet,UserCog ,Tablet} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  SidebarRail
} from "@/components/ui/sidebar";

interface LayoutProps {
  children: ReactNode;
}

interface NavLink {
  to?: string;
  label: string;
  icon: React.ReactNode;
  children?: NavLink[];
}


const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };
  


  const navLinks: NavLink[] = [
    { to: "/", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { to: "/areas", label: "Areas", icon: <Building2 className="h-5 w-5" /> },
    { to: "/devices", label: "Devices", icon: <Tablet className="h-5 w-5" /> },
    { to: "/departments", label: "Departments", icon: <Users className="h-5 w-5" /> },
    { to: "/employees", label: "Employees", icon: <Users className="h-5 w-5" /> },
    { to: "/meal-types", label: "Meal Types", icon: <Coffee className="h-5 w-5" /> },
    { to: "/meal-rules", label: "Meal Rules", icon: <CalendarClock className="h-5 w-5" /> },
    { to: "/users", label: "Users", icon: <UserCog className="h-5 w-5" /> },

    { to: "/meal-restrictions", label: "Meal Restrictions", icon: <Settings className="h-5 w-5" /> },
    {
      label: "Reports",
      icon: <FileSpreadsheet className="h-5 w-5" />,
      children: [
        { to: "/meal-history", label: "Meal History", icon: <ChevronRight className="h-4 w-4" /> },
        { to: "/meal-usage", label: "Meal Usage", icon: <ChevronRight className="h-4 w-4" /> },
      ]
    }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center px-4 py-4">
              <h1 className="text-xl font-bold text-primary-blue">Meal Manager</h1>
            </div>
            <SidebarSeparator />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-2">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                {navLinks.map((link) => (
  <SidebarMenuItem key={link.label}>
    {link.children ? (
      <>
        <SidebarMenuButton
          tooltip={link.label}
          size="lg"
          isActive={link.children.some((child) => location.pathname === child.to)}
          onClick={() => toggleMenu(link.label)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              {link.icon}
              <span className="ml-2 font-medium">{link.label}</span>
            </div>
            <ChevronRight
              className={`h-4 w-4 transition-transform ${
                openMenus[link.label] ? "rotate-90 text-primary-blue" : ""
              }`}
            />
          </div>
        </SidebarMenuButton>
        {openMenus[link.label] && (
          <div className="ml-6 mt-1 space-y-1">
            {link.children.map((child) => (
              <SidebarMenuButton
                asChild
                key={child.to}
                tooltip={child.label}
                isActive={location.pathname === child.to}
                size="sm"
              >
                <Link to={child.to!} className="flex items-center">
                  {child.icon}
                  <span className="ml-2">{child.label}</span>
                </Link>
              </SidebarMenuButton>
            ))}
          </div>
        )}
      </>
    ) : (
      <SidebarMenuButton
        asChild
        tooltip={link.label}
        isActive={location.pathname === link.to}
        size="lg"
      >
        <Link to={link.to!} className="flex items-center justify-between w-full">
          <div className="flex items-center">
            {link.icon}
            <span className="ml-2 font-medium">{link.label}</span>
          </div>
          {location.pathname === link.to && (
            <ChevronRight className="h-4 w-4 text-primary-blue" />
          )}
        </Link>
      </SidebarMenuButton>
    )}
  </SidebarMenuItem>
))}

                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
        
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 py-8 px-4 md:px-6 lg:px-8 container mx-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
