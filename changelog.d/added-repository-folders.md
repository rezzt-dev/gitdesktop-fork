- **Repository folders.** Import an existing directory hierarchy and keep the
  same organization in GitDesktop: browse folders in the welcome screen and the
  repository switcher, and create subfolders, rename, move, or delete empty
  folders on disk. Create and clone repositories straight into a selected
  folder. Existing repositories and aliases are preserved, importing never
  copies or moves files, symbolic links and repository internals are skipped,
  and moves that would break Git (linked worktrees, submodules, repositories
  with external worktrees) or that would replace an existing destination are
  refused.
