import { useQueryClient } from "@tanstack/react-query";
import { open as pickDirectory } from "@tauri-apps/plugin-dialog";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { usePlanStore } from "@/features/plan/store";
import { useOpenRepoByPath } from "@/features/repository/useOpenRepoByPath";
import { useResearchStore } from "@/features/research/store";
import { CloneRepoDialog } from "@/features/welcome/CloneRepoDialog";
import { CreateRepoDialog } from "@/features/welcome/CreateRepoDialog";
import { openWithDefault } from "@/lib/git/api";
import { migrateRepoData } from "@/lib/repo-data-migration";
import { scriptsKeys } from "@/lib/scripts/queries";
import {
  importRecentRepos,
  loadSettings,
  relocateRecentRepo,
} from "@/lib/settings/api";
import { settingsKeys } from "@/lib/settings/queries";
import { useConfirm } from "@/lib/stores/confirm";
import { useUiStore } from "@/lib/stores/ui";
import { invoke } from "@/lib/tauri/invoke";
import { toastError } from "@/lib/toast";
import { FolderTree } from "./FolderTree";
import {
  containsFolder,
  type FolderEntry,
  type FolderScan,
  folderParent,
  rebaseFolder,
} from "./model";
import {
  addLibraryRoot,
  changeLibrary,
  foldersKey,
  scanFolder,
  useFolderLibrary,
} from "./store";

