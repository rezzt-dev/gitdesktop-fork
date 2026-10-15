import assert from "node:assert/strict";
import { test } from "node:test";
import {
  containsFolder,
  folderKey,
  folderParent,
  folderRows,
  rebaseFolder,
} from "../src/features/repository-folders/model.ts";

test("folder boundaries preserve Unix case and distinguish siblings", () => {
  assert.equal(containsFolder("/repos/a", "/repos/ab"), false);
  assert.equal(containsFolder("/repos/a", "/repos/a/repo"), true);
  assert.equal(containsFolder("/repos/A", "/repos/a"), false);
  assert.equal(folderKey("C:\\Repos\\A"), folderKey("c:/repos/a"));
  assert.equal(
    rebaseFolder("/repos/a/repo", "/repos/a", "/new/a"),
    "/new/a/repo",
  );
  assert.equal(
    rebaseFolder("/repos/ab/repo", "/repos/a", "/new/a"),
    "/repos/ab/repo",
  );
});
const entries = [
  { path: "/repos", parent: null, name: "repos", repository: false },
  { path: "/repos/web", parent: "/repos", name: "web", repository: false },
  {
    path: "/repos/web/app",
    parent: "/repos/web",
    name: "app",
    repository: true,
  },
];
test("collapsed folders hide descendants, search reveals matching ancestors", () => {
  assert.deepEqual(
    folderRows(entries, ["/repos"], "").map((row) => row.path),
    ["/repos"],
  );
  assert.deepEqual(
    folderRows(entries, ["/repos"], "app").map((row) => row.depth),
    [0, 1, 2],
  );
  assert.deepEqual(folderRows(entries, [], "missing"), []);
  assert.deepEqual(folderRows([], [], ""), []);
});
test("overlapping import snapshots cannot create a recursive tree", () => {
  assert.equal(
    folderRows([...entries, ...entries], [], "").length,
    entries.length,
  );
});

test("parent paths retain drive roots and filesystem roots", () => {
  assert.equal(folderParent("C:\\Projects"), "C:/");
  assert.equal(folderParent("/projects"), "/");
  assert.equal(folderParent("/projects/web"), "/projects");
});
