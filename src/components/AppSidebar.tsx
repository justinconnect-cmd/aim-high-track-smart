import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Table2, UserCircle, PlusCircle, Settings } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/board", icon: Table2, label: "Table Board" },
  { to: "/employees", icon: UserCircle, label: "Employees" },
  { to: "/goals/new", icon: PlusCircle, label: "New Goal" },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground min-h-screen">
      <div className="p-6">
        <h1 className="font-heading text-xl font-bold text-sidebar-primary-foreground tracking-tight">
          <span className="text-sidebar-primary">Goal</span>Track
        </h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1">Team Performance Hub</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-sidebar-accent rounded-lg"
                  transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                />
              )}
              <item.icon className={`relative z-10 w-5 h-5 ${isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/60'}`} />
              <span className={`relative z-10 ${isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 mx-3 mb-4 rounded-lg bg-sidebar-accent">
        <p className="text-xs text-sidebar-foreground/60">Logged in as</p>
        <p className="text-sm font-semibold text-sidebar-accent-foreground">Maya Ben-Ari</p>
        <p className="text-xs text-sidebar-foreground/50">Team Lead · Alpha</p>
      </div>
    </aside>
  );
}
