import { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Target, CheckCircle2, PlusCircle } from "lucide-react";
import GoalStatusBadge from "@/components/GoalStatusBadge";
import { getUserById, getActiveGoals, getCompletedGoals, goals, Goal } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { currentUser } = useAuth();
  const backTo = (location.state as any)?.from || '/employees';
  const backLabel = backTo === '/' ? 'Back to Dashboard' : 'Back to Employees';
  const user = getUserById(id || '');
  const [, forceUpdate] = useState(0);

  // Lead comment dialog state
  const [commentDialogGoal, setCommentDialogGoal] = useState<Goal | null>(null);
  const [leadComment, setLeadComment] = useState('');
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', gamePlan: '', deadline: '', category: '' });

  const activeGoals = getActiveGoals(id || '');
  const completedGoals = getCompletedGoals(id || '');

  const isEmployee = currentUser.id === id;
  const isLead = currentUser.role === 'team_lead' || currentUser.role === 'group_lead' || currentUser.role === 'top_level';

  const handleEmployeeToggle = (goal: Goal) => {
    const g = goals.find(gl => gl.id === goal.id);
    if (!g) return;
    g.completedByEmployee = !g.completedByEmployee;
    forceUpdate(n => n + 1);
  };

  const handleLeadCheck = (goal: Goal) => {
    if (goal.completedByLead) {
      // Unchecking — remove completion
      const g = goals.find(gl => gl.id === goal.id);
      if (!g) return;
      g.completedByLead = false;
      g.leadComment = undefined;
      if (g.status === 'completed') g.status = 'active';
      forceUpdate(n => n + 1);
    } else {
      // Checking — open comment dialog
      setLeadComment('');
      setCommentDialogGoal(goal);
    }
  };

  const handleLeadConfirm = () => {
    if (!leadComment.trim()) {
      toast.error("Please add a comment before confirming.");
      return;
    }
    const g = goals.find(gl => gl.id === commentDialogGoal?.id);
    if (!g) return;
    g.completedByLead = true;
    g.leadComment = leadComment.trim();
    g.status = 'completed';
    toast.success(`"${g.title}" marked as completed!`);
    setCommentDialogGoal(null);
    setLeadComment('');
    forceUpdate(n => n + 1);
  };

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
                    <p className="text-xs text-muted-foreground mt-3">Due: {goal.deadline}</p>

                    {/* Completion checkboxes */}
                    <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30">
                      <p className="text-sm font-semibold text-foreground mb-3">Successfully completed the target</p>
                      <div className="flex flex-col gap-3">
                        <label className={`flex items-center gap-3 ${isEmployee ? 'cursor-pointer' : 'cursor-default'}`}>
                          <Checkbox
                            checked={goal.completedByEmployee}
                            onCheckedChange={() => handleEmployeeToggle(goal)}
                            disabled={!isEmployee}
                          />
                          <span className="text-sm text-foreground">
                            Employee confirmation
                            {goal.completedByEmployee && <CheckCircle2 className="w-4 h-4 text-success inline ml-1.5" />}
                          </span>
                        </label>
                        <label className={`flex items-center gap-3 ${isLead ? 'cursor-pointer' : 'cursor-default'}`}>
                          <Checkbox
                            checked={goal.completedByLead}
                            onCheckedChange={() => handleLeadCheck(goal)}
                            disabled={!isLead}
                          />
                          <span className="text-sm text-foreground">
                            Team Lead confirmation
                            {goal.completedByLead && <CheckCircle2 className="w-4 h-4 text-success inline ml-1.5" />}
                          </span>
                        </label>
                      </div>
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
                    {goal.leadComment && (
                      <div className="mt-2 p-2 rounded-md bg-muted/50">
                        <p className="text-xs font-medium text-muted-foreground">Lead comment:</p>
                        <p className="text-xs text-foreground">{goal.leadComment}</p>
                      </div>
                    )}
                  </div>
                  <GoalStatusBadge status={goal.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lead Comment Dialog */}
      <Dialog open={!!commentDialogGoal} onOpenChange={(open) => !open && setCommentDialogGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Goal Completion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You're confirming <span className="font-medium text-foreground">"{commentDialogGoal?.title}"</span> as completed. Please add a comment.
          </p>
          <div className="space-y-2">
            <Label htmlFor="lead-comment">Comment</Label>
            <Textarea
              id="lead-comment"
              placeholder="e.g. Great work, target achieved ahead of schedule..."
              value={leadComment}
              onChange={e => setLeadComment(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentDialogGoal(null)}>Cancel</Button>
            <Button onClick={handleLeadConfirm}>Confirm Completion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
