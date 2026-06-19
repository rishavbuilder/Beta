import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { getSiteStats } from "@/utils/supabase-server";
import logoSrc from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PromptOS — Prompt Marketplace" },
      {
        name: "description",
        content:
          "Browse and share prompts across every category. Join the community of prompt creators.",
      },
      { property: "og:title", content: "PromptOS — Prompt Marketplace" },
      {
        property: "og:description",
        content:
          "Discover trending prompts, upload your own, and connect with other creators.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://promptsos.vercel.app/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://promptsos.vercel.app/og-image.png" },
    ],
  }),
  component: Index,
});

function Index() {
  const [stats, setStats] = useState({ prompts: 0, categories: 0, members: 0 });

  useEffect(() => {
    getSiteStats().then((res: any) => {
      if (res.stats) setStats(res.stats);
    });
  }, []);

  return (
    <div className="relative min-h-screen hero-radial selection:bg-zinc-500/30">
      <Nav />
      <main>
        <Hero stats={stats} />
      </main>
    </div>
  );
}

function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 w-full bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logoSrc} alt="PromptOS" className="size-[60px] rounded" />
          <span className="text-lg font-extrabold tracking-tighter bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            PromptOS
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/explore" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            Explore
          </Link>
          <Link to="/community" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            Community
          </Link>
          <Link to="/auth/login" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            Sign in
          </Link>
          <Link
            to="/auth/register"
            className="group relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold tracking-wide text-zinc-100 transition-all duration-200 hover:scale-[0.97]"
          >
            <span className="absolute inset-0 rounded-full bg-zinc-800 w-[45px] group-hover:w-full transition-all duration-300 ease-in-out" />
            <span className="relative z-10">Get started</span>
            <svg width="15" height="10" viewBox="0 0 13 10" className="relative z-10 fill-none stroke-zinc-100 stroke-2 -translate-x-1 group-hover:translate-x-0 transition-all duration-300" style={{ strokeLinecap: "round", strokeLinejoin: "round" }}>
              <path d="M1,5 L11,5" />
              <polyline points="8 1 12 5 8 9" />
            </svg>
          </Link>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-zinc-400" aria-label={mobileOpen ? "Close menu" : "Open menu"}>
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="border-t border-zinc-800/50 bg-zinc-950/95 px-6 py-4 md:hidden backdrop-blur-xl">
          <div className="flex flex-col gap-2">
            <Link to="/explore" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 transition-all">Explore</Link>
            <Link to="/community" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 transition-all">Community</Link>
            <Link to="/auth/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 transition-all">Sign in</Link>
            <Link to="/auth/register" onClick={() => setMobileOpen(false)} className="rounded-lg bg-zinc-100 px-3 py-2.5 text-sm font-medium text-zinc-950 text-center transition-all hover:opacity-90">Get started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function Doodle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute pointer-events-none select-none ${className || ""}`}
    >
      {children}
    </motion.div>
  );
}

function Float({ children, delay = 0, className, mouse, offset = 0 }: { children: React.ReactNode; delay?: number; className?: string; mouse?: { x: number; y: number }; offset?: number }) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [-6, 6, -6] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
      className={className}
      style={mouse ? {
        x: (mouse.x - 0.5) * offset,
        y: (mouse.y - 0.5) * offset,
      } : undefined}
    >
      {children}
    </motion.div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 1500;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

function Hero({ stats }: { stats: { prompts: number; categories: number; members: number } }) {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-zinc-950">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Doodle — squiggle top left */}
      <Doodle className="top-16 left-8 md:top-24 md:left-16">
        <Float delay={0} mouse={mouse} offset={20}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path d="M10 40 C20 10, 30 70, 40 40 C50 10, 60 70, 70 40" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="70" cy="40" r="3" fill="rgba(255,255,255,0.12)" />
          </svg>
        </Float>
      </Doodle>

      {/* Doodle — spiral top right */}
      <Doodle className="top-20 right-8 md:top-28 md:right-16">
        <Float delay={1.5} mouse={mouse} offset={-25}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <path d="M30 30 C35 20, 45 25, 40 35 C35 45, 20 40, 25 30 C30 20, 40 15, 50 25" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </Float>
      </Doodle>

      {/* Doodle — stars scattered */}
      <Doodle className="top-1/4 right-1/4 md:right-1/3">
        <Float delay={0.8} mouse={mouse} offset={35}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15 9H22L16 14L18 22L12 17L6 22L8 14L2 9H9L12 2Z" fill="rgba(255,255,255,0.06)" />
          </svg>
        </Float>
      </Doodle>

      {/* Doodle — hand-drawn circle around text area */}
      <Doodle className="top-[30%] left-[5%] md:left-[10%] hidden md:block">
        <Float delay={2} mouse={mouse} offset={15}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <path d="M60 10 C100 10, 115 30, 115 60 C115 90, 100 110, 60 110 C20 110, 5 90, 5 60 C5 30, 20 10, 60 10Z" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="4 4" fill="none" />
          </svg>
        </Float>
      </Doodle>

      {/* Doodle — wavy line bottom left */}
      <Doodle className="bottom-32 left-12 hidden md:block">
        <Float delay={0.3} mouse={mouse} offset={20}>
          <svg width="100" height="40" viewBox="0 0 100 40" fill="none">
            <path d="M0 20 Q12 5, 25 20 T50 20 T75 20 T100 20" stroke="rgba(255,255,255,0.06)" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </Float>
      </Doodle>

      {/* Doodle — dots bottom right */}
      <Doodle className="bottom-40 right-12 hidden md:block">
        <Float delay={1.2} mouse={mouse} offset={-30}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.08)" />
            <circle cx="30" cy="10" r="2" fill="rgba(255,255,255,0.08)" />
            <circle cx="50" cy="10" r="2" fill="rgba(255,255,255,0.08)" />
            <circle cx="10" cy="30" r="2" fill="rgba(255,255,255,0.08)" />
            <circle cx="30" cy="30" r="2" fill="rgba(255,255,255,0.08)" />
            <circle cx="50" cy="30" r="2" fill="rgba(255,255,255,0.08)" />
            <circle cx="10" cy="50" r="2" fill="rgba(255,255,255,0.08)" />
            <circle cx="30" cy="50" r="2" fill="rgba(255,255,255,0.08)" />
            <circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.08)" />
          </svg>
        </Float>
      </Doodle>

      {/* Doodle — arrow pointing to headline */}
      <Doodle className="top-[38%] right-[8%] hidden lg:block">
        <Float delay={0.5} mouse={mouse} offset={-15}>
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
            <path d="M5 45 L45 5 M45 5 L30 5 M45 5 L45 20" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </Float>
      </Doodle>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-xs font-medium text-zinc-400"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400/60" />
              <span className="relative inline-flex size-2 rounded-full bg-zinc-400" />
            </span>
            Community of {stats.members.toLocaleString()} creators
          </motion.div>

          {/* Oversized headline with cursor 3D tilt */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-balance text-5xl font-black leading-[1.1] tracking-tight text-zinc-100 md:text-7xl lg:text-8xl xl:text-9xl cursor-default"
            style={{
              transform: `perspective(1000px) rotateX(${(mouse.y / window.innerHeight - 0.5) * -4}deg) rotateY(${(mouse.x / window.innerWidth - 0.5) * 4}deg)`,
            }}
          >
            Where
            <br />
            <span className="relative inline-block">
              prompts
              <svg className="absolute -bottom-2 left-0 w-full h-3 md:h-4" viewBox="0 0 200 16" preserveAspectRatio="none" fill="none">
                <path d="M2 12 C30 2, 60 14, 100 10 C140 6, 170 14, 198 8" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </span>
            <br />
            find their home
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-lg text-pretty text-base text-zinc-500 md:text-lg"
          >
            A curated library of prompts, crafted by the community.
            Discover, share, and connect.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition-all duration-300"
            >
              Start exploring
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 transition-all duration-300"
            >
              Browse prompts
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8 pt-4"
          >
            <div className="text-center">
              <div className="text-xl font-bold text-zinc-100"><AnimatedNumber value={stats.prompts} /></div>
              <div className="text-xs text-zinc-600">prompts</div>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="text-center">
              <div className="text-xl font-bold text-zinc-100"><AnimatedNumber value={stats.categories} /></div>
              <div className="text-xs text-zinc-600">categories</div>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="text-center">
              <div className="text-xl font-bold text-zinc-100"><AnimatedNumber value={stats.members} /></div>
              <div className="text-xs text-zinc-600">members</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}


