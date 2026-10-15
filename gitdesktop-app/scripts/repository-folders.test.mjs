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

test("repositories precede folders and each group is alphabetical at every level", () => {
  const mixed = [
    { path: "/repos", parent: null, name: "repos", repository: false },
    {
      path: "/repos/d-folder",
      parent: "/repos",
      name: "d-folder",
      repository: false,
    },
    {
      path: "/repos/c-repo",
      parent: "/repos",
      name: "c-repo",
      repository: true,
    },
    {
      path: "/repos/a-folder",
      parent: "/repos",
      name: "a-folder",
      repository: false,
    },
    {
      path: "/repos/a-folder/a-child-folder",
      parent: "/repos/a-folder",
      name: "a-child-folder",
      repository: false,
    },
    {
      path: "/repos/a-folder/d-child-folder",
      parent: "/repos/a-folder",
      name: "d-child-folder",
      repository: false,
    },
    {
      path: "/repos/a-folder/c-child-repo",
      parent: "/repos/a-folder",
      name: "c-child-repo",
      repository: true,
    },
    {
      path: "/repos/a-folder/b-child-repo",
      parent: "/repos/a-folder",
      name: "b-child-repo",
      repository: true,
    },
    {
      path: "/repos/b-repo",
      parent: "/repos",
      name: "b-repo",
      repository: true,
    },
  ];
  assert.deepEqual(
    folderRows(mixed, [], "").map((row) => row.name),
    [
      "repos",
      "b-repo",
      "c-repo",
      "a-folder",
      "b-child-repo",
      "c-child-repo",
      "a-child-folder",
      "d-child-folder",
      "d-folder",
    ],
  );
  assert.deepEqual(
    folderRows(mixed, ["/repos"], "child").map((row) => row.name),
    [
      "repos",
      "a-folder",
      "b-child-repo",
      "c-child-repo",
      "a-child-folder",
      "d-child-folder",
    ],
  );
});

test("parent paths retain drive roots and filesystem roots", () => {
  assert.equal(folderParent("C:\\Projects"), "C:/");
  assert.equal(folderParent("/projects"), "/");
  assert.equal(folderParent("/projects/web"), "/projects");
});
