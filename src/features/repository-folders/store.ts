import { useQuery } from "@tanstack/react-query";
import { withAppStoreLock } from "@/lib/app-store-lock";
import {
  memoizedStoreLoader,
  reloadToleratingEmptyStore,
} from "@/lib/plugin-store";
import { errorMessage, invoke } from "@/lib/tauri/invoke";
import { containsFolder, type FolderScan } from "./model";

interface Library {
  roots: string[];
  collapsed: string[];
}
const getStore = memoizedStoreLoader("repository-folders.json");
export const foldersKey = ["repository-folders"] as const;
let writes: Promise<unknown> = Promise.resolve();
async function readLibrary(): Promise<Library> {
  const store = await getStore();
  const roots = (await store.get<unknown>("roots")) ?? [];
  const collapsed = (await store.get<unknown>("collapsed")) ?? [];
  if (
    !Array.isArray(roots) ||
    !roots.every((path) => typeof path === "string") ||
    !Array.isArray(collapsed) ||
    !collapsed.every((path) => typeof path === "string")
  ) {
    throw new Error(
      "The saved folder library is invalid. It has not been overwritten.",
    );
  }
  return { roots, collapsed };
}
export function changeLibrary(change: (library: Library) => Library) {
  const run = () =>
    withAppStoreLock("repository-folders.json", async () => {
      const store = await getStore();
      await reloadToleratingEmptyStore(store);
      const next = change(await readLibrary());
      const library = {
        ...next,
        roots: [...new Set(next.roots)].filter(
          (root, index, roots) =>
            !roots.some(
              (other, otherIndex) =>
                otherIndex !== index &&
                containsFolder(other, root) &&
                (!containsFolder(root, other) || otherIndex < index),
            ),
        ),
      };
      await store.set("roots", library.roots);
      await store.set("collapsed", library.collapsed);
      await store.save();
      return library;
    });
  const result = writes.then(run, run);
  writes = result.catch(() => undefined);
  return result;
}
export function addLibraryRoot(root: string) {
  return changeLibrary((library) => ({
    ...library,
    roots: library.roots.some((path) => containsFolder(path, root))
      ? library.roots
      : [...library.roots.filter((path) => !containsFolder(root, path)), root],
  }));
}
export const scanFolder = (path: string) =>
  invoke<FolderScan>("repository_folder_scan", { path });
export function useFolderLibrary() {
  return useQuery({
    queryKey: foldersKey,
    queryFn: async () => {
      const read = async () => {
        const store = await getStore();
        await reloadToleratingEmptyStore(store);
        return readLibrary();
      };
      const pending = writes.then(read, read);
      writes = pending.catch(() => undefined);
      const library = await pending;
      const scans = await Promise.all(
        library.roots.map(async (root) => {
          try {
            return await scanFolder(root);
          } catch (error) {
            return {
              root,
              entries: [
                {
                  path: root,
                  parent: null,
                  name: root.split(/[\\/]/).pop() || root,
                  repository: false,
                },
              ],
              warnings: [`${root}: ${errorMessage(error)}`],
            };
          }
        }),
      );
      return {
        ...library,
        entries: scans.flatMap((scan) => scan.entries),
        warnings: scans.flatMap((scan) => scan.warnings),
      };
    },
    staleTime: 30_000,
    networkMode: "always",
  });
}
