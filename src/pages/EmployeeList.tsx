import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, UserPlus } from "lucide-react";
import { getActiveGoals, getVisibleEmployees, users, User, UserRole } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

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

export default function EmployeeList() {
  const { currentUser } = useAuth();
  const employees = getVisibleEmployees(currentUser.id);
  const canAdd = ['top_level', 'group_lead', 'team_lead'].includes(currentUser.role);
  const availableRoles = getRoleOptionsForUser(currentUser.role);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [segment, setSegment] = useState<'11-50' | '51-100' | ''>('');

  const handleAdd = () => {
    if (!name.trim() || !role) {
      toast.error("Please fill in name and role.");
      return;
    }
    const initials = name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      avatar: initials,
      role: role as UserRole,
      managerId: currentUser.id,
      ...(role === 'employee' && segment ? { segment: segment as '11-50' | '51-100' } : {}),
      ...(currentUser.teamName ? { teamName: currentUser.teamName } : {}),
    };
    users.push(newUser);
    toast.success(`${newUser.name} added as ${availableRoles.find(r => r.value === role)?.label}`);
    setName('');
    setRole('');
    setSegment('');
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">My Team</h1>
          <p className="text-muted-foreground mt-1">Click on an employee to view their profile</p>
        </div>
        {canAdd && (
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
                {role === 'employee' && (
                  <div className="space-y-2">
                    <Label>Segment</Label>
                    <Select value={segment} onValueChange={(v) => setSegment(v as '11-50' | '51-100')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select segment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-100">51-100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAdd}>Add Employee</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      <div className="grid gap-3">
        {employees.map((emp, i) => {
          const active = getActiveGoals(emp.id);
          const overdueCount = active.filter(g => g.status === 'overdue').length;
          return (
            <motion.div key={emp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
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
