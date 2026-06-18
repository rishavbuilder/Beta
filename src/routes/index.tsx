import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Check, Sparkles, Github, Twitter, Loader2 } from "lucide-react";
import { listPrompts } from "@/utils/supabase-server";
import logoSrc from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PromptOS — AI Prompt Marketplace" },
      {
        name: "description",
        content:
          "Browse, share, and sell AI prompts for ChatGPT, Claude, Midjourney, and more. Join the community of prompt creators.",
      },
      { property: "og:title", content: "PromptOS — AI Prompt Marketplace" },
      {
        property: "og:description",
        content:
          "Discover trending prompts, upload your own, and connect with other creators. The marketplace for AI prompt engineers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const categories = [
  "Coding",
  "Web Development",
  "Business",
  "Marketing",
  "SEO",
  "Design",
  "Education",
  "Resume",
  "Productivity",
  "Content Creation",
  "Image Generation",
  "Video Generation",
];

const testimonials = [
  {
    quote:
      "Great platform for finding quality prompts. The community feature makes it easy to share and discover new ideas.",
    name: "Rahul S.",
    role: "Freelance Developer",
  },
  {
    quote:
      "I love how easy it is to upload and sell my prompts. The review system helps buyers trust the quality.",
    name: "Priya M.",
    role: "AI Content Creator",
  },
  {
    quote:
      "The battle feature is a fun way to compare prompts. Community discussions are very helpful for beginners.",
    name: "Alex K.",
    role: "Prompt Engineer",
  },
];

