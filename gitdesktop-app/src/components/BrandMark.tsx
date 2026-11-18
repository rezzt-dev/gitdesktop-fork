import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** The app icon shown in the UI; the favicon is copied from app-icon.svg.
 *  The asset is a light tile, which vanishes on the light canvas, so the light
 *  theme inverts it to an ink tile — the same inversion as a primary action. */
export function BrandMark({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/favicon.svg"
      alt=""
      aria-hidden="true"
      className={cn("[:root:not(.dark)_&]:invert", className)}
      {...props}
    />
  );
}