export function FolderManager({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Repository folders</DialogTitle>
          <DialogDescription>
            Keep the same folders in GitDesktop and on your computer.
          </DialogDescription>
        </DialogHeader>
        {open && <ManagerContent onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function ManagerContent({ onClose }: { onClose: () => void }) {
  const client = useQueryClient();
  const openRepo = useOpenRepoByPath();
  const library = useFolderLibrary();
  const [selected, setSelected] = useState<FolderEntry | null>(null);
  const [preview, setPreview] = useState<FolderScan | null>(null);
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const [edit, setEdit] = useState<"create" | "rename" | null>(null);
  const [name, setName] = useState("");
  const [cloneOpen, setCloneOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  async function refresh() {
    await Promise.all([
      client.invalidateQueries({ queryKey: foldersKey }),
      client.invalidateQueries({ queryKey: settingsKeys.settings }),
    ]);
  }
  async function run(action: () => Promise<void>) {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    try {
      await action();
    } catch (error) {
      toastError(error);
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  async function chooseImport() {
    await run(async () => {
      const path = await pickDirectory({
        directory: true,
        title: "Import repository folder",
      });
      if (typeof path === "string") setPreview(await scanFolder(path));
    });
  }
  async function importFolder() {
    const scan = preview;
    if (!scan) return;
    await run(async () => {
      await importRecentRepos(scan.entries.filter((entry) => entry.repository));
      await addLibraryRoot(scan.root);
      await refresh();
      setPreview(null);
      toast.success(
        "Folder imported. Existing repositories and aliases were preserved.",
      );
    });
  }
  async function move(target: FolderEntry, parent: string, newName: string) {
    const active = useUiStore.getState().repoPath;
    if (
      (active && containsFolder(target.path, active)) ||
      client.isMutating() > 0
    ) {
      throw new Error(
        "Close repositories inside this folder and wait for running operations before moving it.",
      );
    }
    if (
      !(await useConfirm.getState().ask({
        title: `Move ${target.name}?`,
        body: `This changes the folder on disk to ${parent}/${newName}. Close editors and terminals using it before continuing.`,
        confirmLabel: "Move folder",
        scope: "app",
      }))
    )
      return;
    const current = useUiStore.getState().repoPath;
    if (
      (current && containsFolder(target.path, current)) ||
      client.isMutating() > 0
    )
      throw new Error(
        "A repository became active. Close it before moving the folder.",
      );
    const recorded = (await loadSettings()).recentRepos;
    const newPath = await invoke<string>("repository_folder_move", {
      path: target.path,
      parent,
      name: newName,
    });
    // Once the filesystem move lands, always repoint the library, even if metadata migration fails.
    const failures: string[] = [];
    for (const repo of recorded) {
      if (!containsFolder(target.path, repo.path)) continue;
      const destination = rebaseFolder(repo.path, target.path, newPath);
      try {
        await relocateRecentRepo(repo.path, destination);
        await migrateRepoData(repo.path, destination);
        usePlanStore.getState().relocateRepoPath(repo.path, destination);
        useResearchStore.getState().relocateRepoPath(repo.path, destination);
      } catch {
        failures.push(repo.name);
      }
    }
    await changeLibrary((value) => ({
      roots: value.roots.map((root) =>
        rebaseFolder(root, target.path, newPath),
      ),
      collapsed: value.collapsed.map((path) =>
        rebaseFolder(path, target.path, newPath),
      ),
    }));
    await addLibraryRoot(newPath);
    setSelected(null);
    setEdit(null);
    await refresh();
    await client.resetQueries({ queryKey: scriptsKeys.config });
    await client.invalidateQueries();
    if (failures.length)
      throw new Error(
        `Folder moved to ${newPath}, but some saved paths need repair: ${failures.join(", ")}. Use Locate on those repositories.`,
      );
    toast.success("Folder moved");
  }
  async function saveName() {
    const target = selected;
    if (!target) return;
    await run(async () => {
      if (edit === "create") {
        await invoke("repository_folder_create", { parent: target.path, name });
        await changeLibrary((value) => ({
          ...value,
          collapsed: value.collapsed.filter((path) => path !== target.path),
        }));
        setEdit(null);
        await refresh();
        toast.success("Folder created");
      } else {
        const parent = folderParent(target.path);
        await move(target, parent, name);
      }
    });
  }
  const targetIsFolder = selected && !selected.repository;
  const repositories =
    preview?.entries.filter((entry) => entry.repository) ?? [];
  return (
    <div className="flex min-h-0 flex-col gap-3" aria-busy={busy}>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={busy} onClick={() => void chooseImport()}>
          Import folder…
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => void run(refresh)}
        >
          Refresh
        </Button>
      </div>
      {preview ? (
        <div className="flex flex-col gap-3 border p-3">
          <p className="break-all text-xs">{preview.root}</p>
          <p className="text-xs">
            {repositories.length} repositories found. Their folder structure
            will be preserved. Files stay in their current locations.
          </p>
          <div className="max-h-36 overflow-auto text-xs">
            {repositories.map((repo) => (
              <p className="truncate py-1" title={repo.path} key={repo.path}>
                {repo.path.slice(preview.root.length + 1) || repo.name}
              </p>
            ))}
          </div>
          <ScanWarnings warnings={preview.warnings} />
          <p className="text-xs text-muted-foreground">
            Symbolic links and contents inside repositories are not scanned.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={busy || preview.entries.length === 0}
              onClick={() => void importFolder()}
            >
              Import {repositories.length} repositories
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => setPreview(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="border">
          <FolderTree
            selectedPath={selected?.path}
            onSelect={(entry) => {
              setSelected(entry);
              setEdit(null);
            }}
            onOpened={onClose}
            disabled={busy}
          />
        </div>
      )}
      <ScanWarnings warnings={library.data?.warnings ?? []} />
      {selected && !preview && (
        <div className="flex flex-col gap-3 border-t pt-3">
          <p className="break-all text-xs text-muted-foreground">
            {selected.path}
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.repository && (
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    if (await openRepo(selected.path, "recent")) onClose();
                  })
                }
              >
                Open repository
              </Button>
            )}
            {targetIsFolder && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setName("");
                    setEdit("create");
                  }}
                >
                  New folder
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => setCreateOpen(true)}
                >
                  Create repository…
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => setCloneOpen(true)}
                >
                  Clone here…
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setName(selected.name);
                setEdit("rename");
              }}
            >
              Rename
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const parent = await pickDirectory({
                    directory: true,
                    title: "Move to folder",
                  });
                  if (typeof parent === "string")
                    await move(selected, parent, selected.name);
                })
              }
            >
              Move to…
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await openWithDefault(selected.path);
                })
              }
            >
              Show in file manager
            </Button>
            {targetIsFolder && (
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    if (
                      !(await useConfirm.getState().ask({
                        title: `Delete ${selected.name}?`,
                        body: "Only an empty folder can be deleted. Files and repositories prevent deletion.",
                        confirmLabel: "Delete empty folder",
                        confirmVariant: "destructive",
                        scope: "app",
                      }))
                    )
                      return;
                    await invoke("repository_folder_delete_empty", {
                      path: selected.path,
                    });
                    await changeLibrary((value) => ({
                      roots: value.roots.filter(
                        (root) => root !== selected.path,
                      ),
                      collapsed: value.collapsed.filter(
                        (path) => !containsFolder(selected.path, path),
                      ),
                    }));
                    setSelected(null);
                    await refresh();
                    toast.success("Empty folder deleted");
                  })
                }
              >
                Delete empty folder
              </Button>
            )}
            {library.data?.roots.includes(selected.path) && (
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await changeLibrary((value) => ({
                      ...value,
                      roots: value.roots.filter(
                        (root) => root !== selected.path,
                      ),
                    }));
                    setSelected(null);
                    await refresh();
                    toast.success(
                      "Folder removed from this view. Files remain on disk.",
                    );
                  })
                }
              >
                Remove from folders
              </Button>
            )}
          </div>
          {edit && (
            <form
              className="flex items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void saveName();
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="folder-name">
                    {edit === "create" ? "New folder name" : "Folder name"}
                  </FieldLabel>
                  <Input
                    id="folder-name"
                    autoFocus
                    value={name}
                    disabled={busy}
                    onChange={(event) => setName(event.target.value)}
                  />
                </Field>
              </FieldGroup>
              <Button type="submit" size="sm" disabled={busy || !name.trim()}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => setEdit(null)}
              >
                Cancel
              </Button>
            </form>
          )}
        </div>
      )}
      {busy && (
        <p role="status" className="text-xs text-muted-foreground">
          Working…
        </p>
      )}
      <CreateRepoDialog
        open={createOpen}
        onOpenChange={(value) => {
          setCreateOpen(value);
          if (!value) void refresh();
        }}
        initialParentDir={selected?.path}
      />
      <CloneRepoDialog
        open={cloneOpen}
        onOpenChange={(value) => {
          setCloneOpen(value);
          if (!value) void refresh();
        }}
        initialParentDir={selected?.path}
      />
    </div>
  );
}
function ScanWarnings({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null;
  return (
    <details className="text-xs text-muted-foreground">
      <summary className="cursor-pointer">
        {warnings.length} scan notices
      </summary>
      <div className="max-h-28 overflow-auto">
        {warnings.map((warning, index) => (
          <p className="break-all py-1" key={`${index}-${warning}`}>
            {warning}
          </p>
        ))}
      </div>
    </details>
  );
}
