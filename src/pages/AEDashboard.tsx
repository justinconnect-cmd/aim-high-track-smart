import { useState } from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import GoalStatusBadge from "@/components/GoalStatusBadge";
import StatCard from "@/components/StatCard";
import { getGoalsForUser, goals, Goal, users } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";

function getMockProxy(role: string, teamName: string | null) {
  const byRoleAndTeam = users.find(u => u.role === role && u.teamName === teamName);
  if (byRoleAndTeam) return byRoleAndTeam;
  const byRole = users.find(u => u.role === role);
  if (byRole) return byRole;
  return users[0];
}

export default function AEDashboard() {
  const { currentUser } = useAuth();
  const [, forceUpdate] = useState(0);

  if (!currentUser) return null;

  // For AE dashboard, find a mock employee to show demo goals
  const mockProxy = getMockProxy('employee', currentUser.teamName);
  const allGoals = getGoalsForUser(mockProxy.id);
  const activeGoals = allGoals.filter(g => g.status === 'active');
  const overdueGoals = allGoals.filter(g => g.status === 'overdue');
  const completedGoals = allGoals.filter(g => g.status === 'completed');

  const handleEmployeeToggle = (goal: Goal) => {
    const g = goals.find(gl => gl.id === goal.id);
    if (!g) return;
    g.completedByEmployee = !g.completedByEmployee;
    forceUpdate(n => n + 1);
  };

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
                <div className="p-4 rounded-lg border border-border bg-muted/30">
                  <p className="text-sm font-semibold text-foreground mb-3">Successfully completed the target</p>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={goal.completedByEmployee}
                        onCheckedChange={() => handleEmployeeToggle(goal)}
                      />
                      <span className="text-sm text-foreground">
                        Employee confirmation
                        {goal.completedByEmployee && <CheckCircle2 className="w-4 h-4 text-success inline ml-1.5" />}
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-default">
                      <Checkbox
                        checked={goal.completedByLead}
                        disabled
                      />
                      <span className="text-sm text-foreground">
                        Team Lead confirmation
                        {goal.completedByLead && <CheckCircle2 className="w-4 h-4 text-success inline ml-1.5" />}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="bg-card rounded-xl border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="font-heading font-semibold text-foreground">Completed Goals</h2>
          </div>
          <div className="divide-y divide-border">
            {completedGoals.map(goal => (
              <div key={goal.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">Completed · Due {goal.deadline}</p>
                  </div>
                  <GoalStatusBadge status={goal.status} />
                </div>
                {goal.leadComment && (
                  <div className="mt-2 p-2 rounded-md bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground">Lead comment:</p>
                    <p className="text-xs text-foreground">{goal.leadComment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
