import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, Bell, Check, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ToggleSwitch } from "@/components/toggle-switch";
import { useAuth } from "@/hooks/use-auth";
import { updateProfile } from "@/utils/supabase-server";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Settings — PromptOS" },
      { name: "description", content: "Manage your PromptOS account settings, profile, and preferences." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { profile, loading: authLoading, creatorMode, setCreatorMode } = useAuth();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    const res: any = await (updateProfile as any)({
      data: { username: username.trim(), full_name: fullName.trim(), bio: bio.trim() },
    });
    setSaving(false);
    if (!res?.error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Settings</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="space-y-6 rounded-xl bg-zinc-900/40 p-6 ring-1 ring-white/5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <User className="size-5 text-zinc-400" />
            <h2 className="text-sm font-medium text-zinc-200">Profile</h2>
          </div>
          {authLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-5 animate-spin text-zinc-500" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex h-10 w-full items-center gap-2 rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="flex h-10 w-full items-center gap-2 rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-lg bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 resize-none"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : saved ? (
                  <Check className="size-4 text-emerald-500" />
                ) : null}
                {saving ? "Saving..." : saved ? "Saved!" : "Save changes"}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6 rounded-xl bg-zinc-900/40 p-6 ring-1 ring-white/5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <User className="size-5 text-zinc-400" />
            <h2 className="text-sm font-medium text-zinc-200">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-200">Creator Mode</p>
              <p className="text-xs text-zinc-500">Show upload, dashboard, and creator tools</p>
            </div>
            <ToggleSwitch checked={creatorMode} onChange={setCreatorMode} />
          </div>
        </div>

        <div className="space-y-6 rounded-xl bg-zinc-900/40 p-6 ring-1 ring-white/5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Bell className="size-5 text-zinc-400" />
            <h2 className="text-sm font-medium text-zinc-200">Notifications</h2>
          </div>
          <div className="space-y-4">
            {["New followers", "Prompt likes", "Comments on my prompts", "New subscribers"].map(
              (item) => (
                <label key={item} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">{item}</span>
                  <input type="checkbox" defaultChecked className="size-4 accent-zinc-100" />
                </label>
              ),
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
