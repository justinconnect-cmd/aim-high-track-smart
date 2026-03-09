import { motion } from "framer-motion";
import { useState } from "react";
import { getVisibleEmployees } from "@/data/mockData";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function GoalEntry() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const employees = getVisibleEmployees(currentUser.id);

  const [form, setForm] = useState({
    assignedTo: '',
    category: '',
    title: '',
    description: '',
    gamePlan: '',
    deadline: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assignedTo || !form.title || !form.deadline) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Goal created successfully!");
    navigate("/board");
  };

  const inputClasses = "w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors";

  return (
    <div className="max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-heading font-bold text-foreground">Create Goal</h1>
        <p className="text-muted-foreground mt-1">Assign a new goal to an AE</p>
      </motion.div>

      <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Assign to *</label>
          <select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} className={inputClasses}>
            <option value="">Select AE...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}{emp.segment ? ` (${emp.segment})` : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Goal Category *</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputClasses}>
            <option value="">Select category...</option>
            <option value="call_coaching">Call Coaching</option>
            <option value="pipe_management">Pipe Management</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Goal Title *</label>
          <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Complete Q1 Sales Report" className={inputClasses} />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the goal..." rows={3} className={inputClasses} />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Game Plan</label>
          <textarea value={form.gamePlan} onChange={e => setForm(f => ({ ...f, gamePlan: e.target.value }))} placeholder="Steps to achieve this goal..." rows={4} className={inputClasses} />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Deadline *</label>
          <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className={inputClasses} />
        </div>

        <button type="submit" className="w-full py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
          Create Goal
        </button>
      </motion.form>
    </div>
  );
}
