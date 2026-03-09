import { motion } from "framer-motion";
import { Users, Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import StatCard from "@/components/StatCard";
import GoalStatusBadge from "@/components/GoalStatusBadge";
import { getVisibleEmployees, goals, getUserById } from "@/data/mockData";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AEDashboard from "./AEDashboard";

export default function Dashboard() {
  const { currentUser } = useAuth();

  // AEs get their own dashboard
  if (currentUser.role === 'employee') {
    return <AEDashboard />;
  }

  const visibleEmployees = getVisibleEmployees(currentUser.id);
  const allGoals = visibleEmployees.flatMap(e => goals.filter(g => g.assignedTo === e.id));
  const activeGoals = allGoals.filter(g => g.status === 'active');
  const overdueGoals = allGoals.filter(g => g.status === 'overdue');
  const completedGoals = allGoals.filter(g => g.status === 'completed');

  const roleLabel = currentUser.role === 'group_lead' ? 'Group Overview' :
    `Team ${currentUser.teamName} · Smart Group Overview`;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">{roleLabel}</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="AEs" value={visibleEmployees.length} icon={Users} />
        <StatCard title="Active Goals" value={activeGoals.length} icon={Target} variant="accent" />
        <StatCard title="Overdue" value={overdueGoals.length} icon={AlertTriangle} variant="warning" />
        <StatCard title="Completed" value={completedGoals.length} icon={CheckCircle2} variant="success" />
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="font-heading font-semibold text-foreground">Recent Goals</h2>
        </div>
        <div className="divide-y divide-border">
          {allGoals.slice(0, 6).map((goal) => {
            const employee = getUserById(goal.assignedTo);
            return (
              <Link
                key={goal.id}
                to={`/employees/${goal.assignedTo}`}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                    {employee?.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">{employee?.name} · Due {goal.deadline}</p>
                  </div>
                </div>
                <GoalStatusBadge status={goal.status} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
