import { ArrowDownIcon, ArrowsClockwiseIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { containsFolder, folderKey } from "@/features/repository-folders/model";
import { useFolderLibrary } from "@/features/repository-folders/store";
import { presentError } from "@/lib/error-summary";
import {
  gitFetch,
  gitFetchRemote,
  gitPull,
  gitRemotes,
  gitStatus,
} from "@/lib/git/api";
import { useFetchStatusStore } from "@/lib/git/auto-fetch";
import { isOfflineNow } from "@/lib/offline-writes";
import { type RecentRepo, repoDisplayName } from "@/lib/settings/api";
import { useSettings } from "@/lib/settings/queries";
import { promotionBlocksCheckout } from "@/lib/stores/worktree-removal";
import { useBatchSync } from "./batch-sync-store";

type Result = {
  path: string;
  name: string;
  state: "pending" | "running" | "done" | "skipped" | "failed";
  detail?: string;
  fullError?: string;
};

function managedRepos(
  recents: RecentRepo[],
  entries: { path: string; name: string; repository: boolean }[],
  folder?: string,
): Result[] {
  const names = new Map(
    recents.map((repo) => [folderKey(repo.path), repoDisplayName(repo)]),
  );
  const paths = new Map<string, Result>();
  for (const repo of recents) {
    if (folder && !containsFolder(folder, repo.path)) continue;
    paths.set(folderKey(repo.path), {
      path: repo.path,
      name: repoDisplayName(repo),
      state: "pending",
    });
  }
  for (const entry of entries) {
    if (!entry.repository || (folder && !containsFolder(folder, entry.path)))
      continue;
    const key = folderKey(entry.path);
    if (!paths.has(key))
      paths.set(key, {
        path: entry.path,
        name: names.get(key) ?? entry.name,
        state: "pending",
      });
  }
  return [...paths.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function BatchSyncDialog() {
  const sequence = useBatchSync((state) => state.sequence);
  if (sequence === 0) return null;
  return <BatchSyncContent key={sequence} />;
}

function BatchSyncContent() {
  const { request, open, running, setOpen, setRunning } = useBatchSync();
  const settings = useSettings();
  const folders = useFolderLibrary();
  const client = useQueryClient();
  const markFetched = useFetchStatusStore((state) => state.markFetched);
  const [results, setResults] = useState<Result[] | null>(null);
  const [finished, setFinished] = useState(false);
  const [stopping, setStopping] = useState(false);
  const active = useRef(false);
  const stopRequested = useRef(false);
  const candidates = managedRepos(
    settings.data?.recentRepos ?? [],
    folders.data?.entries ?? [],
    request?.folder,
  );
  const rows = results ?? candidates;
  const completed = rows.filter(
    (row) => row.state !== "pending" && row.state !== "running",
  ).length;
  const failed = rows.filter((row) => row.state === "failed").length;
  const skipped = rows.filter((row) => row.state === "skipped").length;

  async function start() {
    if (!request || active.current || candidates.length === 0) return;
    if (isOfflineNow()) {
      toast.info("You're offline. Connect and try again.");
      return;
    }
    active.current = true;
    stopRequested.current = false;
    setRunning(true);
    setFinished(false);
    setStopping(false);
    const next = candidates.map((row) => ({ ...row }));
    setResults([...next]);
    const update = (
      index: number,
      state: Result["state"],
      detail?: string,
      fullError?: string,
    ) => {
      next[index] = { ...next[index], state, detail, fullError };
      setResults([...next]);
    };
    for (let index = 0; index < next.length; index++) {
      const repo = next[index];
      if (stopRequested.current) {
        update(index, "skipped", "Stopped before this repository.");
        continue;
      }
      update(index, "running");
      try {
        if (isOfflineNow()) {
          update(
            index,
            "skipped",
            "Connection lost. Retry this batch when online.",
          );
          continue;
        }
        const remotes = await gitRemotes(repo.path);
        if (remotes.length === 0) {
          update(index, "skipped", "No remote configured.");
          continue;
        }
        if (request.mode === "pull") {
          const before = await gitStatus(repo.path);
          const head = before.branch;
          if (head.detached || !head.name) {
            update(index, "skipped", "Check out a branch before pulling.");
            continue;
          }
          if (!head.oid) {
            update(index, "skipped", "The current branch has no commits yet.");
            continue;
          }
          if (!head.upstream || head.upstreamGone) {
            update(
              index,
              "skipped",
              "The current branch has no available upstream.",
            );
            continue;
          }
          const remote = remotes
            .filter((name) => head.upstream?.startsWith(`${name}/`))
            .sort((a, b) => b.length - a.length)[0];
          if (!remote) {
            update(
              index,
              "skipped",
              "The branch's upstream remote is unavailable.",
            );
            continue;
          }
          await gitFetchRemote(repo.path, remote);
          if (remote === "origin") markFetched(repo.path);
          const status = await gitStatus(repo.path);
          const current = status.branch;
          if (
            current.name !== head.name ||
            current.upstream !== head.upstream
          ) {
            update(
              index,
              "skipped",
              "The current branch changed during this batch.",
            );
            continue;
          }
          if (current.upstreamGone) {
            update(
              index,
              "skipped",
              "The upstream branch is no longer available.",
            );
            continue;
          }
          if (current.ahead > 0 && current.behind > 0) {
            update(
              index,
              "skipped",
              "Branches diverged. Resolve this repository individually.",
            );
            continue;
          }
          if (current.behind === 0) {
            update(index, "done", "Already up to date.");
            continue;
          }
          if (status.entries.length > 0) {
            update(
              index,
              "skipped",
              "Uncommitted changes. Commit or stash them first.",
            );
            continue;
          }
          if (promotionBlocksCheckout(repo.path)) {
            update(
              index,
              "skipped",
              "A worktree operation is still in progress.",
            );
            continue;
          }
          await gitPull(repo.path, "ffOnly");
        } else {
          if (remotes.includes("origin")) {
            await gitFetchRemote(repo.path, "origin");
            markFetched(repo.path);
          } else {
            await gitFetch(repo.path);
          }
        }
        update(index, "done", request.mode === "pull" ? "Pulled." : "Fetched.");
      } catch (error) {
        const presentation = presentError(error);
        update(index, "failed", presentation.summary, presentation.fullText);
      } finally {
        void client.invalidateQueries({ queryKey: ["repo", repo.path] });
      }
    }
    active.current = false;
    setRunning(false);
    setFinished(true);
    const count = next.filter((row) => row.state === "done").length;
    const skippedCount = next.filter((row) => row.state === "skipped").length;
    const failedCount = next.filter((row) => row.state === "failed").length;
    toast(
      failedCount || skippedCount
        ? "Repository sync needs attention"
        : "Repository sync complete",
      {
        description: `${count} completed · ${skippedCount} skipped · ${failedCount} failed`,
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {request?.mode === "pull"
              ? "Pull repositories"
              : "Fetch repositories"}
          </DialogTitle>
          <DialogDescription>
            {request?.folder
              ? `In ${request.folderName ?? request.folder}. `
              : "All managed repositories. "}
            {request?.mode === "pull"
              ? "Fetch each current branch's upstream, then fast-forward it. Repositories needing attention are skipped."
              : "Fetch each origin (or Git's default remote) and update remote-tracking branches. Local files are untouched."}
          </DialogDescription>
        </DialogHeader>
        {(settings.isError ||
          folders.isError ||
          Boolean(folders.data?.warnings.length)) && (
          <p role="alert" className="text-xs text-warning">
            {settings.isError || folders.isError
              ? "The repository library could not be loaded. Refresh and try again."
              : "Some folders could not be scanned. Their repositories may be missing from this batch."}
          </p>
        )}
        <div className="text-xs text-muted-foreground" aria-live="polite">
          {running
            ? `${completed} of ${rows.length} checked`
            : finished
              ? `${completed} checked · ${skipped} skipped · ${failed} failed`
              : `${rows.length} repositories selected`}
        </div>
        <div
          className="max-h-72 overflow-y-auto border"
          role="list"
          aria-label="Repository sync results"
        >
          {rows.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">
              No repositories in this selection.
            </p>
          ) : (
            rows.map((row) => (
              <div
                key={row.path}
                role="listitem"
                className="flex items-start gap-2 border-b px-3 py-2 text-xs last:border-b-0"
              >
                {row.state === "running" ? (
                  <Spinner className="mt-0.5 size-3.5" />
                ) : row.state === "done" ? (
                  <span className="text-success">✓</span>
                ) : row.state === "failed" ? (
                  <span className="text-destructive">!</span>
                ) : row.state === "skipped" ? (
                  <span className="text-warning">−</span>
                ) : (
                  <span className="text-muted-foreground">·</span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium" title={row.path}>
                    {row.name}
                  </div>
                  <span className="sr-only">{row.state}</span>
                  {row.detail && (
                    <div
                      className={
                        row.state === "failed"
                          ? "break-words text-destructive"
                          : "text-muted-foreground"
                      }
                    >
                      {row.detail}
                    </div>
                  )}
                  {row.state === "failed" &&
                    row.fullError &&
                    row.fullError !== row.detail && (
                      <details className="mt-1 text-muted-foreground">
                        <summary className="cursor-pointer">Details</summary>
                        <pre className="mt-1 max-h-36 overflow-auto whitespace-pre-wrap break-words text-[11px]">
                          {row.fullError}
                        </pre>
                      </details>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {running ? "Hide" : "Close"}
          </Button>
          {running && (
            <Button
              variant="outline"
              disabled={stopping}
              onClick={() => {
                stopRequested.current = true;
                setStopping(true);
              }}
            >
              {stopping ? "Stopping…" : "Stop after current"}
            </Button>
          )}
          {!running && !finished && (
            <Button
              disabled={
                rows.length === 0 ||
                settings.isPending ||
                folders.isPending ||
                settings.isError ||
                folders.isError
              }
              onClick={() => void start()}
            >
              {request?.mode === "pull" ? (
                <ArrowDownIcon />
              ) : (
                <ArrowsClockwiseIcon />
              )}
              {request?.mode === "pull" ? "Pull" : "Fetch"} {rows.length}{" "}
              {rows.length === 1 ? "repository" : "repositories"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
