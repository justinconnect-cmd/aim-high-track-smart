export type UserRole = 'top_level' | 'group_lead' | 'team_lead' | 'employee';
export type Segment = '11-50' | '51-100';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  managerId?: string;
  teamName?: string;
  segment?: Segment;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  gamePlan: string;
  assignedTo: string;
  assignedBy: string;
  deadline: string;
  createdAt: string;
  completedByEmployee: boolean;
  completedByLead: boolean;
  status: 'active' | 'completed' | 'overdue';
  category?: 'call_coaching' | 'pipe_management';
  leadComment?: string;
}

export const users: User[] = [
  // Top Level
  { id: 'u1', name: 'Boneh', avatar: 'B', role: 'top_level' },
  { id: 'u2', name: 'Ori', avatar: 'O', role: 'top_level' },
  { id: 'u3', name: 'Justin', avatar: 'J', role: 'top_level' },

  // Group Leads
  { id: 'g1', name: 'Sarah Cohen', avatar: 'SC', role: 'group_lead', managerId: 'u1' },
  { id: 'g2', name: 'David Levi', avatar: 'DL', role: 'group_lead', managerId: 'u2' },

  // Team Leads under Sarah
  { id: 't1', name: 'Maya Ben-Ari', avatar: 'MB', role: 'team_lead', managerId: 'g1', teamName: 'Alpha' },
  { id: 't2', name: 'Noam Shapiro', avatar: 'NS', role: 'team_lead', managerId: 'g1', teamName: 'Beta' },

  // Team Leads under David
  { id: 't3', name: 'Lior Katz', avatar: 'LK', role: 'team_lead', managerId: 'g2', teamName: 'Gamma' },

  // AEs under Maya (Alpha) — segment 11-50
  { id: 'e1', name: 'Tal Avraham', avatar: 'TA', role: 'employee', managerId: 't1', teamName: 'Alpha', segment: '11-50' },
  { id: 'e2', name: 'Yael Mizrahi', avatar: 'YM', role: 'employee', managerId: 't1', teamName: 'Alpha', segment: '51-100' },
  { id: 'e3', name: 'Omer Peretz', avatar: 'OP', role: 'employee', managerId: 't1', teamName: 'Alpha', segment: '11-50' },

  // AEs under Noam (Beta)
  { id: 'e4', name: 'Noa Friedman', avatar: 'NF', role: 'employee', managerId: 't2', teamName: 'Beta', segment: '51-100' },
  { id: 'e5', name: 'Amir Goldstein', avatar: 'AG', role: 'employee', managerId: 't2', teamName: 'Beta', segment: '11-50' },

  // AEs under Lior (Gamma)
  { id: 'e6', name: 'Shira Rosen', avatar: 'SR', role: 'employee', managerId: 't3', teamName: 'Gamma', segment: '51-100' },
  { id: 'e7', name: 'Eyal Dayan', avatar: 'ED', role: 'employee', managerId: 't3', teamName: 'Gamma', segment: '11-50' },
  { id: 'e8', name: 'Dana Levy', avatar: 'DL', role: 'employee', managerId: 't3', teamName: 'Gamma', segment: '51-100' },
];

const today = new Date();
const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000).toISOString().split('T')[0];
const daysFromNow = (n: number) => new Date(today.getTime() + n * 86400000).toISOString().split('T')[0];

