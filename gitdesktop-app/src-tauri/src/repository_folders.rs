use std::path::{Path, PathBuf};

use crate::error::{AppError, AppResult};
use serde::Serialize;

static FOLDER_WRITES: tokio::sync::Mutex<()> = tokio::sync::Mutex::const_new(());
const MAX_ENTRIES: usize = 50_000;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderEntry {
    path: String,
    parent: Option<String>,
    name: String,
    repository: bool,
}

#[derive(Serialize)]
pub struct FolderScan {
    root: String,
    entries: Vec<FolderEntry>,
    warnings: Vec<String>,
}

fn directory(path: &str) -> AppResult<PathBuf> {
    let path = dunce::canonicalize(path)?;
    if !path.is_dir() {
        return Err(AppError::InvalidArgument("Choose a directory.".into()));
    }
    Ok(path)
}

fn scan(root: &Path) -> AppResult<FolderScan> {
    let mut result = FolderScan {
        root: root.to_string_lossy().into_owned(),
        entries: vec![],
        warnings: vec![],
    };
    let mut pending = vec![(root.to_path_buf(), None, 0)];
    while let Some((path, parent, depth)) = pending.pop() {
        if result.entries.len() >= MAX_ENTRIES {
            result
                .warnings
                .push("Scan stopped at 50,000 folders. Import smaller folders separately.".into());
            break;
        }
        let bare = !path.join(".git").exists()
            && path.join("HEAD").is_file()
            && path.join("objects").is_dir()
            && path.join("refs").is_dir();
        if bare {
            result.warnings.push(format!(
                "Bare repository skipped (no working directory): {}",
                path.display()
            ));
            continue;
        }
        let repository = path.join(".git").exists();
        let path_text = path.to_string_lossy().into_owned();
        result.entries.push(FolderEntry {
            name: path
                .file_name()
                .unwrap_or(path.as_os_str())
                .to_string_lossy()
                .into_owned(),
            path: path_text.clone(),
            parent,
            repository,
        });
        // Repository contents belong to Git; dependencies and submodules are not library folders.
        if repository {
            continue;
        }
        if depth >= 64 {
            result
                .warnings
                .push(format!("Depth limit reached: {path_text}"));
            continue;
        }
        let children = match std::fs::read_dir(&path) {
            Ok(children) => children,
            Err(e) => {
                result.warnings.push(format!("{path_text}: {e}"));
                continue;
            }
        };
        let mut dirs = vec![];
        for child in children {
            match child.and_then(|entry| Ok((entry.file_type()?, entry.path()))) {
                Ok((kind, child)) if kind.is_dir() => dirs.push(child),
                Ok((kind, child)) if kind.is_symlink() => result
                    .warnings
                    .push(format!("Symbolic link skipped: {}", child.display())),
                Ok(_) => {}
                Err(e) => result.warnings.push(format!("{path_text}: {e}")),
            }
        }
        dirs.sort();
        for child in dirs.into_iter().rev() {
            pending.push((child, Some(path_text.clone()), depth + 1));
        }
    }
    Ok(result)
}

fn child_name(name: &str) -> AppResult<()> {
    if name.is_empty()
        || name.trim() != name
        || name == "."
        || name == ".."
        || name.ends_with('.')
        || name
            .chars()
            .any(|c| c.is_control() || "\\/:*?\"<>|".contains(c))
        || name.eq_ignore_ascii_case(".git")
        || crate::fsops::path_has_reserved_component(Path::new(name))
    {
        return Err(AppError::InvalidArgument(
            "Use a folder name without separators, reserved names, or trailing spaces and dots."
                .into(),
        ));
    }
    Ok(())
}

