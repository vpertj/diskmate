use std::path::Path;
use walkdir::WalkDir;
use crate::models::types::{DeleteFailure, DeleteResult, FileEntry, FileType};

/// 安全删除文件/目录到废纸篓
pub fn safe_delete(paths: &[String]) -> DeleteResult {
    let mut deleted_count: u32 = 0;
    let mut freed_size: u64 = 0;
    let mut failed: Vec<DeleteFailure> = Vec::new();

    for path_str in paths {
        let path = Path::new(path_str);

        // 先获取文件大小用于统计
        let size = match path.metadata() {
            Ok(meta) => meta.len(),
            Err(_) => 0,
        };

        // 调用 trash crate 安全删除到废纸篓
        match trash::delete(path) {
            Ok(_) => {
                deleted_count += 1;
                freed_size += size;
            }
            Err(e) => {
                failed.push(DeleteFailure {
                    path: path_str.clone(),
                    error: e.to_string(),
                });
            }
        }
    }

    DeleteResult {
        deleted_count,
        freed_size,
        failed,
    }
}

/// 递归计算目录大小
pub fn dir_size(path: &Path) -> u64 {
    WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter_map(|e| e.metadata().ok())
        .filter(|m| m.is_file())
        .map(|m| m.len())
        .sum()
}

/// 收集目录下的文件条目（按大小过滤）
pub fn collect_files(path: &Path, min_size: u64, file_type: FileType) -> Vec<FileEntry> {
    let mut entries = Vec::new();

    for entry in WalkDir::new(path)
        .follow_links(true)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let metadata = match entry.metadata() {
            Ok(m) => m,
            Err(_) => continue,
        };

        if !metadata.is_file() {
            continue;
        }

        if metadata.len() < min_size {
            continue;
        }

        let modified = metadata
            .modified()
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs())
            .unwrap_or(0);

        entries.push(FileEntry {
            path: entry.path().to_string_lossy().to_string(),
            size: metadata.len(),
            modified,
            file_type: file_type.clone(),
            is_dir: false,
        });
    }

    entries
}
