import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { t } = useLang();
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) nav({ to: "/" }); });
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name, phone } },
        });
        if (error) throw error;
      }
      toast.success("OK");
      // Redirect admins to dashboard, others to home
      const { data: { user: u } } = await supabase.auth.getUser();
      let goAdmin = false;
      if (u) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.id);
        goAdmin = !!roles?.some((r) => r.role === "admin");
      }
      nav({ to: goAdmin ? "/admin" : "/account" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <form onSubmit={submit} className="bg-card rounded-3xl shadow-elegant p-8 w-full max-w-md space-y-4">
          <h1 className="font-display text-3xl font-bold text-primary text-center">{t.auth.title}</h1>
          {mode === "up" && (
            <>
              <div><Label>{t.auth.fullName}</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label>{t.auth.phone}</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            </>
          )}
          <div><Label>{t.auth.email}</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label>{t.auth.password}</Label><Input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button type="submit" disabled={busy} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {mode === "in" ? t.auth.signIn : t.auth.signUp}
          </Button>
          <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="text-sm text-accent hover:underline block w-full text-center">
            {mode === "in" ? t.auth.switchToSignUp : t.auth.switchToSignIn}
          </button>
        </form>
      </section>
      <Footer />
    </div>
  );
}
