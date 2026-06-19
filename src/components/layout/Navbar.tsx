import { Link, useRouter } from "@tanstack/react-router";
import { Plus, Sparkles, Menu, X, Bell, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "./ThemeToggle";
import logoSrc from "@/assets/logo.png";

const NAV_ITEMS = [
  { to: "/explore", label: "Marketplace" },
  { to: "/categories", label: "Categories" },
  { to: "/community", label: "Community" },
  { to: "/battle", label: "Battles" },
  { to: "/optimizer", label: "Optimizer" },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, profile, signOut, creatorMode, setCreatorMode } = useAuth();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const currentPath = router.state.location.pathname;

  function isActive(to: string) {
    if (to === "/explore") return currentPath === "/explore";
    return currentPath.startsWith(to);
  }

  async function handleSignOut() {
    setUserMenuOpen(false);
    await signOut();
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Left */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logoSrc} alt="PromptOS" className="size-15 rounded" />
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40 ${
                    active
                      ? "text-zinc-100 bg-zinc-800/60"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              {creatorMode && (
                <>
                  <Link
                    to="/notifications"
                    className="hidden sm:grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all"
                    aria-label="Notifications"
                  >
                    <Bell className="size-4" />
                  </Link>
                  <Link
                    to="/dashboard/creator/upload"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:opacity-90 transition-all"
                  >
                    <Plus className="size-3.5" />
                    Post prompt
                  </Link>
                </>
              )}
              {/* User menu */}
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800/60 transition-all"
                >
                  <div className="size-6 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 ring-1 ring-white/10 flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-300">
                        {(profile?.username || user.email || "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {profile?.username || user.email?.split("@")[0]}
                  </span>
                  <ChevronDown className={`size-3 text-zinc-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 shadow-2xl shadow-black/50">
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      <LayoutDashboard className="size-3.5" />
                      Dashboard
                    </Link>
                    {creatorMode && (
                      <Link
                        to="/dashboard/creator/upload"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors sm:hidden"
                      >
                        <Plus className="size-3.5" />
                        Post prompt
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <LogOut className="size-3.5" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="hidden sm:inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/auth/register"
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:opacity-90 transition-all"
              >
                <Sparkles className="size-3.5" />
                Get started
              </Link>
            </>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-zinc-800/50 bg-zinc-950/95 px-4 py-4 md:hidden backdrop-blur-xl">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "text-zinc-100 bg-zinc-800/60"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {user && (
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 transition-all"
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
