import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, UserPlus, ArrowLeft, Users } from "lucide-react";
import { getActiveGoals, getVisibleEmployees, getTeamLeadsUnder, getDirectReports, users, User, UserRole } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'group_lead', label: 'Group Lead' },
  { value: 'team_lead', label: 'Team Lead' },
  { value: 'employee', label: 'AE' },
];

function getRoleOptionsForUser(currentRole: UserRole) {
  if (currentRole === 'top_level') return roleOptions;
  if (currentRole === 'group_lead') return roleOptions.filter(r => r.value === 'team_lead' || r.value === 'employee');
  if (currentRole === 'team_lead') return roleOptions.filter(r => r.value === 'employee');
  return [];
}

function AddEmployeeDialog({ currentUser }: { currentUser: { role: UserRole; teamName: string | null } }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [saving, setSaving] = useState(false);
  const availableRoles = getRoleOptionsForUser(currentUser.role);

  const handleAdd = async () => {
    if (!name.trim() || !email.trim() || !role) {
      toast.error("Please fill in name, email, and role.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await supabase.functions.invoke("create-user", {
        body: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          team_name: currentUser.teamName,
        },
      });

      if (res.error || res.data?.error) {
        toast.error(res.data?.error || res.error?.message || "Failed to add user");
        setSaving(false);
        return;
      }

      toast.success(`${name.trim()} added as ${availableRoles.find(r => r.value === role)?.label}`);
      setName('');
      setEmail('');
      setRole('');
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="emp-name">Full Name</Label>
            <Input id="emp-name" placeholder="e.g. John Smith" value={name} onChange={e => setName(e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-email">Email Address</Label>
            <Input id="emp-email" type="email" placeholder="e.g. john@company.com" value={email} onChange={e => setEmail(e.target.value)} maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAdd} disabled={saving}>
            {saving ? "Adding..." : "Add Employee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function EmployeeList() {
  const { currentUser } = useAuth();

  const [selectedTeamLead, setSelectedTeamLead] = useState<User | null>(null);

  if (!currentUser) return null;

  const mockProxy = users.find(u => u.role === currentUser.role && u.teamName === currentUser.teamName) || users.find(u => u.role === currentUser.role) || users[0];
  const isGroupLead = currentUser.role === 'group_lead' || currentUser.role === 'top_level';
  const canAdd = ['top_level', 'group_lead', 'team_lead'].includes(currentUser.role);

  const teamLeads = isGroupLead ? getTeamLeadsUnder(mockProxy.id) : [];
  const employees = isGroupLead
    ? (selectedTeamLead ? getDirectReports(selectedTeamLead.id) : [])
    : getVisibleEmployees(mockProxy.id);

  if (isGroupLead && !selectedTeamLead) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">My Teams</h1>
            <p className="text-muted-foreground mt-1">Select a team lead to view their AEs</p>
          </div>
          {canAdd && <AddEmployeeDialog currentUser={currentUser} />}
        </motion.div>

        <div className="grid gap-3">
          {teamLeads.map((tl, i) => {
            const aes = getDirectReports(tl.id);
            const allGoals = aes.flatMap(ae => getActiveGoals(ae.id));
            const overdueCount = allGoals.filter(g => g.status === 'overdue').length;
            return (
              <motion.div key={tl.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <button
                  onClick={() => setSelectedTeamLead(tl)}
                  className="w-full flex items-center justify-between bg-card rounded-xl border border-border p-4 hover:border-accent/40 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground">
                      {tl.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{tl.name}</p>
                      <p className="text-xs text-muted-foreground">
                        <Users className="w-3 h-3 inline mr-1" />
                        {tl.teamName && <span className="mr-1">Team {tl.teamName} ·</span>}
                        {aes.length} AE{aes.length !== 1 ? 's' : ''}
                        {overdueCount > 0 && <span className="text-destructive ml-1">· {overdueCount} overdue</span>}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          {selectedTeamLead && (
            <button
              onClick={() => setSelectedTeamLead(null)}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Teams
            </button>
          )}
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {selectedTeamLead ? `Team ${selectedTeamLead.teamName}` : 'My Team'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {selectedTeamLead
              ? `${selectedTeamLead.name}'s AEs`
              : 'Click on an employee to view their profile'}
          </p>
        </div>
        {canAdd && <AddEmployeeDialog mockUser={mockProxy} />}
      </motion.div>

      <div className="grid gap-3">
        {employees.map((emp, i) => {
          const active = getActiveGoals(emp.id);
          const overdueCount = active.filter(g => g.status === 'overdue').length;
          return (
            <motion.div key={emp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link
                to={`/employees/${emp.id}`}
                state={{ from: '/employees' }}
                className="flex items-center justify-between bg-card rounded-xl border border-border p-4 hover:border-accent/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {emp.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {emp.segment && <span className="mr-1">{emp.segment} ·</span>}
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
