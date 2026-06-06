import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function ActivityGallery({ images }: { images: { url: string; sort_order?: number }[] }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  if (!images.length) return null;

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="bg-card rounded-2xl p-6 shadow-elegant">
      <h3 className="font-display text-xl font-bold text-primary mb-4">{t.activity.gallery}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setIndex(i); setOpen(true); }}
            className="group relative aspect-square overflow-hidden rounded-xl"
          >
            <img src={img.url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 transition-colors" />
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl bg-background/95 backdrop-blur border-none p-0">
          <div className="relative aspect-video">
            <img src={images[index]?.url} alt="" className="w-full h-full object-contain" />
            {images.length > 1 && (
              <>
                <button onClick={prev} className="absolute start-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 hover:bg-accent hover:text-accent-foreground transition">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={next} className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 hover:bg-accent hover:text-accent-foreground transition">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            <button onClick={() => setOpen(false)} className="absolute top-3 end-3 rounded-full bg-background/80 p-2 hover:bg-accent hover:text-accent-foreground transition">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="text-center text-xs text-muted-foreground py-2">{index + 1} / {images.length}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
