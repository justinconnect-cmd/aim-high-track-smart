import { motion } from "framer-motion";
import { Users, Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import StatCard from "@/components/StatCard";
import GoalStatusBadge from "@/components/GoalStatusBadge";
import { getVisibleEmployees, goals, getUserById, getTeamLeadsUnder, type User, type Segment } from "@/data/mockData";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AEDashboard from "./AEDashboard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function GoalTable({ employees, isGroupLead, teamLeads, statusFilter, setStatusFilter }: { employees: User[]; isGroupLead: boolean; teamLeads: User[]; statusFilter: 'all' | 'active' | 'overdue' | 'completed'; setStatusFilter: (f: 'all' | 'active' | 'overdue' | 'completed') => void }) {
  const [segmentFilter, setSegmentFilter] = useState<'all' | Segment>('all');
  const [teamLeadFilter, setTeamLeadFilter] = useState<string>('all');

  const rows = employees.map(emp => {
    const empGoals = goals.filter(g => g.assignedTo === emp.id);
    const currentGoal = empGoals.find(g => g.status === 'active') || empGoals.find(g => g.status === 'overdue');
    return { emp, currentGoal, allGoals: empGoals };
  });

  const filteredRows = rows
    .filter(r => statusFilter === 'all' || r.currentGoal?.status === statusFilter)
    .filter(r => segmentFilter === 'all' || r.emp.segment === segmentFilter)
    .filter(r => teamLeadFilter === 'all' || r.emp.managerId === teamLeadFilter);

  const selectClasses = "px-3 py-1.5 rounded-lg text-sm border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50";

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex gap-2">
          {(['all', 'active', 'overdue', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {isGroupLead && (
          <div className="flex gap-2 ml-auto">
            <select value={segmentFilter} onChange={e => setSegmentFilter(e.target.value as 'all' | Segment)} className={selectClasses}>
              <option value="all">All Segments</option>
              <option value="11-50">11-50</option>
              <option value="51-100">51-100</option>
            </select>
            <select value={teamLeadFilter} onChange={e => setTeamLeadFilter(e.target.value)} className={selectClasses}>
              <option value="all">All Team Leads</option>
              {teamLeads.map(tl => (
                <option key={tl.id} value={tl.id}>{tl.name} ({tl.teamName})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-semibold text-foreground">AE</th>
                {isGroupLead && <th className="text-left p-4 font-semibold text-foreground">Team Lead</th>}
                <th className="text-left p-4 font-semibold text-foreground">Segment</th>
                <th className="text-left p-4 font-semibold text-foreground">Current Goal</th>
                <th className="text-left p-4 font-semibold text-foreground">Deadline</th>
                <th className="text-left p-4 font-semibold text-foreground">Status</th>
                <th className="text-left p-4 font-semibold text-foreground">AE ✓</th>
                <th className="text-left p-4 font-semibold text-foreground">Lead ✓</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(({ emp, currentGoal }) => {
                const teamLead = emp.managerId ? getUserById(emp.managerId) : null;
                return (
                  <tr key={emp.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${currentGoal?.status === 'overdue' ? 'bg-destructive/5' : ''}`}>
                    <td className="p-4">
                      <Link to={`/employees/${emp.id}`} state={{ from: '/' }} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">{emp.avatar}</div>
                        <div>
                          <p className="font-medium text-foreground">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.teamName}</p>
                        </div>
                      </Link>
                    </td>
                    {isGroupLead && <td className="p-4 text-foreground">{teamLead?.name ?? '—'}</td>}
                    <td className="p-4">
                      {emp.segment ? (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">{emp.segment}</span>
                      ) : '—'}
                    </td>
                    <td className="p-4">
                      {currentGoal ? (
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">{currentGoal.title}</span>
                          {currentGoal.status === 'overdue' && <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />}
                        </div>
                      ) : <span className="text-muted-foreground italic">No active goal</span>}
                    </td>
                    <td className={`p-4 font-medium ${currentGoal?.status === 'overdue' ? 'text-destructive' : currentGoal?.status === 'completed' ? 'text-success' : 'text-muted-foreground'}`}>
                      {currentGoal?.deadline ?? '—'}
                    </td>
                    <td className="p-4">{currentGoal ? <GoalStatusBadge status={currentGoal.status} /> : '—'}</td>
                    <td className="p-4">{currentGoal?.completedByEmployee ? '✅' : '⬜'}</td>
                    <td className="p-4">{currentGoal?.completedByLead ? '✅' : '⬜'}</td>
                  </tr>
                );
              })}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={isGroupLead ? 8 : 7} className="p-8 text-center text-muted-foreground">No results match your filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TeamDashboard({ teamLead, employees, isGroupLead, teamLeads }: { teamLead?: User; employees: User[]; isGroupLead: boolean; teamLeads: User[] }) {
  const teamGoals = employees.flatMap(e => goals.filter(g => g.assignedTo === e.id));
  const activeGoals = teamGoals.filter(g => g.status === 'active');
  const overdueGoals = teamGoals.filter(g => g.status === 'overdue');
  const completedGoals = teamGoals.filter(g => g.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="AEs" value={employees.length} icon={Users} />
        <StatCard title="Active Goals" value={activeGoals.length} icon={Target} variant="info" />
        <StatCard title="Overdue" value={overdueGoals.length} icon={AlertTriangle} variant="warning" />
        <StatCard title="Completed" value={completedGoals.length} icon={CheckCircle2} variant="success" />
      </div>
      <GoalTable employees={employees} isGroupLead={isGroupLead} teamLeads={teamLeads} />
    </div>
  );
}

export default function Dashboard() {
  const { currentUser } = useAuth();

  if (currentUser.role === 'employee') {
    return <AEDashboard />;
  }

  const isGroupLead = currentUser.role === 'group_lead' || currentUser.role === 'top_level';
  const visibleEmployees = getVisibleEmployees(currentUser.id);
  const teamLeads = isGroupLead ? getTeamLeadsUnder(currentUser.id) : [];

  const roleLabel = isGroupLead ? 'Group Overview' : `Team ${currentUser.teamName} Overview`;

  const teamData = teamLeads.map(tl => ({
    teamLead: tl,
    employees: visibleEmployees.filter(e => e.managerId === tl.id),
  }));

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">{roleLabel}</p>
      </motion.div>

      {isGroupLead && teamData.length > 0 ? (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Teams</TabsTrigger>
            {teamData.map(({ teamLead }) => (
              <TabsTrigger key={teamLead.id} value={teamLead.id}>
                Team {teamLead.teamName}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <TeamDashboard employees={visibleEmployees} isGroupLead={isGroupLead} teamLeads={teamLeads} />
          </TabsContent>

          {teamData.map(({ teamLead, employees }) => (
            <TabsContent key={teamLead.id} value={teamLead.id}>
              <TeamDashboard teamLead={teamLead} employees={employees} isGroupLead={false} teamLeads={[]} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <TeamDashboard employees={visibleEmployees} isGroupLead={false} teamLeads={[]} />
      )}
    </div>
  );
}
