import type { Transition } from "motion/react";

/**
 * The single calm motion vocabulary for the app. Set `calmTransition` as the
 * MotionConfig default so every `m.*` component inherits it; reach for
 * `quickTransition` on frequent micro-swaps (button state, badges) so they never
 * feel sluggish. Ease-out only, 120–180ms — never spring/bounce (brand: calm,
 * precise). Duration and curve mirror App.css (`--ease-out`, the 180ms
 * view-transition entry), so JS and CSS motion read as one profile.
 */
const EASE_OUT = [0.33, 1, 0.68, 1] as const;

export const calmTransition: Transition = { duration: 0.18, ease: EASE_OUT };

export const quickTransition: Transition = { duration: 0.12, ease: EASE_OUT };
