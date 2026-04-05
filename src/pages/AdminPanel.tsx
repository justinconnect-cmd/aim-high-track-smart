import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, UserCircle, Archive, ArchiveRestore, Plus, Trash2, Users, Briefcase, Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";

import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  user_id: string;
  email: string | null;
  name: string | null;
  team_name: string | null;
  team_id: string | null;
  position_id: string | null;
  archived: boolean;
  role: AppRole;
  role_row_id: string;
}

interface Team {
  id: string;
  name: string;
}

interface Position {
  id: string;
  name: string;
}

const ROLE_LABELS: Record<AppRole, string> = {
  top_level: "Admin",
  group_lead: "Group Lead",
  team_lead: "Team Lead",
  employee: "AE",
};

const ROLE_COLORS: Record<AppRole, string> = {
  top_level: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  group_lead: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  team_lead: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  employee: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
};

export default function AdminPanel() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newPositionName, setNewPositionName] = useState("");
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [profilesRes, rolesRes, teamsRes, positionsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, email, name, team_name, team_id, position_id, archived"),
      supabase.from("user_roles").select("id, user_id, role"),
      supabase.from("teams").select("id, name").order("name"),
      supabase.from("positions").select("id, name").order("name"),
    ]);

    if (profilesRes.error || rolesRes.error) {
      toast.error("Failed to load data");
      setLoading(false);
      return;
    }

    const merged: UserWithRole[] = (profilesRes.data || []).map((p) => {
      const roleRow = (rolesRes.data || []).find((r) => r.user_id === p.user_id);
      return {
        user_id: p.user_id,
        email: p.email,
        name: p.name,
        team_name: p.team_name,
        team_id: p.team_id,
        position_id: p.position_id,
        archived: p.archived ?? false,
        role: roleRow?.role ?? "employee",
        role_row_id: roleRow?.id ?? "",
      };
    });

    setUsers(merged);
    setTeams(teamsRes.data || []);
    setPositions(positionsRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRoleChange = async (userId: string, roleRowId: string, newRole: AppRole) => {
    setUpdating(userId);
    if (roleRowId) {
      const { error } = await supabase.from("user_roles").update({ role: newRole }).eq("id", roleRowId);
      if (error) { toast.error("Failed to update role"); setUpdating(null); return; }
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
      if (error) { toast.error("Failed to assign role"); setUpdating(null); return; }
    }
    toast.success("Role updated");
    await fetchAll();
    setUpdating(null);
  };

  const handleTeamChange = async (userId: string, teamId: string | null) => {
    setUpdating(userId);
    const teamObj = teams.find(t => t.id === teamId);
    const { error } = await supabase.from("profiles").update({ team_id: teamId, team_name: teamObj?.name ?? null }).eq("user_id", userId);
    if (error) { toast.error("Failed to update team"); setUpdating(null); return; }
    toast.success("Team updated");
    await fetchAll();
    setUpdating(null);
  };

  const handlePositionChange = async (userId: string, positionId: string | null) => {
    setUpdating(userId);
    const { error } = await supabase.from("profiles").update({ position_id: positionId }).eq("user_id", userId);
    if (error) { toast.error("Failed to update position"); setUpdating(null); return; }
    toast.success("Position updated");
    await fetchAll();
    setUpdating(null);
  };

  const handleArchiveToggle = async (userId: string, archive: boolean) => {
    setUpdating(userId);
    const { error } = await supabase.from("profiles").update({ archived: archive }).eq("user_id", userId);
    if (error) { toast.error("Failed to update user"); setUpdating(null); return; }
    toast.success(archive ? "User archived" : "User restored");
    await fetchAll();
    setUpdating(null);
  };

  const handleAddTeam = async () => {
    const name = newTeamName.trim();
    if (!name) return;
    const { error } = await supabase.from("teams").insert({ name });
    if (error) { toast.error(error.message.includes("duplicate") ? "Team already exists" : "Failed to create team"); return; }
    toast.success("Team created");
    setNewTeamName("");
    setTeamDialogOpen(false);
    await fetchAll();
  };

  const handleDeleteTeam = async (id: string) => {
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) { toast.error("Failed to delete team"); return; }
    toast.success("Team deleted");
    await fetchAll();
  };

  const handleAddPosition = async () => {
    const name = newPositionName.trim();
    if (!name) return;
    const { error } = await supabase.from("positions").insert({ name });
    if (error) { toast.error(error.message.includes("duplicate") ? "Position already exists" : "Failed to create position"); return; }
    toast.success("Position created");
    setNewPositionName("");
    setPositionDialogOpen(false);
    await fetchAll();
  };

  const handleDeletePosition = async (id: string) => {
    const { error } = await supabase.from("positions").delete().eq("id", id);
    if (error) { toast.error("Failed to delete position"); return; }
    toast.success("Position deleted");
    await fetchAll();
  };

  const visibleUsers = users.filter(u => showArchived ? u.archived : !u.archived);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage users, teams, positions, and permissions</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4" />Users</TabsTrigger>
          <TabsTrigger value="teams" className="gap-2"><Building2 className="w-4 h-4" />Teams</TabsTrigger>
          <TabsTrigger value="positions" className="gap-2"><Briefcase className="w-4 h-4" />Positions</TabsTrigger>
        </TabsList>

        {/* USERS TAB */}
        <TabsContent value="users">
          <div className="flex items-center justify-between mb-4">
            <Button variant={showArchived ? "default" : "outline"} size="sm" onClick={() => setShowArchived(!showArchived)} className="gap-2">
              <Archive className="w-4 h-4" />
              {showArchived ? "Showing Archived" : "Show Archived"}
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : visibleUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>{showArchived ? "No archived users" : "No active users"}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Change Role</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleUsers.map((user) => (
                    <TableRow key={user.user_id} className={user.archived ? "opacity-60" : ""}>
                      <TableCell className="font-medium">{user.name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{user.email || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={ROLE_COLORS[user.role]}>{ROLE_LABELS[user.role]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select value={user.role} onValueChange={(val) => handleRoleChange(user.user_id, user.role_row_id, val as AppRole)} disabled={updating === user.user_id}>
                          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">AE</SelectItem>
                            <SelectItem value="team_lead">Team Lead</SelectItem>
                            <SelectItem value="group_lead">Group Lead</SelectItem>
                            <SelectItem value="top_level">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={user.team_id ?? "__none__"} onValueChange={(val) => handleTeamChange(user.user_id, val === "__none__" ? null : val)} disabled={updating === user.user_id}>
                          <SelectTrigger className="w-[160px]"><SelectValue placeholder="No team" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">No team</SelectItem>
                            {teams.map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={user.position_id ?? "__none__"} onValueChange={(val) => handlePositionChange(user.user_id, val === "__none__" ? null : val)} disabled={updating === user.user_id}>
                          <SelectTrigger className="w-[160px]"><SelectValue placeholder="No position" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">No position</SelectItem>
                            {positions.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleArchiveToggle(user.user_id, !user.archived)} disabled={updating === user.user_id} title={user.archived ? "Restore user" : "Archive user"}>
                          {user.archived ? <ArchiveRestore className="w-4 h-4 text-emerald-600" /> : <Archive className="w-4 h-4 text-destructive" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* TEAMS TAB */}
        <TabsContent value="teams">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Manage Teams</h2>
            <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="w-4 h-4" />Add Team</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create New Team</DialogTitle></DialogHeader>
                <Input placeholder="Team name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddTeam()} />
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleAddTeam} disabled={!newTeamName.trim()}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {teams.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No teams created yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => {
                    const memberCount = users.filter(u => u.team_id === team.id && !u.archived).length;
                    return (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell className="text-muted-foreground">{memberCount} member{memberCount !== 1 ? "s" : ""}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTeam(team.id)} title="Delete team">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* POSITIONS TAB */}
        <TabsContent value="positions">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Manage Positions</h2>
            <Dialog open={positionDialogOpen} onOpenChange={setPositionDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="w-4 h-4" />Add Position</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create New Position</DialogTitle></DialogHeader>
                <Input placeholder="Position title" value={newPositionName} onChange={(e) => setNewPositionName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddPosition()} />
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleAddPosition} disabled={!newPositionName.trim()}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {positions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No positions created yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position Title</TableHead>
                    <TableHead>Assigned Users</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((pos) => {
                    const assignedCount = users.filter(u => u.position_id === pos.id && !u.archived).length;
                    return (
                      <TableRow key={pos.id}>
                        <TableCell className="font-medium">{pos.name}</TableCell>
                        <TableCell className="text-muted-foreground">{assignedCount} user{assignedCount !== 1 ? "s" : ""}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePosition(pos.id)} title="Delete position">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
