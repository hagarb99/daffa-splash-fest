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
        <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-16">
          <div className="flex flex-col items-start shrink-0">
            <img src={logoWhite.url} alt={t.brand} className="h-16 w-auto mb-3" />
            <p className="text-sm text-primary-foreground/70 max-w-xs leading-relaxed">
              {t.tagline}
            </p>
          </div>

          <div className="flex-1">
            <h3 className="font-display text-lg font-bold mb-4 text-accent">
              {lang === "ar" ? "الدعم" : "Support"}
            </h3>
            <ul className="flex flex-col items-start gap-3 text-sm text-primary-foreground/85">
              <li>
                <a href={`mailto:${email}`} className="flex flex-row-reverse items-center justify-end gap-2 hover:text-accent transition-colors">
                  <Mail className="h-4 w-4" /> <span dir="ltr">{email}</span>
                </a>
              </li>
              <li>
                <a href={`tel:+${intl}`} className="flex flex-row-reverse items-center justify-end gap-2 hover:text-accent transition-colors">
                  <Phone className="h-4 w-4" /> <span dir="ltr">{phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${intl}?text=${waMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-row-reverse items-center justify-end gap-2 hover:text-accent transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> <span dir="ltr">WhatsApp: {phoneDisplay}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>


        <div className="mt-10 pt-6 border-t border-primary-foreground/10 text-center text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Daffa. {t.footer.rights}.
        </div>
      </div>
    </footer>
  );
}
