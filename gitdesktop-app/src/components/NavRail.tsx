import type { ReactNode } from "react";
import { useMemo } from "react";
import { listKeyboardNav } from "@/lib/list-keyboard-nav";
import { cn } from "@/lib/utils";

export interface NavRailItem {
  id: string;
  label: string;
  /** Optional leading glyph (a Phosphor icon). Inherits the row's current
   *  color, so it tracks the muted / hover / active ink with no extra wiring.
   *  Callers that pass none keep the plain text rail unchanged. */
  icon?: ReactNode;
  /** Render in the destructive palette (e.g. a Danger zone entry). */
  destructive?: boolean;
}

export interface NavRailGroup {
  /** Optional uppercase group header; omit for a flat, header-less list. */
  label?: string;
  /** Draw a top divider above the group (e.g. to set off a Danger zone). */
  separated?: boolean;
  items: NavRailItem[];
}

/**
 * The app's vertical section rail — the left-hand list of selectable sections
 * shared by Settings, Repository settings, and the user guide. One implementation
 * so the keyboard model and styling never drift: ArrowUp/ArrowDown rove between
 * items (roving tabindex), Tab leaves the rail, and the active item carries
 * `aria-current="page"`. Pass `className` for the container box (width, border,
 * overflow); the rail owns the inner structure.
 */
export function NavRail({
  groups,
  activeId,
  onSelect,
  ariaLabel,
  className,
}: {
  groups: NavRailGroup[];
  activeId: string;
  onSelect: (id: string) => void;
  ariaLabel: string;
  className?: string;
}) {
  const ids = useMemo(
    () => groups.flatMap((g) => g.items.map((i) => i.id)),
    [groups],
  );
  const onKeyDown = listKeyboardNav<string>({
    items: ids,
    activeIndex: ids.indexOf(activeId),
    onActivate: onSelect,
    rowKey: (id) => id,
    rowAttr: "data-rail-item",
  });

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("shrink-0 space-y-3", className)}
      onKeyDown={onKeyDown}
    >
      {groups.map((group, gi) => (
        <div
          key={group.label ?? group.items[0]?.id ?? gi}
          className={cn("space-y-0.5", group.separated && "border-t pt-3")}
        >
          {group.label && (
            <p className="micro-label px-2.5 pb-1">{group.label}</p>
          )}
          {group.items.map((item) => {
            const active = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                data-rail-item={item.id}
                // Roving tabindex: only the active item is tabbable; arrows move
                // within the rail, Tab leaves it for the content.
                tabIndex={active ? 0 : -1}
                aria-current={active ? "page" : undefined}
                onClick={() => onSelect(item.id)}
                // Enki navigation entry: hover is a 5 % ink wash, press 10 %;
                // the active entry adds a 3px leading rule in its own ink and a
                // bold label, so it stays findable without relying on tone.
                // Focus is a separate 1px outline, never the selection look.
                className={cn(
                  "flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left text-[12.5px] outline-none transition-colors focus-visible:outline-1 focus-visible:outline-solid focus-visible:outline-ring focus-visible:-outline-offset-1",
                  active
                    ? item.destructive
                      ? "bg-destructive/10 font-semibold text-destructive shadow-[inset_3px_0_0_0_var(--destructive)]"
                      : "bg-accent font-semibold text-foreground shadow-[inset_3px_0_0_0_var(--ink)]"
                    : item.destructive
                      ? "text-destructive hover:bg-destructive/5 active:bg-destructive/10"
                      : "text-muted-foreground hover:bg-ink/5 hover:text-foreground active:bg-ink/10",
                )}
              >
                {item.icon && (
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center *:size-4",
                    )}
                  >
                    {item.icon}
                  </span>
                )}
                <span className="min-w-0 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
