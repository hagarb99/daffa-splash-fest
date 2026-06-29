import { useLang } from "@/lib/i18n";
import { Mail, Phone, MessageCircle } from "lucide-react";
import logoWhite from "@/assets/daffa-logo-white.png.asset.json";

export function Footer() {
  const { t, lang } = useLang();
  const phoneDisplay = "+20 103 141 6900";
  const intl = "201031416900";
  const email = "support@daffa.pro";
  const waMsg = encodeURIComponent(
    lang === "ar" ? "مرحبًا، أحتاج إلى دعم." : "Hello, I need support."
  );

  return (
    <footer className="bg-deep text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col items-center text-center">
          <img src={logoWhite.url} alt={t.brand} className="h-16 w-auto mb-4" />
          <p className="text-sm text-primary-foreground/70 max-w-md leading-relaxed">
            {t.tagline}
          </p>

          <h3 className="font-display text-lg font-bold mt-10 mb-5 text-accent">
            {lang === "ar" ? "الدعم" : "Support"}
          </h3>
          <ul className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-primary-foreground/85">
            <li>
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 hover:text-accent transition-colors"
              >
                <Mail className="h-4 w-4" /> {email}
              </a>
            </li>
            <li>
              <a
                href={`tel:+${intl}`}
                className="inline-flex items-center gap-2 hover:text-accent transition-colors"
                dir="ltr"
              >
                <Phone className="h-4 w-4" /> {phoneDisplay}
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
                <MessageCircle className="h-4 w-4" /> WhatsApp: {phoneDisplay}
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/10 text-center text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Daffa. {t.footer.rights}.
        </div>
      </div>
    </footer>
  );
}
