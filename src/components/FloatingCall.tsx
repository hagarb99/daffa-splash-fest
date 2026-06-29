import { Phone } from "lucide-react";

export function FloatingCall() {
  return (
    <a
      href="tel:+201031416900"
      aria-label="Call us"
      className="fixed bottom-6 end-6 z-50 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-glow flex items-center justify-center hover:scale-110 transition-transform"
    >
      <Phone className="h-6 w-6" />
    </a>
  );
}
