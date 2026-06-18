import { Link, useRouter } from "@tanstack/react-router";
import { Plus, Sparkles, Menu, X, Bell, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "./ThemeToggle";
import logoSrc from "@/assets/logo.png";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut, creatorMode, setCreatorMode } = useAuth();
  const router = useRouter();

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
              activeProps={{ className: "text-zinc-100" }}
            >
              Marketplace
            </Link>
            <Link
              to="/categories"
              className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100"
              activeProps={{ className: "text-zinc-100" }}
            >
              Categories
            </Link>
            <Link
              to="/community"
              className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100"
              activeProps={{ className: "text-zinc-100" }}
            >
              Community
            </Link>
            <Link
              to="/battle"
              className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100"
              activeProps={{ className: "text-zinc-100" }}
            >
              Battles
            </Link>
            <Link
              to="/optimizer"
              className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100"
              activeProps={{ className: "text-zinc-100" }}
            >
              Optimizer
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              {creatorMode && (
                <>
                  <Link
                    to="/notifications"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                  >
                    <Bell className="size-3.5" />
                  </Link>
                  <Link
                    to="/dashboard/creator/upload"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 ring-1 ring-zinc-100 transition hover:opacity-90"
                  >
                    <Plus className="size-3.5" />
                    Post prompt
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                  >
                    <User className="size-3.5" />
                    <span className="hidden sm:inline">
                      {profile?.username || user.email?.split("@")[0]}
                    </span>
                  </Link>
                </>
              )}
              {!creatorMode && (
                <span className="hidden sm:block text-xs text-zinc-500">
                  {profile?.username || user.email?.split("@")[0]}
                </span>
              )}
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="hidden sm:inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/auth/register"
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 ring-1 ring-zinc-100 transition hover:opacity-90"
              >
                <Sparkles className="size-3.5" />
                Get started
              </Link>
            </>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-zinc-400 hover:text-zinc-100"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-white/5 bg-zinc-950/95 px-6 py-4 md:hidden backdrop-blur">
          <div className="flex flex-col gap-3">
            <Link
              to="/explore"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-zinc-300"
            >
              Marketplace
            </Link>
            <Link
              to="/categories"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-zinc-300"
            >
              Categories
            </Link>
            <Link
              to="/community"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-zinc-300"
            >
              Community
            </Link>
            <Link
              to="/battle"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-zinc-300"
            >
              Battles
            </Link>
            <Link
              to="/optimizer"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-zinc-300"
            >
              Optimizer
            </Link>
            {user && (
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="text-sm text-zinc-300"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
