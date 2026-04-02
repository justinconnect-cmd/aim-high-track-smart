import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export interface DbProfile {
  user_id: string;
  name: string | null;
  email: string | null;
  team_name: string | null;
}

export interface CurrentUser {
  id: string;
  name: string;
  role: AppRole;
  teamName: string | null;
  email: string | null;
  avatar: string;
}

interface AuthContextType {
  currentUser: CurrentUser | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateAvatar(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const fetchProfile = async (userId: string) => {
    const [profileRes, roleRes] = await Promise.all([
      supabase.from("profiles").select("user_id, name, email, team_name").eq("user_id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId).single(),
    ]);

    const profile = profileRes.data;
    const role: AppRole = roleRes.data?.role ?? "employee";

    if (profile) {
      setCurrentUser({
        id: profile.user_id,
        name: profile.name || profile.email?.split("@")[0] || "User",
        role,
        teamName: profile.team_name,
        email: profile.email,
        avatar: generateAvatar(profile.name),
      });
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        // Defer profile fetch to avoid Supabase auth deadlock
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