export const goals: Goal[] = [
  { id: 'go1', title: 'Complete Q1 Sales Report', description: 'Finalize all Q1 numbers and present to stakeholders', gamePlan: '1. Gather data from CRM\n2. Create pivot tables\n3. Build presentation deck', assignedTo: 'e1', assignedBy: 't1', deadline: daysFromNow(5), createdAt: daysAgo(3), completedByEmployee: false, completedByLead: false, status: 'active', category: 'pipe_management' },
  { id: 'go2', title: 'Onboard 3 new clients', description: 'Guide new clients through onboarding process', gamePlan: '1. Schedule kick-off calls\n2. Set up accounts\n3. Complete training sessions', assignedTo: 'e1', assignedBy: 't1', deadline: daysAgo(2), createdAt: daysAgo(14), completedByEmployee: false, completedByLead: false, status: 'overdue', category: 'pipe_management' },
  { id: 'go3', title: 'Update team training materials', description: 'Refresh all training docs for Q2', gamePlan: '1. Review current materials\n2. Identify gaps\n3. Rewrite outdated sections', assignedTo: 'e2', assignedBy: 't1', deadline: daysFromNow(10), createdAt: daysAgo(5), completedByEmployee: false, completedByLead: false, status: 'active', category: 'call_coaching' },
  { id: 'go4', title: 'Achieve 95% CSAT score', description: 'Maintain customer satisfaction above target', gamePlan: '1. Follow up on negative feedback\n2. Implement quick wins\n3. Track daily scores', assignedTo: 'e3', assignedBy: 't1', deadline: daysFromNow(20), createdAt: daysAgo(1), completedByEmployee: false, completedByLead: false, status: 'active', category: 'call_coaching' },
  { id: 'go5', title: 'Launch email campaign', description: 'Design and deploy Q2 marketing campaign', gamePlan: '1. Draft copy\n2. Design templates\n3. Schedule sends', assignedTo: 'e4', assignedBy: 't2', deadline: daysFromNow(7), createdAt: daysAgo(4), completedByEmployee: true, completedByLead: false, status: 'active', category: 'pipe_management' },
  { id: 'go6', title: 'Reduce ticket resolution time', description: 'Bring avg resolution under 4 hours', gamePlan: '1. Analyze current bottlenecks\n2. Create escalation playbook\n3. Train team on new process', assignedTo: 'e5', assignedBy: 't2', deadline: daysAgo(1), createdAt: daysAgo(10), completedByEmployee: true, completedByLead: true, status: 'completed', category: 'call_coaching' },
  { id: 'go7', title: 'Build dashboard prototype', description: 'Create interactive prototype for client review', gamePlan: '1. Wireframe in Figma\n2. Build in Lovable\n3. Present to stakeholders', assignedTo: 'e6', assignedBy: 't3', deadline: daysFromNow(14), createdAt: daysAgo(2), completedByEmployee: false, completedByLead: false, status: 'active', category: 'pipe_management' },
  { id: 'go8', title: 'Complete compliance training', description: 'All mandatory compliance modules', gamePlan: '1. Register for modules\n2. Complete all 5 modules\n3. Pass certification exam', assignedTo: 'e7', assignedBy: 't3', deadline: daysAgo(3), createdAt: daysAgo(20), completedByEmployee: false, completedByLead: false, status: 'overdue', category: 'call_coaching' },
  { id: 'go9', title: 'Migrate legacy data', description: 'Transfer all records to new system', gamePlan: '1. Map data fields\n2. Write migration scripts\n3. Validate data integrity', assignedTo: 'e8', assignedBy: 't3', deadline: daysFromNow(3), createdAt: daysAgo(7), completedByEmployee: false, completedByLead: false, status: 'active', category: 'pipe_management' },
  { id: 'go10', title: 'Set up CRM integrations', description: 'Connect CRM with email and Slack', gamePlan: 'Technical integration project', assignedTo: 'e1', assignedBy: 't1', deadline: daysAgo(30), createdAt: daysAgo(45), completedByEmployee: true, completedByLead: true, status: 'completed', category: 'pipe_management' },
  { id: 'go11', title: 'Create onboarding playbook', description: 'Document the full onboarding process', gamePlan: 'Documentation project', assignedTo: 'e2', assignedBy: 't1', deadline: daysAgo(20), createdAt: daysAgo(35), completedByEmployee: true, completedByLead: true, status: 'completed', category: 'call_coaching' },
];

export function getUserById(id: string) {
  return users.find(u => u.id === id);
}

export function getDirectReports(managerId: string) {
  return users.filter(u => u.managerId === managerId);
}

export function getAllDescendants(managerId: string): User[] {
  const directs = getDirectReports(managerId);
  const descendants: User[] = [...directs];
  directs.forEach(d => {
    descendants.push(...getAllDescendants(d.id));
  });
  return descendants;
}

export function getGoalsForUser(userId: string) {
  return goals.filter(g => g.assignedTo === userId);
}

export function getActiveGoals(userId: string) {
  return goals.filter(g => g.assignedTo === userId && g.status !== 'completed');
}

export function getCompletedGoals(userId: string) {
  return goals.filter(g => g.assignedTo === userId && g.status === 'completed');
}

// Get all visible AEs based on role
export function getVisibleEmployees(userId: string): User[] {
  const user = getUserById(userId);
  if (!user) return [];
  if (user.role === 'top_level') return users.filter(u => u.role === 'employee');
  if (user.role === 'group_lead') {
    const teamLeads = users.filter(u => u.managerId === userId);
    return teamLeads.flatMap(tl => users.filter(u => u.managerId === tl.id));
  }
  if (user.role === 'team_lead') return users.filter(u => u.managerId === userId);
  return [user]; // employee sees self
}

// Get team leads under a group lead
export function getTeamLeadsUnder(groupLeadId: string): User[] {
  return users.filter(u => u.managerId === groupLeadId && u.role === 'team_lead');
}
