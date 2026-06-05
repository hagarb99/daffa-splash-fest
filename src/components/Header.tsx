import { Link, useNavigate } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Waves } from "lucide-react";

export function Header() {
  const { t, lang, toggle } = useLang();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <Waves className="h-7 w-7 text-accent group-hover:scale-110 transition-transform" />
          <span className="font-display text-xl font-bold text-primary">{t.brand}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-accent transition-colors">{t.nav.home}</Link>
          <Link to="/event-details" className="hover:text-accent transition-colors">{t.nav.activities}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggle} className="gap-1">
            <Globe className="h-4 w-4" />
            <span className="font-semibold">{lang === "ar" ? "EN" : "ع"}</span>
          </Button>
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin"><Button variant="outline" size="sm">{t.nav.admin}</Button></Link>
              )}
              <Button variant="ghost" size="sm" onClick={signOut}>{t.nav.signOut}</Button>
            </>
          ) : (
            <Link to="/auth"><Button size="sm">{t.nav.signIn}</Button></Link>
          )}
        </div>
      </div>
    </header>
  );
}
