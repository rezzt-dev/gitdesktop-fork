import { useState } from "react";
import {
  RemoveRepoDialog,
  RepoAliasDialog,
} from "@/features/repository/RepoDialogs";
import { RepoList } from "@/features/repository/RepoList";
import type { RecentRepo } from "@/lib/settings/api";
import { useSettings } from "@/lib/settings/queries";

export function RecentRepoList() {
  const settings = useSettings();
  const recents = settings.data?.recentRepos ?? [];
  const [aliasTarget, setAliasTarget] = useState<RecentRepo | null>(null);
  const [removeTarget, setRemoveTarget] = useState<RecentRepo | null>(null);

  return (
    // Fills its parent: the Welcome sizes this column to the actions column, so the
    // box takes whatever the heading leaves and the list scrolls inside it.
    <div className="flex h-full min-w-0 flex-col gap-2">
      <div className="flex shrink-0 items-baseline justify-between gap-2 px-1">
        <h2 className="font-heading text-sm font-medium">Repositories</h2>
        {recents.length > 0 && (
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {recents.length}
          </span>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border">
        <RepoList
          fill
          onAliasRepo={setAliasTarget}
          onRemoveRepo={setRemoveTarget}
        />
      </div>
      <RepoAliasDialog
        key={aliasTarget?.path ?? "none"}
        repo={aliasTarget}
        onClose={() => setAliasTarget(null)}
      />
      <RemoveRepoDialog
        repo={removeTarget}
        onClose={() => setRemoveTarget(null)}
      />
    </div>
  );
}