function Index() {
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPrompts().then((res) => {
      const mapped = (res.prompts || []).slice(0, 6).map((p: any) => ({
        id: p.id,
        title: p.title,
        desc: p.description || "",
        category: p.categories?.name || "Uncategorized",
        saves: p.saves_count || 0,
      }));
      setTrending(mapped);
      setLoading(false);
    });
  }, []);

  return (
    <div className="relative min-h-screen hero-radial selection:bg-zinc-500/30">
      <Nav />
      <main>
        <Hero />
        <Trending trending={trending} loading={loading} />
        <Categories />
        <Bento />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 glass-card">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logoSrc} alt="PromptOS" className="size-13 rounded" />
          </Link>
          <div className="hidden gap-6 md:flex">
            <Link
              to="/explore"
              className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Marketplace
            </Link>
            <a
              href="#workbench"
              className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Workbench
            </a>
            <a
              href="#pricing"
              className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Pricing
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/auth/login"
            className="hidden sm:inline-block text-sm font-medium text-zinc-400 px-3 py-1.5 hover:text-zinc-100 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-1 rounded-md bg-zinc-100 py-1.5 pr-3 pl-2 text-sm font-medium text-zinc-950 ring-1 ring-zinc-100 transition hover:opacity-90"
          >
            <Plus className="size-4 shrink-0" />
            <span>Post prompt</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
              className="flex flex-col gap-4"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-zinc-300">
                <Sparkles className="size-3 text-zinc-100" />
                <span>New — Community discussions & battles are live</span>
              </div>
              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-zinc-100 md:text-5xl lg:text-6xl">
                Discover & share premium AI prompts.
              </h1>
              <p className="max-w-[44ch] text-pretty text-lg text-zinc-400">
                Browse hundreds of curated prompts, upload your own creations, and connect with a
                growing community of AI enthusiasts.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="relative max-w-md"
            >
              <div className="flex h-12 w-full items-center gap-3 rounded-lg bg-zinc-900/50 pl-4 ring-1 ring-white/10 focus-within:ring-zinc-400/40 transition">
                <Search className="size-4 shrink-0 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search prompts, categories, models…"
                  className="w-full bg-transparent pr-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                />
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-md rounded-xl p-px ring-1 ring-white/10 glass-card shadow-2xl shadow-black/40 animate-float">
              <div className="rounded-[11px] bg-zinc-950/40 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-emerald-500/80 animate-pulse" />
                    <span className="font-mono-display text-[10px] uppercase tracking-wider text-zinc-500">
                      Trending — ChatGPT
                    </span>
                  </div>
                  <span className="font-mono-display text-[10px] text-zinc-600">★ 4.8</span>
                </div>
                <div className="space-y-4">
                  <div className="h-2 w-3/4 rounded-full bg-zinc-800/60" />
                  <div className="h-2 w-full rounded-full bg-zinc-800/60" />
                  <div className="h-2 w-5/6 rounded-full bg-zinc-800/60" />
                  <div className="mt-8 rounded-lg bg-zinc-900/80 p-4 ring-1 ring-white/5">
                    <code className="font-mono-display text-xs leading-relaxed text-zinc-300">
                      Act as a senior copywriter. Write a compelling product description for a SaaS
                      tool targeting developers…
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Trending({ trending, loading }: { trending: any[]; loading: boolean }) {
  return (
    <section id="trending" className="border-t border-white/5 bg-zinc-950/20 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Recent Prompts</h2>
            <p className="text-sm text-zinc-500">Newest prompts uploaded by the community.</p>
          </div>
          <Link
            to="/explore"
            className="shrink-0 text-xs font-medium text-zinc-400 hover:text-zinc-100"
          >
            View all
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-zinc-500" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((p, i) => (
              <motion.article
                key={p.id || p.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                custom={i}
                className="group relative flex flex-col gap-4 rounded-xl p-5 ring-1 ring-white/10 transition-colors hover:bg-zinc-900/40"
              >
                <Link to="/prompt/$id" params={{ id: p.id }}>
                  <div className="aspect-video w-full overflow-hidden rounded-[12px] bg-gradient-to-br from-zinc-700 to-zinc-900 ring-1 ring-white/5 flex items-center justify-center">
                    <span className="text-3xl font-bold text-zinc-600">
                      {p.title?.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono-display text-[10px] uppercase text-zinc-500">
                        {p.category}
                      </span>
                      <span className="text-[10px] text-zinc-600">{p.saves} saves</span>
                    </div>
                    <h3 className="text-sm font-medium text-zinc-200">{p.title}</h3>
                    <p className="text-xs leading-normal text-zinc-500">{p.desc}</p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Categories() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Browse by category
          </h2>
          <p className="text-sm text-zinc-500">Find the perfect prompt for your needs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c}
              to="/explore"
              search={{ category: c }}
              className="rounded-full border border-white/10 bg-zinc-900/40 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Bento() {
  return (
    <section id="workbench" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2">
          <div className="col-span-1 flex flex-col justify-end rounded-2xl bg-zinc-900/40 p-8 ring-1 ring-white/5 md:col-span-2 md:row-span-2">
            <div className="mb-auto">
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-white/10">
                <Sparkles className="size-5 text-zinc-300" />
              </div>
              <h3 className="text-xl font-medium text-zinc-100">Community driven</h3>
              <p className="mt-2 max-w-[32ch] text-sm text-zinc-500">
                Discover prompts created by the community, join discussions, and vote for the best
                prompts in battles.
              </p>
            </div>
          </div>
          <div className="col-span-1 rounded-2xl bg-zinc-900/40 p-8 ring-1 ring-white/5 md:col-span-2">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-medium tracking-tight text-zinc-100">500+</div>
              <div className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                Curated prompts
              </div>
            </div>
          </div>
          <div className="col-span-1 rounded-2xl bg-zinc-900/40 p-8 ring-1 ring-white/5">
            <div className="text-2xl font-medium text-zinc-100">12</div>
            <div className="mt-1 text-xs text-zinc-500">Categories</div>
          </div>
          <div className="col-span-1 rounded-2xl bg-zinc-100 p-8 ring-1 ring-zinc-100">
            <div className="text-2xl font-semibold text-zinc-950">1k+</div>
            <div className="mt-1 text-xs font-medium text-zinc-600">Community members</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="border-t border-white/5 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Built for serious teams
          </h2>
          <p className="text-sm text-zinc-500">
            What engineers and creators say about working in PromptOS.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              custom={i}
              className="flex flex-col gap-6 rounded-2xl bg-zinc-900/40 p-8 ring-1 ring-white/5"
            >
              <blockquote className="text-sm leading-relaxed text-zinc-300">“{t.quote}”</blockquote>
              <figcaption className="flex items-center gap-3 border-t border-white/5 pt-4">
                <div className="size-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 ring-1 ring-white/10" />
                <div>
                  <div className="text-xs font-medium text-zinc-200">{t.name}</div>
                  <div className="text-[11px] text-zinc-500">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="border-t border-white/5 py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-semibold tracking-tight text-zinc-100">Simple pricing</h2>
        <p className="mb-16 text-sm text-zinc-500">Start free. Upgrade when you need more.</p>
        <div className="grid gap-8 text-left lg:grid-cols-3">
          <PriceCard
            tier="Starter"
            price="$0"
            features={["Browse all prompts", "Save up to 100 prompts", "Community access"]}
            cta="Get started"
          />
          <PriceCard
            tier="Pro"
            price="$19"
            features={["Unlimited saves", "Upload & sell prompts", "Priority support", "Analytics"]}
            cta="Start trial"
            featured
          />
          <PriceCard
            tier="Teams"
            price="$49"
            features={["Team library", "Bulk upload", "Analytics dashboard", "Dedicated support"]}
            cta="Contact sales"
          />
        </div>
      </div>
    </section>
  );
}

function PriceCard({
  tier,
  price,
  features,
  cta,
  featured,
}: {
  tier: string;
  price: string;
  features: string[];
  cta: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-8 ring-1 ${featured ? "bg-zinc-100 ring-zinc-100" : "ring-white/10 glass-card"}`}
    >
      {featured && (
        <div className="absolute -top-3 left-8 rounded-full bg-zinc-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-100">
          Recommended
        </div>
      )}
      <div className="mb-8">
        <h3 className={`text-sm font-medium ${featured ? "text-zinc-600" : "text-zinc-400"}`}>
          {tier}
        </h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span
            className={`text-3xl font-semibold ${featured ? "text-zinc-950" : "text-zinc-100"}`}
          >
            {price}
          </span>
          <span className={`text-xs ${featured ? "text-zinc-600" : "text-zinc-500"}`}>/mo</span>
        </div>
      </div>
      <ul className={`mb-8 space-y-4 text-sm ${featured ? "text-zinc-700" : "text-zinc-500"}`}>
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check className={`size-4 ${featured ? "text-zinc-900" : "text-zinc-300"}`} />
            {f}
          </li>
        ))}
      </ul>
      <Link
        to="/auth/register"
        className={`block w-full rounded-lg py-2 text-sm font-medium text-center ${
          featured
            ? "bg-zinc-950 text-zinc-100 ring-1 ring-zinc-950 hover:opacity-90"
            : "bg-zinc-800 text-zinc-200 ring-1 ring-white/10 hover:bg-zinc-700"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

function CTA() {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
          Ready to get started?
        </h2>
        <p className="mt-4 text-lg text-zinc-500">
          Join our community of prompt creators and enthusiasts.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/auth/register"
            className="rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 ring-1 ring-zinc-100 transition-opacity hover:opacity-90"
          >
            Get started for free
          </Link>
          <Link
            to="/explore"
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-100 ring-1 ring-white/10 transition-colors hover:bg-zinc-800"
          >
            Explore marketplace
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 md:flex-row">
        <div className="flex items-center gap-2">
          <img src={logoSrc} alt="PromptOS" className="size-5 rounded" />
          <span className="text-sm font-medium text-zinc-100">PromptOS</span>
        </div>
        <div className="flex gap-8 text-xs text-zinc-500">
          <Link to="/explore" className="transition-colors hover:text-zinc-200">
            Marketplace
          </Link>
          <Link to="/community" className="transition-colors hover:text-zinc-200">
            Community
          </Link>
          <Link to="/auth/register" className="transition-colors hover:text-zinc-200">
            Join
          </Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-500">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="hover:text-zinc-200"
          >
            <Twitter className="size-4" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hover:text-zinc-200"
          >
            <Github className="size-4" />
          </a>
          <span className="text-xs">© 2026 PromptOS</span>
        </div>
      </div>
    </footer>
  );
}
