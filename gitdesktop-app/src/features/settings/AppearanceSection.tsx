import { useQueryClient } from "@tanstack/react-query";
import { useId, useRef } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type AppSettings,
  INTERFACE_ZOOM_LEVELS,
  type InterfaceZoom,
} from "@/lib/settings/api";
import {
  settingsKeys,
  useApplyTheme,
  useSaveSettings,
  useSettings,
} from "@/lib/settings/queries";
import { THEME_LABELS, THEME_ORDER, type ThemeSetting } from "@/lib/theme";

/**
 * Settings → Appearance. Theme and zoom apply on change and persist independently
 * of the bulk Save bar. Their cached values also drive the live app appearance.
 */
export function AppearanceSection() {
  const settings = useSettings();
  const applyTheme = useApplyTheme();
  const saveSettings = useSaveSettings();
  const queryClient = useQueryClient();
  const zoomSaving = useRef(false);
  const labelId = useId();
  const zoomLabelId = useId();
  const theme = settings.data?.theme ?? "system";
  const zoom = settings.data?.interfaceZoom ?? 110;

  function selectTheme(next: ThemeSetting) {
    if (settings.data) applyTheme(settings.data, next);
  }

  async function selectZoom(next: InterfaceZoom) {
    const current = settings.data;
    if (
      !current ||
      !INTERFACE_ZOOM_LEVELS.includes(next) ||
      current.interfaceZoom === next ||
      zoomSaving.current
    )
      return;
    zoomSaving.current = true;
    // App applies the cached value immediately, independently of disk writes.
    await queryClient.cancelQueries({ queryKey: settingsKeys.settings });
    const updated = { ...current, interfaceZoom: next };
    queryClient.setQueryData(settingsKeys.settings, updated);
    try {
      await saveSettings.mutateAsync(updated);
    } catch {
      queryClient.setQueryData<AppSettings>(settingsKeys.settings, (latest) =>
        latest?.interfaceZoom === next
          ? { ...latest, interfaceZoom: current.interfaceZoom }
          : latest,
      );
      toast.error("Could not save interface zoom");
    } finally {
      zoomSaving.current = false;
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-medium">Appearance</h2>
        <p className="text-xs text-muted-foreground">
          How GitDesktop looks. Changes apply immediately.
        </p>
      </div>
      <div className="space-y-1.5">
        <span id={labelId} className="text-xs font-medium">
          Theme
        </span>
        <div className="max-w-xs">
          <Select
            items={THEME_LABELS}
            value={theme}
            onValueChange={(value) => selectTheme(value as ThemeSetting)}
          >
            <SelectTrigger aria-labelledby={labelId} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEME_ORDER.map((id) => (
                <SelectItem key={id} value={id}>
                  {THEME_LABELS[id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">System</span> follows
          your operating system's light/dark setting.{" "}
          <span className="font-medium text-foreground">Slate</span> is a softer
          dark theme — a lifted, cool blue-gray canvas that eases eye strain on
          long sessions. You can also cycle themes from the command palette.
        </p>
      </div>
      <div className="space-y-1.5">
        <span id={zoomLabelId} className="text-xs font-medium">
          Interface zoom
        </span>
        <div className="max-w-xs">
          <Select
            disabled={saveSettings.isPending}
            items={Object.fromEntries(
              INTERFACE_ZOOM_LEVELS.map((level) => [
                String(level),
                `${level}%`,
              ]),
            )}
            value={String(zoom)}
            onValueChange={(value) =>
              void selectZoom(Number(value) as InterfaceZoom)
            }
          >
            <SelectTrigger aria-labelledby={zoomLabelId} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERFACE_ZOOM_LEVELS.map((level) => (
                <SelectItem key={level} value={String(level)}>
                  {level}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Adjust the entire app in 10% steps. Choose a smaller value for more
          room on compact displays.
        </p>
      </div>
    </section>
  );
}
