import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, UserCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  user_id: string;
  email: string | null;
  name: string | null;
  team_name: string | null;
  role: AppRole;
  role_row_id: string;
}

const ROLE_LABELS: Record<AppRole, string> = {
  top_level: "Top Level",
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
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Derive team names from users with team_lead role
  const teamLeadNames = users
    .filter((u) => u.role === "team_lead" && u.name)
    .map((u) => u.name as string);

  const handleTeamChange = async (userId: string, teamName: string | null) => {
    setUpdating(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ team_name: teamName })
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to update team");
      setUpdating(null);
      return;
    }

    toast.success("Team updated successfully");
    await fetchUsers();
    setUpdating(null);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles, error: profilesErr } = await supabase
      .from("profiles")
      .select("user_id, email, name, team_name");

    if (profilesErr) {
      toast.error("Failed to load users");
      setLoading(false);
      return;
    }

    const { data: roles, error: rolesErr } = await supabase
      .from("user_roles")
      .select("id, user_id, role");

    if (rolesErr) {
      toast.error("Failed to load roles");
      setLoading(false);
      return;
    }

    const merged: UserWithRole[] = (profiles || []).map((p) => {
      const roleRow = (roles || []).find((r) => r.user_id === p.user_id);
      return {
        user_id: p.user_id,
        email: p.email,
        name: p.name,
        team_name: p.team_name,
        role: roleRow?.role ?? "employee",
        role_row_id: roleRow?.id ?? "",
      };
    });

    setUsers(merged);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, roleRowId: string, newRole: AppRole) => {
    setUpdating(userId);

    if (roleRowId) {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("id", roleRowId);

      if (error) {
        toast.error("Failed to update role");
        setUpdating(null);
        return;
      }
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole });

      if (error) {
        toast.error("Failed to assign role");
        setUpdating(null);
        return;
      }
    }

    toast.success("Role updated successfully");
    await fetchUsers();
    setUpdating(null);
  };


  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage user roles, teams, and permissions</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No users have signed up yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Change Role</TableHead>
                <TableHead>Team</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                  <TableRow key={user.user_id}>

                    <TableCell className="font-medium">
                      {user.name || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.email || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={ROLE_COLORS[user.role]}>
                        {ROLE_LABELS[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(val) => handleRoleChange(user.user_id, user.role_row_id, val as AppRole)}
                        disabled={updating === user.user_id}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">AE</SelectItem>
                          <SelectItem value="team_lead">Team Lead</SelectItem>
                          <SelectItem value="group_lead">Group Lead</SelectItem>
                          <SelectItem value="top_level">Top Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.team_name ?? "__none__"}
                        onValueChange={(val) => handleTeamChange(user.user_id, val === "__none__" ? null : val)}
                        disabled={updating === user.user_id}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="No team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">No team</SelectItem>
                          {teamLeadNames.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}