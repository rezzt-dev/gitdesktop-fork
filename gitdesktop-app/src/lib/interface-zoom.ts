import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import type { InterfaceZoom } from "@/lib/settings/api";

/** Browser zoom reflows and rerasterizes text; CSS transforms would blur it. */
export async function setInterfaceZoom(zoom: InterfaceZoom): Promise<void> {
  if (isTauri()) {
    try {
      await getCurrentWebview().setZoom(zoom / 100);
      document.documentElement.style.zoom = "";
      return;
    } catch {
      // Keep zoom usable when the native command is unavailable (for example,
      // a dev window launched before the zoom capability was added).
    }
  }
  // CSS zoom also reflows text, and works in the browser preview.
  document.documentElement.style.zoom = `${zoom}%`;
}
