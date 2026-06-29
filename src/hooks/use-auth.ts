import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadRoles = async (u: User | null) => {
      if (!u) { setIsAdmin(false); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id);
      if (mounted) setIsAdmin(!!data?.some((r) => r.role === "admin"));
    };

    // Subscribe FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      loadRoles(u);
    });

    // Then hydrate from persisted session
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const u = data.session?.user ?? null;
      setUser(u);
      loadRoles(u);
      setLoading(false);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  return { user, loading, isAdmin };
}
