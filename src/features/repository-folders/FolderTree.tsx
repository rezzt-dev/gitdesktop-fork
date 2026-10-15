import {
  CaretDownIcon,
  CaretRightIcon,
  FolderIcon,
  GitBranchIcon,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { useOpenRepoByPath } from "@/features/repository/useOpenRepoByPath";
import { copyText } from "@/lib/clipboard";
import { suppressContextMenu } from "@/lib/context-menu";
import { openWithDefault } from "@/lib/git/api";
import { useRovingRows } from "@/lib/list-keyboard-nav";
import { toastError } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { type FolderEntry, folderRows } from "./model";
import { changeLibrary, foldersKey, useFolderLibrary } from "./store";

export function FolderTree({
  onSelect,
  selectedPath,
  onOpened,
  disabled = false,
}: {
  onSelect?: (entry: FolderEntry) => void;
  selectedPath?: string;
  onOpened?: () => void;
  disabled?: boolean;
}) {
  const library = useFolderLibrary();
  const client = useQueryClient();
  const [filter, setFilter] = useState("");
  const [opening, setOpening] = useState(false);
  const [menuEntry, setMenuEntry] = useState<FolderEntry | null>(null);
  const openRepo = useOpenRepoByPath();
  const id = useId();
  const rows = folderRows(
    library.data?.entries ?? [],
    library.data?.collapsed ?? [],
    filter,
  );
  const { onRowKeyDown, rowProps } = useRovingRows({
    items: rows,
    rowKey: (row) => row.path,
  });
  async function toggle(entry: FolderEntry, expand?: boolean) {
    if (entry.repository) return;
    try {
      const saved = await changeLibrary((value) => {
        const closed = new Set(value.collapsed);
        const shouldExpand = expand ?? closed.has(entry.path);
        if (shouldExpand) closed.delete(entry.path);
        else closed.add(entry.path);
        return { ...value, collapsed: [...closed] };
      });
      client.setQueryData(foldersKey, (previous: typeof library.data) =>
        previous ? { ...previous, collapsed: saved.collapsed } : previous,
      );
    } catch (error) {
      toastError(error);
    }
  }
  async function activate(entry: FolderEntry) {
    if (disabled || opening) return;
    if (onSelect) {
      onSelect(entry);
      if (!entry.repository) await toggle(entry);
      return;
    }
    if (!entry.repository) {
      await toggle(entry);
      return;
    }
    setOpening(true);
    try {
      if (await openRepo(entry.path, "recent")) onOpened?.();
    } finally {
      setOpening(false);
    }
  }
  return (
    <div className="flex min-h-0 flex-col">
      <div className="p-2">
        <Input
          aria-label="Filter folders and repositories"
          placeholder="Filter folders and repositories"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-controls={id}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              document
                .getElementById(id)
                ?.querySelector<HTMLElement>("[role=treeitem]")
                ?.focus();
            }
          }}
        />
      </div>
      <ContextMenu>
        <ContextMenuTrigger
          render={
            <div
              id={id}
              role="tree"
              aria-label="Repository folders"
              aria-busy={library.isFetching || opening}
              className="max-h-80 overflow-auto"
              onKeyDown={onRowKeyDown}
              onContextMenuCapture={(event) => {
                const path = (event.target as HTMLElement)
                  .closest("[data-row]")
                  ?.getAttribute("data-row");
                const entry = rows.find((row) => row.path === path);
                if (!entry || disabled || opening) {
                  suppressContextMenu(event);
                  return;
                }
                setMenuEntry(entry);
                onSelect?.(entry);
              }}
            />
          }
        >
          {rows.map((entry) => {
            const expanded =
              Boolean(filter) || !library.data?.collapsed.includes(entry.path);
            return (
              <button
                key={entry.path}
                type="button"
                role="treeitem"
                aria-level={entry.depth + 1}
                aria-expanded={entry.repository ? undefined : expanded}
                aria-selected={selectedPath === entry.path}
                {...rowProps(entry)}
                disabled={disabled || opening}
                className={cn(
                  "flex w-full min-w-0 items-center gap-2 py-2 pr-3 text-left text-xs hover:bg-accent focus-visible:bg-accent focus-visible:outline-none disabled:opacity-50",
                  selectedPath === entry.path &&
                    "bg-accent text-accent-foreground",
                )}
                style={{ paddingLeft: 12 + entry.depth * 16 }}
                title={entry.path}
                onClick={() => void activate(entry)}
                onDoubleClick={() => {
                  if (onSelect && !disabled) {
                    if (entry.repository)
                      void openRepo(entry.path, "recent").then((opened) => {
                        if (opened) onOpened?.();
                      });
                  }
                }}
                onKeyDown={(event) => {
                  const focusPath = (path: string | undefined | null) => {
                    if (path)
                      document
                        .getElementById(id)
                        ?.querySelector<HTMLElement>(
                          `[data-row="${CSS.escape(path)}"]`,
                        )
                        ?.focus();
                  };
                  if (event.key === "Home" || event.key === "End") {
                    event.preventDefault();
                    focusPath(
                      event.key === "Home" ? rows[0]?.path : rows.at(-1)?.path,
                    );
                    return;
                  }
                  if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
                  event.preventDefault();
                  if (event.key === "ArrowLeft") {
                    if (!entry.repository && expanded)
                      void toggle(entry, false);
                    else focusPath(entry.parent);
                  } else if (!entry.repository) {
                    if (!expanded) void toggle(entry, true);
                    else
                      focusPath(
                        rows.find((row) => row.parent === entry.path)?.path,
                      );
                  }
                }}
              >
                {entry.repository ? (
                  <GitBranchIcon className="size-3.5 shrink-0" />
                ) : expanded ? (
                  <CaretDownIcon className="size-3 shrink-0" />
                ) : (
                  <CaretRightIcon className="size-3 shrink-0" />
                )}
                {!entry.repository && (
                  <FolderIcon className="size-3.5 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 truncate">{entry.name}</span>
              </button>
            );
          })}
          {rows.length === 0 && (
            <p className="p-4 text-xs text-muted-foreground">
              {library.isPending
                ? "Reading folders…"
                : filter
                  ? "No matching folders or repositories."
                  : "Import a folder to keep your existing organization."}
            </p>
          )}
        </ContextMenuTrigger>
        <ContextMenuContent>
          {menuEntry && (
            <>
              <ContextMenuItem
                onClick={() => {
                  if (menuEntry.repository)
                    void openRepo(menuEntry.path, "recent").then((opened) => {
                      if (opened) onOpened?.();
                    });
                  else void toggle(menuEntry);
                }}
              >
                {menuEntry.repository
                  ? "Open repository"
                  : library.data?.collapsed.includes(menuEntry.path)
                    ? "Expand folder"
                    : "Collapse folder"}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  void openWithDefault(menuEntry.path).catch(toastError)
                }
              >
                Show in file manager
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  void copyText(menuEntry.path, "Folder path copied")
                }
              >
                Copy path
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
      {library.isError && (
        <p role="alert" className="p-2 text-xs text-destructive">
          Could not load your folders. Try refreshing.
        </p>
      )}
    </div>
  );
}
