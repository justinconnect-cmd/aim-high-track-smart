import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, UserCircle, PlusCircle, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function MobileNav() {
  const location = useLocation();
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const isEmployee = currentUser.role === 'employee';
  const isGroupLead = currentUser.role === 'group_lead' || currentUser.role === 'top_level';

  if (isEmployee) {
    return (
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border">
        <div className="flex justify-around py-2">
          <NavLink to="/" className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors ${location.pathname === '/' ? 'text-accent' : 'text-muted-foreground'}`}>
            <LayoutDashboard className="w-5 h-5" />
            My Goals
          </NavLink>
        </div>
      </nav>
    );
  }

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Home" },
    { to: "/employees", icon: isGroupLead ? Users : UserCircle, label: isGroupLead ? "Teams" : "Team" },
    { to: "/goals/new", icon: PlusCircle, label: "New" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors ${
                isActive ? 'text-accent' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
