import { useLang } from "@/lib/i18n";
import { Mail, Phone, MessageCircle } from "lucide-react";
import logoWhite from "@/assets/daffa-logo-white.png.asset.json";

export function Footer() {
  const { t, lang } = useLang();
  const phone = "01031416900";
  const intl = "201031416900";
  const email = "support@daffa.pro";
  const waMsg = encodeURIComponent(
    lang === "ar" ? "مرحبًا، أحتاج إلى دعم." : "Hello, I need support."
  );

  return (
    <footer className="bg-deep text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <img src={logoWhite.url} alt={t.brand} className="h-14 w-auto mb-3" />
          <p className="text-sm text-primary-foreground/70 max-w-xs">{t.tagline}</p>
        </div>
        <div>
          <h3 className="font-display text-lg font-bold mb-4">
            {lang === "ar" ? "الدعم" : "Support"}
          </h3>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            <li>
              <a href={`mailto:${email}`} className="inline-flex items-center gap-2 hover:text-accent transition-colors">
                <Mail className="h-4 w-4" /> {email}
              </a>
            </li>
            <li>
              <a href={`tel:+${intl}`} className="inline-flex items-center gap-2 hover:text-accent transition-colors" dir="ltr">
                <Phone className="h-4 w-4" /> {phone}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${intl}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-accent transition-colors"
                dir="ltr"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp: {phone}
              </a>
            </li>
          </ul>
        </div>
        <div className="text-sm text-primary-foreground/70 flex md:justify-end items-end">
          © {new Date().getFullYear()} Daffa. {t.footer.rights}.
        </div>
      </div>
    </footer>
  );
}
