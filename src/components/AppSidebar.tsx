import { NavLink, useLocation } from "react-router-dom";
import connecteamLogo from "@/assets/connecteam-logo.png";
import { LayoutDashboard, Table2, UserCircle, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { users } from "@/data/mockData";

export default function AppSidebar() {
  const location = useLocation();
  const { currentUser, setCurrentUserId } = useAuth();
  const isEmployee = currentUser.role === 'employee';

  // Role labels
  const roleLabel = {
    top_level: 'Top Level',
    group_lead: 'Group Lead',
    team_lead: 'Team Lead',
    employee: 'AE',
  }[currentUser.role];

  // Nav items based on role
  const navItems = isEmployee
    ? [
        { to: "/", icon: LayoutDashboard, label: "My Goals" },
      ]
    : [
        { to: "/", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/board", icon: Table2, label: "Table Board" },
        { to: "/employees", icon: UserCircle, label: "Employees" },
        { to: "/goals/new", icon: PlusCircle, label: "New Goal" },
      ];

  // Demo role switcher options
  const switchableUsers = [
    { id: 'g1', label: 'Sarah (Group Lead)' },
    { id: 't1', label: 'Maya (Team Lead)' },
    { id: 'e1', label: 'Tal (AE)' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground min-h-screen">
      <div className="p-6">
        <img src={connecteamLogo} alt="Connecteam" className="h-7 w-auto" />
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

      {/* Role switcher for demo */}
      <div className="px-3 mb-2">
        <label className="block text-xs text-sidebar-foreground/50 mb-1 px-1">Switch View</label>
        <select
          value={currentUser.id}
          onChange={e => setCurrentUserId(e.target.value)}
          className="w-full rounded-lg border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground text-sm px-3 py-2 focus:outline-none"
        >
          {switchableUsers.map(u => (
            <option key={u.id} value={u.id}>{u.label}</option>
          ))}
        </select>
      </div>

      <div className="p-4 mx-3 mb-4 rounded-lg bg-sidebar-accent">
        <p className="text-xs text-sidebar-foreground/60">Logged in as</p>
        <p className="text-sm font-semibold text-sidebar-accent-foreground">{currentUser.name}</p>
        <p className="text-xs text-sidebar-foreground/50">{roleLabel}{currentUser.teamName ? ` · ${currentUser.teamName}` : ''}</p>
      </div>
    </aside>
  );
}
