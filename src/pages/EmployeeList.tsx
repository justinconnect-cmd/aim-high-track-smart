import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getDirectReports, getActiveGoals, getUserById } from "@/data/mockData";

const currentUserId = 't1';

export default function EmployeeList() {
  const directReports = getDirectReports(currentUserId);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-heading font-bold text-foreground">My Team</h1>
        <p className="text-muted-foreground mt-1">Click on an employee to view their profile</p>
      </motion.div>

      <div className="grid gap-3">
        {directReports.map((emp, i) => {
          const active = getActiveGoals(emp.id);
          const overdueCount = active.filter(g => g.status === 'overdue').length;
          return (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/employees/${emp.id}`}
                className="flex items-center justify-between bg-card rounded-xl border border-border p-4 hover:border-accent/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {emp.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {active.length} active goal{active.length !== 1 ? 's' : ''}
                      {overdueCount > 0 && <span className="text-destructive ml-1">· {overdueCount} overdue</span>}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
