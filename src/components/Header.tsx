import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Globe, User as UserIcon } from "lucide-react";
import logoColor from "@/assets/daffa-logo.png.asset.json";
import logoWhite from "@/assets/daffa-logo-white.png.asset.json";

export function Header({ transparentOnTop = false }: { transparentOnTop?: boolean }) {
  const { t, lang, toggle } = useLang();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const solid = !transparentOnTop || scrolled;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        solid
          ? "backdrop-blur-xl bg-background/85 border-b border-border/60 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={solid ? logoColor.url : logoWhite.url}
            alt={t.brand}
            className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className={`transition-colors hover:text-accent ${solid ? "text-foreground" : "text-primary-foreground/90"}`}>{t.nav.home}</Link>
          <Link to="/event-details" className={`transition-colors hover:text-accent ${solid ? "text-foreground" : "text-primary-foreground/90"}`}>{t.nav.activities}</Link>
          {isAdmin && (
            <Link to="/admin" className={`transition-colors hover:text-accent font-semibold ${solid ? "text-accent" : "text-accent"}`}>
              {t.nav.admin}
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className={`gap-1 ${solid ? "" : "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"}`}
          >
            <Globe className="h-4 w-4" />
            <span className="font-semibold">{lang === "ar" ? "EN" : "ع"}</span>
          </Button>
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin"><Button variant="outline" size="sm">{t.nav.admin}</Button></Link>
              )}
              <Link to="/account" title="My account">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full ${solid ? "bg-accent/15 text-accent hover:bg-accent/25" : "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"}`}
                >
                  <UserIcon className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut} className={solid ? "" : "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"}>{t.nav.signOut}</Button>
            </>
          ) : (
            <Link to="/auth"><Button size="sm" variant={solid ? "default" : "outline"} className={solid ? "" : "bg-transparent border-primary-foreground/60 text-primary-foreground hover:bg-primary-foreground hover:text-primary"}>{t.nav.signIn}</Button></Link>
          )}
          <Link to="/event-details" className="hidden sm:block">
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow">
              {t.activity.book}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
