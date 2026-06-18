import { Link, Outlet, useRouter } from "@tanstack/react-router";
import { LayoutDashboard, FileText, FolderOpen, Settings, LogOut, ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { ReactNode } from "react";

const sidebarLinks = (creatorMode: boolean) => [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
  ...(creatorMode
    ? [
        {
          to: "/dashboard/creator" as const,
          icon: FileText as typeof FileText,
          label: "Creator Dashboard",
        },
      ]
    : []),
  { to: "/dashboard/collections", icon: FolderOpen, label: "Collections" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function DashboardLayout({ children }: { children?: ReactNode }) {
  const { profile, signOut, creatorMode } = useAuth();
  const router = useRouter();

  return (
    <div className="flex min-h-screen hero-radial">
      <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-zinc-950/40 lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center gap-2 border-b border-white/5 px-6">
            <Link to="/" className="flex items-center gap-2">
              <ChevronLeft className="size-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-400">Back</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {sidebarLinks(creatorMode).map((link) => (
              <Link
                key={link.to}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                to={link.to as any}
                activeOptions={{ exact: link.exact }}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-200"
                activeProps={{ className: "bg-zinc-800/50 text-zinc-100" }}
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-white/5 p-4">
            <button
              onClick={() => {
                signOut();
                router.navigate({ to: "/" });
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">{children || <Outlet />}</div>
      </main>
    </div>
  );
}
