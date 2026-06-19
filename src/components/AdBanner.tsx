import { useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

export interface AdItem {
  type: "image" | "video";
  src: string;
  link: string;
  alt?: string;
}

const DEFAULT_ADS: AdItem[] = [
  {
    type: "image",
    src: "",
    link: "https://leadpromptai.netlify.app/",
    alt: "LeadPromptAI - Premium AI Prompts",
  },
];

export function AdBanner({
  ads = DEFAULT_ADS,
  position = "right",
}: {
  ads?: AdItem[];
  position?: "left" | "right";
}) {
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const handlePrev = useCallback(() => {
    setCurrent((c) => (c === 0 ? ads.length - 1 : c - 1));
  }, [ads.length]);

  const handleNext = useCallback(() => {
    setCurrent((c) => (c === ads.length - 1 ? 0 : c + 1));
  }, [ads.length]);

  if (dismissed || ads.length === 0) return null;

  const ad = ads[current];

  return (
    <div className={`fixed bottom-4 z-40 w-60 sm:bottom-auto sm:top-20 ${position === "right" ? "right-4" : "left-4"}`}>
      <div className="relative rounded-xl bg-zinc-900/80 p-3 ring-1 ring-white/10 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute -right-2 -top-2 z-10 flex size-6 sm:size-5 items-center justify-center rounded-full bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Dismiss ad"
          aria-label="Dismiss ad"
        >
          <X className="size-3.5 sm:size-3" />
        </button>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">Ad</span>
          {ads.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                className="rounded p-0.5 text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                <ChevronLeft className="size-3" />
              </button>
              <span className="text-[10px] text-zinc-600">
                {current + 1}/{ads.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="rounded p-0.5 text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                <ChevronRight className="size-3" />
              </button>
            </div>
          )}
        </div>

        <a
          href={ad.link || "#"}
          target={ad.link ? "_blank" : undefined}
          rel={ad.link ? "noopener noreferrer" : undefined}
          className="block overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400/40"
        >
          {ad.src ? (
            ad.type === "video" ? (
              <video src={ad.src} autoPlay muted loop playsInline className="w-full object-cover" />
            ) : (
              <img src={ad.src} alt={ad.alt || "Advertisement"} className="w-full object-cover" />
            )
          ) : (
            <div className="flex h-24 items-center justify-center rounded-lg bg-zinc-800/50 text-xs text-zinc-600">
              Ad space available
            </div>
          )}
        </a>

        <a
          href={ad.link || "#"}
          target={ad.link ? "_blank" : undefined}
          rel={ad.link ? "noopener noreferrer" : undefined}
          className="mt-1.5 flex items-center justify-center gap-1 rounded-md bg-zinc-800 py-1 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ExternalLink className="size-3" />
          Learn more
        </a>
      </div>
    </div>
  );
}
