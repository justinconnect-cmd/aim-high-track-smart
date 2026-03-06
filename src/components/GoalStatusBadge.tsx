import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface GoalStatusBadgeProps {
  status: 'active' | 'completed' | 'overdue';
}

export default function GoalStatusBadge({ status }: GoalStatusBadgeProps) {
  if (status === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">
        <AlertTriangle className="w-3 h-3" />
        Overdue
      </span>
    );
  }
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success">
        <CheckCircle2 className="w-3 h-3" />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
      <Clock className="w-3 h-3" />
      Active
    </span>
  );
}
