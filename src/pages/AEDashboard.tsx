import { motion } from "framer-motion";
import { Target, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import GoalStatusBadge from "@/components/GoalStatusBadge";
import StatCard from "@/components/StatCard";
import { getGoalsForUser } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";

export default function AEDashboard() {
  const { currentUser } = useAuth();
  const allGoals = getGoalsForUser(currentUser.id);
  const activeGoals = allGoals.filter(g => g.status === 'active');
  const overdueGoals = allGoals.filter(g => g.status === 'overdue');
  const completedGoals = allGoals.filter(g => g.status === 'completed');

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-heading font-bold text-foreground">My Goals</h1>
        <p className="text-muted-foreground mt-1">Your personal goal tracker</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Active Goals" value={activeGoals.length} icon={Target} variant="info" />
        <StatCard title="Overdue" value={overdueGoals.length} icon={AlertTriangle} variant="warning" />
        <StatCard title="Completed" value={completedGoals.length} icon={CheckCircle2} variant="success" />
      </div>

      {/* Active & Overdue */}
      {[...activeGoals, ...overdueGoals].length > 0 && (
        <div className="bg-card rounded-xl border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="font-heading font-semibold text-foreground">Current Goals</h2>
          </div>
          <div className="divide-y divide-border">
            {[...overdueGoals, ...activeGoals].map(goal => (
              <div key={goal.id} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground">{goal.title}</h3>
                    {goal.status === 'overdue' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3.5 h-3.5" /> Due {goal.deadline}</span>
                    <GoalStatusBadge status={goal.status} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {goal.category && (
                    <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium">
                      {goal.category === 'call_coaching' ? 'Call Coaching' : 'Pipe Management'}
                    </span>
                  )}
                </div>
                {goal.gamePlan && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-foreground mb-1">Game Plan</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-line">{goal.gamePlan}</p>
                  </div>
                )}
                <div className="flex gap-4 text-xs">
                  <span>My mark: {goal.completedByEmployee ? '✅' : '⬜'}</span>
                  <span>Lead mark: {goal.completedByLead ? '✅' : '⬜'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {completedGoals.length > 0 && (
        <div className="bg-card rounded-xl border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="font-heading font-semibold text-foreground">Completed Goals</h2>
          </div>
          <div className="divide-y divide-border">
            {completedGoals.map(goal => (
              <div key={goal.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{goal.title}</p>
                  <p className="text-xs text-muted-foreground">Completed · Due {goal.deadline}</p>
                </div>
                <GoalStatusBadge status={goal.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
