use std::path::PathBuf;
use tauri::{AppHandle, Emitter};
use crate::models::types::{DeleteResult, FileEntry, FileType, ScanModule, ScanProgress, ScanResult};
use crate::utils::file_ops::safe_delete;
use crate::utils::paths::cache_paths;
use crate::scanner::walker::scan_directory;

/// 扫描系统缓存（~/Library/Caches、~/Library/Logs 等）
#[tauri::command]
pub async fn scan_cache(app_handle: AppHandle) -> Result<ScanResult, String> {
    let start = std::time::Instant::now();
    let paths = cache_paths();

    let app_handle = std::sync::Arc::new(app_handle);
    let module = ScanModule::Cache;

    let mut all_entries: Vec<FileEntry> = Vec::new();
    let mut total_size: u64 = 0;

    for path in paths {
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
            &path,
            module,
            FileType::Cache,
            |entry| {
                total_size += entry.size;
            },
            Some(&progress_cb),
        );

        all_entries.extend(entries);
    }

    Ok(ScanResult {
        entries: all_entries,
        total_size,
        duration_ms: start.elapsed().as_millis() as u64,
    })
}

/// 删除选中的缓存项（安全移至废纸篓）
#[tauri::command]
pub async fn delete_cache_items(paths: Vec<String>) -> Result<DeleteResult, String> {
    Ok(safe_delete(&paths))
}

/// 扫描系统日志（~/Library/Logs）
#[tauri::command]
pub async fn scan_logs(app_handle: AppHandle) -> Result<ScanResult, String> {
    let start = std::time::Instant::now();
    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("/"));
    let logs_path = home.join("Library/Logs");

    let app_handle = std::sync::Arc::new(app_handle);

    let progress_cb: crate::scanner::walker::ProgressCallback = Box::new({
        let app_handle = app_handle.clone();
        move |p: ScanProgress| {
            let _ = app_handle.emit("scan-progress", p);
        }
    });

    let mut total_size: u64 = 0;
    let entries = if logs_path.exists() {
        scan_directory(
            &logs_path,
            ScanModule::Cache,
            FileType::Log,
            |entry| {
                total_size += entry.size;
            },
            Some(&progress_cb),
        )
    } else {
        Vec::new()
    };

    Ok(ScanResult {
        entries,
        total_size,
        duration_ms: start.elapsed().as_millis() as u64,
    })
}
