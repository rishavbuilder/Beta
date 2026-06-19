import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { User, Bell, Check, Palette, Mail, Link, Globe, Github, Lock, Trash2, Camera, ArrowUpRight, ExternalLink } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ToggleSwitch } from "@/components/toggle-switch";
import { useAuth } from "@/hooks/use-auth";
import { updateProfile, uploadImage } from "@/utils/supabase-server";
import { getSupabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

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
  const { profile, user, loading: authLoading, creatorMode, setCreatorMode, refreshProfile } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  async function handleAvatarUpload(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setAvatarPreview(base64);
      const res: any = await (uploadImage as any)({
        data: { base64, fileName: file.name },
      });
      if (res?.url) {
        await (updateProfile as any)({
          data: { avatar_url: res.url },
        });
        refreshProfile();
      }
      setUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    const res: any = await (updateProfile as any)({
      data: {
        username: username.trim(),
        full_name: fullName.trim(),
        bio: bio.trim(),
      },
    });
    setSaving(false);
    if (!res?.error) {
      setSaved(true);
      refreshProfile();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    setChangingPassword(true);
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordError("Failed to update password");
    }
    setChangingPassword(false);
  }

  async function handleDeleteAccount() {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.rpc("delete_user");
      if (error) {
        await supabase.from("users").delete().eq("id", user!.id);
      }
      await supabase.auth.signOut();
      router.navigate({ to: "/" });
    } catch {
      /* ignore */
    }
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "";

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text">Settings</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Manage your account settings and preferences.
          </p>
        </div>

        {authLoading ? (
          <div className="flex justify-center py-20">
            <svg className="size-6 animate-spin text-zinc-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 5.373 0 12 4z" />
            </svg>
          </div>
        ) : (
          <>
            {/* Profile */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-zinc-800/50 px-5 py-4">
                <div className="size-8 rounded-lg bg-zinc-800/80 flex items-center justify-center ring-1 ring-white/5">
                  <User className="size-4 text-zinc-400" />
                </div>
                <h2 className="text-sm font-medium text-zinc-200">Profile</h2>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <div className="size-16 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 ring-2 ring-white/10 flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="size-full object-cover" />
                      ) : profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="size-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-zinc-300">
                          {(profile?.username || "U").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {uploadingAvatar ? (
                        <svg className="size-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 5.373 0 12 4z" />
                        </svg>
                      ) : (
                        <Camera className="size-5 text-white" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleAvatarUpload(file);
                        }
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-200">{profile?.username || "User"}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Click avatar to change</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="flex h-10 w-full items-center gap-2 rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="flex h-10 w-full items-center gap-2 rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    maxLength={280}
                    className="flex w-full rounded-lg bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 resize-none transition-all"
                  />
                  <p className="mt-1 text-right text-[10px] text-zinc-600">{bio.length}/280</p>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {saving ? (
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 5.373 0 12 4z" />
                    </svg>
                  ) : saved ? (
                    <Check className="size-4 text-emerald-500" />
                  ) : null}
                  {saving ? "Saving..." : saved ? "Saved!" : "Save changes"}
                </button>
              </div>
            </div>

            {/* Account */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-zinc-800/50 px-5 py-4">
                <div className="size-8 rounded-lg bg-zinc-800/80 flex items-center justify-center ring-1 ring-white/5">
                  <Mail className="size-4 text-zinc-400" />
                </div>
                <h2 className="text-sm font-medium text-zinc-200">Account</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-900/60">
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500">Email</p>
                    <p className="text-sm text-zinc-200 mt-0.5">{user?.email || "—"}</p>
                  </div>
                  <div className="size-2 rounded-full bg-emerald-500/60" title="Verified" />
                </div>
                {memberSince && (
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-900/60">
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-500">Member since</p>
                      <p className="text-sm text-zinc-200 mt-0.5">{memberSince}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-zinc-800/50 px-5 py-4">
                <div className="size-8 rounded-lg bg-zinc-800/80 flex items-center justify-center ring-1 ring-white/5">
                  <Link className="size-4 text-zinc-400" />
                </div>
                <h2 className="text-sm font-medium text-zinc-200">Social Links</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 pointer-events-none" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yoursite.com"
                    className="flex h-10 w-full rounded-lg bg-zinc-900/60 pl-10 pr-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all"
                  />
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="@username"
                    className="flex h-10 w-full rounded-lg bg-zinc-900/60 pl-10 pr-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all"
                  />
                </div>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="username"
                    className="flex h-10 w-full rounded-lg bg-zinc-900/60 pl-10 pr-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-zinc-800/50 px-5 py-4">
                <div className="size-8 rounded-lg bg-zinc-800/80 flex items-center justify-center ring-1 ring-white/5">
                  <Palette className="size-4 text-zinc-400" />
                </div>
                <h2 className="text-sm font-medium text-zinc-200">Appearance</h2>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">Creator Mode</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Show upload, dashboard, and creator tools</p>
                  </div>
                  <ToggleSwitch checked={creatorMode} onChange={setCreatorMode} />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-zinc-800/50 px-5 py-4">
                <div className="size-8 rounded-lg bg-zinc-800/80 flex items-center justify-center ring-1 ring-white/5">
                  <Bell className="size-4 text-zinc-400" />
                </div>
                <h2 className="text-sm font-medium text-zinc-200">Notifications</h2>
              </div>
              <div className="p-5 space-y-1">
                {[
                  { label: "New followers", desc: "When someone follows your profile" },
                  { label: "Prompt likes", desc: "When someone likes your prompt" },
                  { label: "Comments", desc: "When someone comments on your prompt" },
                  { label: "New subscribers", desc: "When someone subscribes to your content" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-zinc-800/20 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-300">{item.label}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">{item.desc}</p>
                    </div>
                    <div className="relative shrink-0">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="peer size-4 appearance-none rounded border border-zinc-700 bg-zinc-800 checked:border-zinc-400 checked:bg-zinc-100 transition-all cursor-pointer"
                      />
                      <svg
                        className="absolute inset-0 size-4 p-0.5 text-zinc-950 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Change Password */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-zinc-800/50 px-5 py-4">
                <div className="size-8 rounded-lg bg-zinc-800/80 flex items-center justify-center ring-1 ring-white/5">
                  <Lock className="size-4 text-zinc-400" />
                </div>
                <h2 className="text-sm font-medium text-zinc-200">Change Password</h2>
              </div>
              <form onSubmit={handleChangePassword} className="p-5 space-y-4">
                {passwordError && (
                  <div className="rounded-lg bg-red-500/10 px-4 py-2.5 text-xs text-red-400 ring-1 ring-red-500/20 flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-red-400 shrink-0" />
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="rounded-lg bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-400 ring-1 ring-emerald-500/20 flex items-center gap-2">
                    <Check className="size-3.5 shrink-0" />
                    Password updated successfully
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="flex h-10 w-full rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="flex h-10 w-full rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={changingPassword || !newPassword || !confirmPassword}
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {changingPassword ? (
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 5.373 0 12 4z" />
                    </svg>
                  ) : null}
                  {changingPassword ? "Updating..." : "Update password"}
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-red-500/10 px-5 py-4">
                <div className="size-8 rounded-lg bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20">
                  <Trash2 className="size-4 text-red-400" />
                </div>
                <h2 className="text-sm font-medium text-red-400">Danger Zone</h2>
              </div>
              <div className="p-5">
                <p className="text-sm text-zinc-400 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-400 ring-1 ring-red-500/20 hover:bg-red-500/20 transition-all"
                >
                  <Trash2 className="size-4" />
                  Delete account
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={(o) => { if (!o) { setShowDeleteDialog(false); setDeleteConfirm(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All your prompts, collections, and data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 pb-2">
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Type <span className="text-red-400 font-mono">delete</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="delete"
              className="flex h-10 w-full rounded-lg bg-zinc-800 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-red-400/40 transition-all"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowDeleteDialog(false); setDeleteConfirm(""); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteConfirm !== "delete"}
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              Delete account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
