import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Code,
  Globe,
  Briefcase,
  Megaphone,
  Search,
  Palette,
  GraduationCap,
  FileText,
  Zap,
  PenTool,
  Image,
  Video,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition, fadeUp, stagger } from "@/components/PageTransition";
import { listCategories } from "@/utils/supabase-server";

const iconMap: Record<string, typeof Code> = {
  Code,
  Globe,
  Briefcase,
  Megaphone,
  Search,
  Palette,
  GraduationCap,
  FileText,
  Zap,
  PenTool,
  Image,
  Video,
};

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Categories — PromptOS" },
      {
        name: "description",
        content: "Browse AI prompts by category. Find the perfect prompt for your needs.",
      },
      { property: "og:title", content: "Categories — PromptOS" },
      { property: "og:description", content: "Browse AI prompts by category — coding, writing, design, marketing, and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCategories().then((res: any) => {
      setCategories(res.categories || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="relative min-h-screen hero-radial selection:bg-zinc-500/30">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pb-32 pt-16">
        <PageTransition>
          <div className="mb-12 text-center">
            <span className="font-mono-display text-[10px] uppercase tracking-wider text-zinc-500">
              / categories
            </span>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
              Browse by category
            </h1>
            {!loading && (
              <p className="mt-2 text-sm text-zinc-500">
                {categories
                  .reduce((a: number, c: any) => a + (c.prompt_count || 0), 0)
                  .toLocaleString()}
                + prompts across {categories.length} categories
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="size-6 animate-spin text-zinc-500" />
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {categories.map((cat: any, i: number) => {
                const Icon = iconMap[cat.icon] || Code;
                return (
                  <motion.div key={cat.slug} variants={fadeUp} custom={i} className="h-full">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="h-full"
                    >
                      <Link
                        to="/explore"
                        search={{ category: cat.slug }}
                        className="group flex h-full flex-col gap-3 rounded-xl bg-zinc-900/40 p-5 ring-1 ring-white/5 transition-all hover:bg-zinc-900/60 hover:ring-zinc-500/20"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-white/10 transition-colors group-hover:bg-zinc-700">
                          <Icon className="size-5 text-zinc-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-zinc-200">{cat.name}</h3>
                          <p className="mt-1 text-xs text-zinc-500">{cat.description || ""}</p>
                        </div>
                        <span className="shrink-0 text-[10px] font-medium text-zinc-600">
                          {cat.prompt_count?.toLocaleString() || "0"} prompts
                        </span>
                      </Link>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
