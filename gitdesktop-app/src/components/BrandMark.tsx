import type { ImgHTMLAttributes } from "react";

/** The app icon shown in the UI; the favicon is copied from app-icon.svg. */
export function BrandMark(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <img src="/favicon.svg" alt="" aria-hidden="true" {...props} />;
}