// The destination must never be replaced, including an empty directory created
// by another process between validation and the move.
#[cfg(any(target_os = "linux", target_os = "macos"))]
fn move_without_replace(source: &Path, destination: &Path) -> std::io::Result<()> {
    use std::ffi::CString;
    use std::os::unix::ffi::OsStrExt;
    let source = CString::new(source.as_os_str().as_bytes())?;
    let destination = CString::new(destination.as_os_str().as_bytes())?;
    #[cfg(target_os = "linux")]
    let result = {
        unsafe extern "C" {
            fn renameat2(
                old_dir: i32,
                old: *const std::ffi::c_char,
                new_dir: i32,
                new: *const std::ffi::c_char,
                flags: u32,
            ) -> i32;
        }
        // Both C strings remain alive for the call. AT_FDCWD and RENAME_NOREPLACE.
        unsafe { renameat2(-100, source.as_ptr(), -100, destination.as_ptr(), 1) }
    };
    #[cfg(target_os = "macos")]
    let result = {
        unsafe extern "C" {
            fn renamex_np(
                old: *const std::ffi::c_char,
                new: *const std::ffi::c_char,
                flags: u32,
            ) -> i32;
        }
        // Both C strings remain alive for the call. RENAME_EXCL.
        unsafe { renamex_np(source.as_ptr(), destination.as_ptr(), 4) }
    };
    if result == 0 {
        Ok(())
    } else {
        Err(std::io::Error::last_os_error())
    }
}

#[cfg(target_os = "windows")]
fn move_without_replace(source: &Path, destination: &Path) -> std::io::Result<()> {
    // MoveFileEx refuses to replace a directory, including an empty one.
    std::fs::rename(source, destination)
}

#[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
fn move_without_replace(_source: &Path, _destination: &Path) -> std::io::Result<()> {
    Err(std::io::Error::new(
        std::io::ErrorKind::Unsupported,
        "Folder moves are unavailable on this platform.",
    ))
}

#[tauri::command]
pub async fn repository_folder_scan(path: String) -> AppResult<FolderScan> {
    tauri::async_runtime::spawn_blocking(move || scan(&directory(&path)?))
        .await
        .map_err(|e| AppError::Command(e.to_string()))?
}

#[tauri::command]
pub async fn repository_folder_create(parent: String, name: String) -> AppResult<String> {
    let _guard = FOLDER_WRITES.lock().await;
    tauri::async_runtime::spawn_blocking(move || {
        child_name(&name)?;
        let target = directory(&parent)?.join(name);
        std::fs::create_dir(&target)?;
        Ok(target.to_string_lossy().into_owned())
    })
    .await
    .map_err(|e| AppError::Command(e.to_string()))?
}

#[tauri::command]
pub async fn repository_folder_delete_empty(path: String) -> AppResult<()> {
    let _guard = FOLDER_WRITES.lock().await;
    tauri::async_runtime::spawn_blocking(move || {
        // remove_dir is deliberately non-recursive: hidden files also prevent deletion.
        std::fs::remove_dir(directory(&path)?)?;
        Ok(())
    })
    .await
    .map_err(|e| AppError::Command(e.to_string()))?
}

