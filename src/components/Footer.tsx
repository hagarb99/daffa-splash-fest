import { useLang } from "@/lib/i18n";
import { Waves } from "lucide-react";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="bg-deep text-primary-foreground mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Waves className="h-7 w-7 text-accent" />
            <span className="font-display text-xl font-bold">{t.brand}</span>
          </div>
          <p className="text-sm text-primary-foreground/70 max-w-xs">{t.tagline}</p>
        </div>
        <div className="text-sm text-primary-foreground/70 md:col-span-2 flex md:justify-end items-end">
          © {new Date().getFullYear()} Daffa. {t.footer.rights}.
        </div>
      </div>
    </footer>
  );
}
