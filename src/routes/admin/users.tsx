import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Shield, Ban, MoreHorizontal } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management — PromptOS Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminUsersPage,
});

const users = [
  {
    id: "u1",
    name: "Aria Chen",
    email: "aria@example.com",
    role: "Creator",
    status: "Active",
    prompts: 24,
    joined: "Jan 2026",
  },
  {
    id: "u2",
    name: "Marcus Vega",
    email: "marcus@example.com",
    role: "Creator",
    status: "Active",
    prompts: 18,
    joined: "Jan 2026",
  },
  {
    id: "u3",
    name: "Sana Patel",
    email: "sana@example.com",
    role: "User",
    status: "Active",
    prompts: 6,
    joined: "Feb 2026",
  },
  {
    id: "u4",
    name: "Kenji Tanaka",
    email: "kenji@example.com",
    role: "Creator",
    status: "Suspended",
    prompts: 12,
    joined: "Jan 2026",
  },
  {
    id: "u5",
    name: "Nova Kim",
    email: "nova@example.com",
    role: "Admin",
    status: "Active",
    prompts: 8,
    joined: "Dec 2025",
  },
];

function AdminUsersPage() {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? users.filter((u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      )
    : users;

  return (
    <div className="min-h-screen hero-radial">
      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-zinc-950/40 lg:block">
          <div className="flex h-14 items-center border-b border-white/5 px-6">
            <Link to="/admin" className="flex items-center gap-2">
              <Shield className="size-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-200">Admin</span>
            </Link>
          </div>
          <nav className="space-y-1 p-4">
            {[
              { to: "/admin/users", label: "Users", icon: Search },
              { to: "/admin/prompts", label: "Prompts", icon: Search },
            ].map((link) => (
              <Link
                key={link.to}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                to={link.to as any}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-200"
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-100">Users</h1>
                <p className="text-sm text-zinc-500">Manage platform users</p>
              </div>
              <div className="flex h-10 items-center gap-2 rounded-lg bg-zinc-900/60 px-3 ring-1 ring-white/10">
                <Search className="size-4 text-zinc-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-48 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                  aria-label="Search users"
                />
              </div>
            </div>
            <div className="rounded-xl bg-zinc-900/40 ring-1 ring-white/5 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-zinc-500">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Prompts</th>
                    <th className="px-6 py-3 font-medium">Joined</th>
                    <th className="px-6 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-zinc-600">
                        No users found matching "{query}"
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => (
                      <tr key={u.id} className="text-zinc-300">
                        <td className="px-6 py-4 font-medium">{u.name}</td>
                        <td className="px-6 py-4 text-zinc-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                              u.role === "Admin"
                                ? "bg-purple-500/10 text-purple-400"
                                : u.role === "Creator"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-zinc-500/10 text-zinc-400"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`flex items-center gap-1.5 ${
                              u.status === "Active" ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                u.status === "Active" ? "bg-emerald-400" : "bg-red-400"
                              }`}
                            />
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500">{u.prompts}</td>
                        <td className="px-6 py-4 text-zinc-500">{u.joined}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => alert("User actions coming soon")}
                            className="text-zinc-500 hover:text-zinc-200"
                            aria-label="User actions"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