#[tauri::command]
pub async fn repository_folder_move(
    state: tauri::State<'_, crate::state::AppState>,
    path: String,
    parent: String,
    name: String,
) -> AppResult<String> {
    let _guard = FOLDER_WRITES.lock().await;
    child_name(&name)?;
    let source = directory(&path)?;
    if source.parent().is_none()
        || source
            .ancestors()
            .skip(1)
            .any(|ancestor| ancestor.join(".git").exists())
    {
        return Err(AppError::InvalidArgument("Choose an organizational folder or repository root, not a filesystem root or a folder inside a repository.".into()));
    }
    let destination = directory(&parent)?.join(name);
    if destination.starts_with(&source) || destination.symlink_metadata().is_ok() {
        return Err(AppError::InvalidArgument(
            "The destination already exists or is inside the source folder.".into(),
        ));
    }
    let source_copy = source.clone();
    let scanned = tauri::async_runtime::spawn_blocking(move || scan(&source_copy))
        .await
        .map_err(|e| AppError::Command(e.to_string()))??;
    if !scanned.warnings.is_empty() {
        return Err(AppError::Command("Cannot move a folder that could not be fully inspected. Check permissions and symbolic links.".into()));
    }
    let mut holds = vec![];
    for entry in scanned.entries.iter().filter(|entry| entry.repository) {
        let git = Path::new(&entry.path).join(".git");
        if !git.is_dir()
            || std::fs::symlink_metadata(&git)?.file_type().is_symlink()
            || git.join("worktrees").exists()
            || git.join("modules").exists()
            || git.join("objects/info/alternates").exists()
            || std::fs::read_to_string(git.join("config"))?
                .lines()
                .any(|line| {
                    line.split_once('=').is_some_and(|(key, _)| {
                        let key = key.trim();
                        key.eq_ignore_ascii_case("worktree")
                            || key.eq_ignore_ascii_case("worktreeConfig")
                    })
                })
        {
            return Err(AppError::Command("Move linked worktrees, submodules, bare repositories, and repositories with external worktrees using their Git-specific tools.".into()));
        }
        if [
            "index.lock",
            "HEAD.lock",
            "config.lock",
            "shallow.lock",
            "packed-refs.lock",
        ]
        .iter()
        .any(|name| git.join(name).exists())
        {
            return Err(AppError::Busy {
                holder: "a Git process (repository lock file present)".into(),
            });
        }
        for domain in [
            state.working_tree_lock(&entry.path).await,
            state.worktree_admin_lock(&entry.path).await,
            state.network_lock(&entry.path).await,
        ] {
            holds.push(domain.lock().try_lock_owned().map_err(|_| AppError::Busy {
                holder: "a repository operation".into(),
            })?);
        }
    }
    tauri::async_runtime::spawn_blocking(move || {
        // Cross-device moves fail without copying or deleting any source data.
        if destination.symlink_metadata().is_ok() {
            return Err(AppError::InvalidArgument(
                "The destination already exists.".into(),
            ));
        }
        move_without_replace(&source, &destination)?;
        Ok(destination.to_string_lossy().into_owned())
    })
    .await
    .map_err(|e| AppError::Command(e.to_string()))?
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn scan_keeps_hierarchy_and_stops_at_repositories() {
        let temp = tempfile::tempdir().unwrap();
        let repo = temp.path().join("projects/repo");
        std::fs::create_dir_all(repo.join(".git")).unwrap();
        std::fs::create_dir_all(repo.join("node_modules/example")).unwrap();
        let result = scan(temp.path()).unwrap();
        assert_eq!(result.entries.len(), 3);
        assert!(result.entries[2].repository);
        assert_eq!(
            result.entries[2].parent.as_deref(),
            Some(temp.path().join("projects").to_str().unwrap())
        );
    }
    #[cfg(unix)]
    #[test]
    fn scan_skips_symbolic_link_cycles() {
        let temp = tempfile::tempdir().unwrap();
        std::os::unix::fs::symlink(temp.path(), temp.path().join("cycle")).unwrap();
        let result = scan(temp.path()).unwrap();
        assert_eq!(result.entries.len(), 1);
        assert_eq!(result.warnings.len(), 1);
        assert!(result.warnings[0].contains("Symbolic link skipped"));
    }
    #[test]
    fn scan_reports_bare_repositories_without_importing_objects() {
        let temp = tempfile::tempdir().unwrap();
        std::fs::create_dir(temp.path().join("objects")).unwrap();
        std::fs::create_dir(temp.path().join("refs")).unwrap();
        std::fs::write(temp.path().join("HEAD"), "ref: refs/heads/main").unwrap();
        let result = scan(temp.path()).unwrap();
        assert!(result.entries.is_empty());
        assert_eq!(result.warnings.len(), 1);
    }
    #[test]
    fn rejects_unsafe_names() {
        for name in [
            "", ".", "..", "../repo", "a/b", "a\\b", ".git", "NUL", "repo.", " repo",
        ] {
            assert!(child_name(name).is_err(), "{name}");
        }
        assert!(child_name("Mis proyectos").is_ok());
    }
    #[test]
    fn move_never_replaces_an_existing_empty_directory() {
        let temp = tempfile::tempdir().unwrap();
        let source = temp.path().join("source");
        let destination = temp.path().join("destination");
        std::fs::create_dir(&source).unwrap();
        std::fs::create_dir(&destination).unwrap();
        std::fs::write(source.join("keep"), "data").unwrap();
        assert!(move_without_replace(&source, &destination).is_err());
        assert!(source.join("keep").exists());
        std::fs::remove_dir(&destination).unwrap();
        move_without_replace(&source, &destination).unwrap();
        assert!(destination.join("keep").exists());
        assert!(!source.exists());
    }
    #[test]
    fn deleting_nonempty_folder_preserves_contents() {
        let temp = tempfile::tempdir().unwrap();
        std::fs::write(temp.path().join(".hidden"), "keep").unwrap();
        assert!(std::fs::remove_dir(temp.path()).is_err());
        assert_eq!(
            std::fs::read_to_string(temp.path().join(".hidden")).unwrap(),
            "keep"
        );
    }
}
