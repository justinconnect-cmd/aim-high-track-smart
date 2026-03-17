import { useParams, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Target, CheckCircle2 } from "lucide-react";
import GoalStatusBadge from "@/components/GoalStatusBadge";
import { getUserById, getActiveGoals, getCompletedGoals, getGoalsForUser } from "@/data/mockData";

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const backTo = (location.state as any)?.from || '/employees';
  const backLabel = backTo === '/' ? 'Back to Dashboard' : 'Back to Employees';
  const user = getUserById(id || '');
  const activeGoals = getActiveGoals(id || '');
  const completedGoals = getCompletedGoals(id || '');

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Employee not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link to={backTo} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> {backLabel}
      </Link>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
          {user.avatar}
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">{user.name}</h1>
          <p className="text-muted-foreground">{user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} · {user.teamName || 'Leadership'}</p>
        </div>
      </motion.div>

      {/* Active Goals */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-accent" />
          <h2 className="font-heading font-semibold text-foreground text-lg">Active Goals ({activeGoals.length})</h2>
        </div>
        {activeGoals.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-6 text-center text-muted-foreground">No active goals</div>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-xl border border-border p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                    <div className="mt-3 p-3 rounded-lg bg-muted/50">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Game Plan</p>
                      <p className="text-sm text-foreground whitespace-pre-line">{goal.gamePlan}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>Due: {goal.deadline}</span>
                      <span>Employee: {goal.completedByEmployee ? '✅' : '⬜'}</span>
                      <span>Lead: {goal.completedByLead ? '✅' : '⬜'}</span>
                    </div>
                  </div>
                  <GoalStatusBadge status={goal.status} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Historical Goals */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <h2 className="font-heading font-semibold text-foreground text-lg">Completed Goals ({completedGoals.length})</h2>
        </div>
        {completedGoals.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-6 text-center text-muted-foreground">No completed goals yet</div>
        ) : (
          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="bg-card rounded-xl border border-border p-5 opacity-75">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">Completed · Deadline was {goal.deadline}</p>
                  </div>
                  <GoalStatusBadge status={goal.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
