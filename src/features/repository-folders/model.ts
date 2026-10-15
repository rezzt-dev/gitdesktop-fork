export interface FolderEntry {
  path: string;
  parent: string | null;
  name: string;
  repository: boolean;
}
export interface FolderScan {
  root: string;
  entries: FolderEntry[];
  warnings: string[];
}

// Unix names are case-sensitive; drive and UNC paths use Windows semantics.
export function folderKey(path: string): string {
  const normalized = path.replace(/\\/g, "/").replace(/\/$/, "");
  return /^(?:[a-z]:|\/\/)/i.test(normalized)
    ? normalized.toLowerCase()
    : normalized;
}
export function containsFolder(parent: string, path: string): boolean {
  const root = folderKey(parent);
  const child = folderKey(path);
  return child === root || child.startsWith(`${root}/`);
}
export function rebaseFolder(path: string, from: string, to: string): string {
  return containsFolder(from, path) ? to + path.slice(from.length) : path;
}
export function folderRows(
  entries: FolderEntry[],
  collapsed: string[],
  filter: string,
): (FolderEntry & { depth: number })[] {
  const byPath = new Map(entries.map((entry) => [entry.path, entry]));
  const children = new Map<string | null, FolderEntry[]>();
  for (const entry of byPath.values()) {
    const parent =
      entry.parent && byPath.has(entry.parent) ? entry.parent : null;
    const siblings = children.get(parent) ?? [];
    siblings.push(entry);
    children.set(parent, siblings);
  }
  const query = filter.trim().toLocaleLowerCase();
  const matching = new Set<string>();
  if (query) {
    for (const entry of byPath.values()) {
      if (!`${entry.name} ${entry.path}`.toLocaleLowerCase().includes(query))
        continue;
      let current: FolderEntry | undefined = entry;
      while (current && !matching.has(current.path)) {
        matching.add(current.path);
        current = current.parent ? byPath.get(current.parent) : undefined;
      }
    }
  }
  const closed = new Set(collapsed);
  const rows: (FolderEntry & { depth: number })[] = [];
  const visited = new Set<string>();
  function visit(parent: string | null, depth: number) {
    for (const entry of children.get(parent) ?? []) {
      if (visited.has(entry.path) || (query && !matching.has(entry.path)))
        continue;
      visited.add(entry.path);
      rows.push({ ...entry, depth });
      if (query || !closed.has(entry.path)) visit(entry.path, depth + 1);
    }
  }
  visit(null, 0);
  return rows;
}

export function folderParent(path: string): string {
  const normalized = path.replace(/\\/g, "/").replace(/\/$/, "");
  const slash = normalized.lastIndexOf("/");
  if (slash === 2 && /^[a-z]:/i.test(normalized)) return normalized.slice(0, 3);
  return normalized.slice(0, slash) || "/";
}
