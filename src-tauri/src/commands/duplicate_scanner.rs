use std::collections::HashMap;
use std::path::Path;
use tauri::{AppHandle, Emitter};
use crate::models::types::{DeleteResult, DuplicateGroup, FileEntry, FileType, ScanModule, ScanProgress};
use crate::scanner::hasher;
use crate::scanner::walker::scan_directory;
use crate::utils::file_ops::safe_delete;

/// 多阶段哈希检测重复文件
/// 阶段 1: size 分组 → 阶段 2: 前 4KB 部分哈希 → 阶段 3: 全文件 SHA256
#[tauri::command]
pub async fn scan_duplicates(
    app_handle: AppHandle,
    paths: Vec<String>,
) -> Result<Vec<DuplicateGroup>, String> {
    let app_handle = std::sync::Arc::new(app_handle);

    // 阶段 1：按 size 分组
    let mut size_groups: HashMap<u64, Vec<FileEntry>> = HashMap::new();

    for path_str in &paths {
        let path = Path::new(path_str);
        if !path.exists() {
            continue;
        }

        let progress_cb: crate::scanner::walker::ProgressCallback = Box::new({
            let app_handle = app_handle.clone();
            move |p: ScanProgress| {
                let _ = app_handle.emit("scan-progress", p);
            }
        });

        let entries = scan_directory(
            path,
            ScanModule::Duplicate,
            FileType::Duplicate,
            |_| {},
            Some(&progress_cb),
        );

        for entry in entries {
            size_groups
                .entry(entry.size)
                .or_default()
                .push(entry);
        }
    }

    // 过滤掉只有一个文件的 size 组（不可能是重复）
    let candidates: Vec<Vec<FileEntry>> = size_groups
        .into_iter()
        .filter(|(_, files)| files.len() > 1)
        .map(|(_, files)| files)
        .collect();

    // 阶段 2：部分哈希分组
    let mut partial_groups: HashMap<String, Vec<FileEntry>> = HashMap::new();

    for group in &candidates {
        for entry in group {
            let path = Path::new(&entry.path);
            if let Some(hash) = hasher::partial_hash(path) {
                // 用 size + partial_hash 作为 key，避免不同 size 但 hash 碰撞
                let key = format!("{}-{}", entry.size, hash);
                partial_groups
                    .entry(key)
                    .or_default()
                    .push(entry.clone());
            }
        }
    }

    // 过滤掉部分哈希只有一个的组
    let partial_candidates: Vec<Vec<FileEntry>> = partial_groups
        .into_iter()
        .filter(|(_, files)| files.len() > 1)
        .map(|(_, files)| files)
        .collect();

    // 阶段 3：全文件 SHA256 精确确认
    let mut full_groups: HashMap<String, Vec<FileEntry>> = HashMap::new();

    for group in &partial_candidates {
        for entry in group {
            let path = Path::new(&entry.path);
            if let Some(hash) = hasher::full_hash(path) {
                full_groups
                    .entry(hash)
                    .or_default()
                    .push(entry.clone());
            }
        }
    }

    // 组装重复组结果
    let result: Vec<DuplicateGroup> = full_groups
        .into_iter()
        .filter(|(_, files)| files.len() > 1)
        .map(|(hash, files)| {
            let size = files.first().map(|f| f.size).unwrap_or(0);
            DuplicateGroup { hash, size, files }
        })
        .collect();

    Ok(result)
}

/// 批量删除重复文件（保留未标记的项）
#[tauri::command]
pub async fn delete_duplicates(paths: Vec<String>) -> Result<DeleteResult, String> {
    Ok(safe_delete(&paths))
}
