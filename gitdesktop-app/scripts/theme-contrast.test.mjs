import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync(new URL("../src/App.css", import.meta.url), "utf8");

function declarations(selector) {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, `Missing theme ${selector}`);
  const block = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries(
    [...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, key, value]) => [
      key,
      value.trim(),
    ]),
  );
}

// Convert the shipped OKLCH tokens to linear sRGB for WCAG relative luminance.
// Clipping matches the display gamut; no dependency or copied palette to drift.
function color(tokens, name, seen = new Set()) {
  assert.ok(!seen.has(name), `Circular token ${name}`);
  seen.add(name);
  const value = tokens[name];
  assert.ok(value, `Missing token ${name}`);
  const alias = value.match(/^var\((--[\w-]+)\)$/);
  if (alias) return color(tokens, alias[1], seen);
  const match = value.match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/);
  assert.ok(match, `Unsupported color ${name}: ${value}`);
  const [, lightness, chroma, hue] = match.map(Number);
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const b = chroma * Math.sin((hue * Math.PI) / 180);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((channel) => Math.max(0, Math.min(1, channel)));
}
function luminance(rgb) {
  return rgb.reduce(
    (sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i],
    0,
  );
}
function contrast(a, b) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
const light = declarations(":root");
const dark = { ...light, ...declarations(".dark") };
const themes = {
  light,
  dark,
  slate: { ...dark, ...declarations(".dark.slate") },
};
for (const [name, tokens] of Object.entries(themes)) {
  test(`${name}: text, secondary labels and status icons remain AA on interactive surfaces`, () => {
    for (const surface of [
      "background",
      "card",
      "popover",
      "muted",
      "accent",
      "sidebar",
    ]) {
      for (const ink of [
        "foreground",
        "muted-foreground",
        "success",
        "warning",
        "info",
        "merged",
        "destructive",
      ]) {
        const ratio = contrast(
          color(tokens, `--${ink}`),
          color(tokens, `--${surface}`),
        );
        assert.ok(ratio >= 4.5, `${ink} on ${surface}: ${ratio.toFixed(2)}:1`);
      }
    }
  });
  test(`${name}: paired foregrounds and keyboard indicators keep their contrast`, () => {
    for (const surface of [
      "primary",
      "secondary",
      "accent",
      "card",
      "popover",
      "sidebar",
      "sidebar-primary",
      "sidebar-accent",
      "selection",
    ]) {
      const ratio = contrast(
        color(tokens, `--${surface}-foreground`),
        color(tokens, `--${surface}`),
      );
      assert.ok(ratio >= 4.5, `${surface}: ${ratio.toFixed(2)}:1`);
    }
    for (const surface of [
      "background",
      "card",
      "muted",
      "accent",
      "sidebar",
    ]) {
      const ratio = contrast(
        color(tokens, "--ring"),
        color(tokens, `--${surface}`),
      );
      assert.ok(ratio >= 3, `focus on ${surface}: ${ratio.toFixed(2)}:1`);
    }
  });
}
