function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800/60 ${className ?? ""}`} />;
}

export function SkeletonPromptCard() {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3">
      <SkeletonBlock className="aspect-[4/3] w-full rounded-lg" />
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="h-3 w-12" />
        </div>
        <SkeletonBlock className="h-3.5 w-3/4" />
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-2/3" />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-2">
        <div className="flex items-center gap-1.5">
          <SkeletonBlock className="size-4 rounded-full" />
          <SkeletonBlock className="h-3 w-16" />
        </div>
        <SkeletonBlock className="h-3 w-8" />
      </div>
    </div>
  );
}

export function SkeletonCategoryCard() {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5">
      <SkeletonBlock className="size-10 rounded-lg" />
      <SkeletonBlock className="mt-4 h-4 w-24" />
      <SkeletonBlock className="mt-2 h-3 w-32" />
    </div>
  );
}

export function SkeletonDiscussionCard() {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="size-8 rounded-full" />
        <div className="flex-1">
          <SkeletonBlock className="h-4 w-3/4" />
          <SkeletonBlock className="mt-1.5 h-3 w-1/3" />
        </div>
      </div>
      <SkeletonBlock className="mt-3 h-3 w-full" />
      <SkeletonBlock className="mt-1.5 h-3 w-5/6" />
      <div className="mt-3 flex items-center gap-4">
        <SkeletonBlock className="h-3 w-12" />
        <SkeletonBlock className="h-3 w-12" />
        <SkeletonBlock className="h-3 w-12" />
      </div>
    </div>
  );
}

export function SkeletonBattleCard() {
  return (
    <div className="rounded-xl bg-zinc-900/40 p-6 ring-1 ring-white/5">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-3 w-16" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-zinc-800/40 p-4">
          <SkeletonBlock className="aspect-video w-full rounded-md" />
          <SkeletonBlock className="mt-3 h-3.5 w-3/4" />
          <SkeletonBlock className="mt-1.5 h-3 w-1/2" />
        </div>
        <div className="rounded-lg bg-zinc-800/40 p-4">
          <SkeletonBlock className="aspect-video w-full rounded-md" />
          <SkeletonBlock className="mt-3 h-3.5 w-3/4" />
          <SkeletonBlock className="mt-1.5 h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-6">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-3 w-16" />
      </div>
    </div>
  );
}

export function SkeletonLeaderboardCard() {
  return (
    <div className="rounded-xl bg-zinc-900/40 ring-1 ring-white/5">
      <div className="border-b border-white/5 px-6 py-4">
        <SkeletonBlock className="h-4 w-28" />
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <SkeletonBlock className="size-7 rounded-full" />
            <SkeletonBlock className="size-8 rounded-full" />
            <div className="flex-1">
              <SkeletonBlock className="h-3.5 w-28" />
              <SkeletonBlock className="mt-1 h-3 w-20" />
            </div>
            <SkeletonBlock className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
