import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import type { InterfaceZoom } from "@/lib/settings/api";

/** Browser zoom reflows and rerasterizes text; CSS transforms would blur it. */
export async function setInterfaceZoom(zoom: InterfaceZoom): Promise<void> {
  if (isTauri()) {
    await getCurrentWebview().setZoom(zoom / 100);
  } else {
    // Keep the Vite preview usable outside Tauri.
    document.documentElement.style.zoom = `${zoom}%`;
  }
}
