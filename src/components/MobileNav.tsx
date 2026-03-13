import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, UserCircle, PlusCircle } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/employees", icon: UserCircle, label: "Team" },
  { to: "/goals/new", icon: PlusCircle, label: "New" },
];

export default function MobileNav() {
  const location = useLocation();

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
