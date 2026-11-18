import assert from "node:assert/strict";
import { after, afterEach, test } from "node:test";
import { installSrcHooks } from "./lib/src-import-hooks.mjs";

const hooks = installSrcHooks();
after(() => hooks.deregister());

globalThis.window ??= globalThis;
globalThis.document ??= { documentElement: { style: { zoom: "" } } };
globalThis.localStorage ??= {
  getItem: () => null,
  setItem() {},
  removeItem() {},
};
globalThis.matchMedia ??= () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
});

let deps;
try {
  deps = {
    ...(await import("@tauri-apps/api/mocks")),
    ...(await import("@/lib/interface-zoom")),
    ...(await import("@/lib/settings/api")),
    ...(await import("@/features/settings/settings-form")),
  };
} catch (error) {
  if (process.env.GD_EXPECT_DEPS) throw error;
}

const options = { skip: !deps && "needs node_modules" };
afterEach(() => {
  deps?.clearMocks();
  delete globalThis.isTauri;
  document.documentElement.style.zoom = "";
});

test("browser zoom applies every selected level immediately", options, async () => {
  for (const zoom of deps.INTERFACE_ZOOM_LEVELS) {
    await deps.setInterfaceZoom(zoom);
    assert.equal(document.documentElement.style.zoom, `${zoom}%`);
  }
});

test("native zoom uses the current webview and clears CSS fallback", options, async () => {
  globalThis.isTauri = true;
  deps.mockWindows("main");
  const calls = [];
  deps.mockIPC((command, args) => calls.push({ command, args }));
  document.documentElement.style.zoom = "110%";

  await deps.setInterfaceZoom(90);
  await deps.setInterfaceZoom(130);

  assert.deepEqual(calls, [
    { command: "plugin:webview|set_webview_zoom", args: { label: "main", value: 0.9 } },
    { command: "plugin:webview|set_webview_zoom", args: { label: "main", value: 1.3 } },
  ]);
  assert.equal(document.documentElement.style.zoom, "");
});

test("unavailable native zoom still applies successive changes", options, async () => {
  globalThis.isTauri = true;
  deps.mockWindows("main");
  deps.mockIPC(() => {
    throw new Error("set_webview_zoom not allowed");
  });

  await deps.setInterfaceZoom(80);
  assert.equal(document.documentElement.style.zoom, "80%");
  await deps.setInterfaceZoom(150);
  assert.equal(document.documentElement.style.zoom, "150%");
});

test("saving a settings draft preserves the latest live zoom", options, () => {
  const draft = deps.toDraft(deps.DEFAULT_SETTINGS);
  assert.equal(Object.hasOwn(draft, "interfaceZoom"), false);
  const current = { ...deps.DEFAULT_SETTINGS, interfaceZoom: 90 };
  assert.equal({ ...current, ...draft }.interfaceZoom, 90);
  assert.deepEqual(deps.toDraft(current), draft);
});
