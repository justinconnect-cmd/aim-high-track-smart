import { motion } from "framer-motion";
import { Users, Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import StatCard from "@/components/StatCard";
import GoalStatusBadge from "@/components/GoalStatusBadge";
import { getVisibleEmployees, goals, getUserById, getTeamLeadsUnder, type User } from "@/data/mockData";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AEDashboard from "./AEDashboard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function TeamSection({ teamLead, employees }: { teamLead: User; employees: User[] }) {
  const teamGoals = employees.flatMap(e => goals.filter(g => g.assignedTo === e.id));
  const activeGoals = teamGoals.filter(g => g.status === 'active');
  const overdueGoals = teamGoals.filter(g => g.status === 'overdue');
  const completedGoals = teamGoals.filter(g => g.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="AEs" value={employees.length} icon={Users} />
        <StatCard title="Active Goals" value={activeGoals.length} icon={Target} variant="accent" />
        <StatCard title="Overdue" value={overdueGoals.length} icon={AlertTriangle} variant="warning" />
        <StatCard title="Completed" value={completedGoals.length} icon={CheckCircle2} variant="success" />
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="font-heading font-semibold text-foreground">Goals — Team {teamLead.teamName}</h2>
        </div>
        <div className="divide-y divide-border">
          {teamGoals.length === 0 && (
            <p className="p-6 text-center text-muted-foreground">No goals for this team yet</p>
          )}
          {teamGoals.map((goal) => {
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

export default function Dashboard() {
  const { currentUser } = useAuth();

  if (currentUser.role === 'employee') {
    return <AEDashboard />;
  }

  const isGroupLead = currentUser.role === 'group_lead' || currentUser.role === 'top_level';
  const visibleEmployees = getVisibleEmployees(currentUser.id);
  const teamLeads = isGroupLead ? getTeamLeadsUnder(currentUser.id) : [];

  // Overall stats
  const allGoals = visibleEmployees.flatMap(e => goals.filter(g => g.assignedTo === e.id));
  const activeGoals = allGoals.filter(g => g.status === 'active');
  const overdueGoals = allGoals.filter(g => g.status === 'overdue');
  const completedGoals = allGoals.filter(g => g.status === 'completed');

  const roleLabel = isGroupLead ? 'Group Overview' : `Team ${currentUser.teamName} Overview`;

  // For group leads: build per-team data
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
            <div className="space-y-6">
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
                  {allGoals.slice(0, 8).map((goal) => {
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
          </TabsContent>

          {teamData.map(({ teamLead, employees }) => (
            <TabsContent key={teamLead.id} value={teamLead.id}>
              <TeamSection teamLead={teamLead} employees={employees} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        /* Team Lead view — single team, no tabs needed */
        <div className="space-y-6">
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
      )}
    </div>
  );
}
