use std::path::Path;
use tauri::{AppHandle, Emitter};
use crate::models::types::{DeleteResult, FileEntry, FileType, ScanModule, ScanProgress, ScanResult};
use crate::utils::file_ops::safe_delete;

/// 扫描大文件
/// - root_path: 扫描根目录（默认用户主目录）
/// - min_size: 最小文件大小（字节，默认 100MB = 104857600）
#[tauri::command]
pub async fn scan_large_files(
    app_handle: AppHandle,
    root_path: Option<String>,
    min_size: Option<u64>,
) -> Result<ScanResult, String> {
    let start = std::time::Instant::now();

    let root = match root_path {
        Some(ref p) => Path::new(p).to_path_buf(),
        None => dirs::home_dir().unwrap_or_else(|| std::path::PathBuf::from("/")),
    };

    let min_size = min_size.unwrap_or(100 * 1024 * 1024); // 默认 100MB

    if !root.exists() {
        return Err(format!("路径不存在: {}", root.display()));
    }

    let app_handle = std::sync::Arc::new(app_handle);
    let progress_cb: crate::scanner::walker::ProgressCallback = Box::new({
        let app_handle = app_handle.clone();
        move |p: ScanProgress| {
            let _ = app_handle.emit("scan-progress", p);
        }
    });

    let mut total_size: u64 = 0;
    let entries = crate::scanner::walker::scan_directory(
        &root,
        ScanModule::LargeFile,
        FileType::LargeFile,
        |entry| {
            total_size += entry.size;
        },
        Some(&progress_cb),
    );

    // 按大小过滤（walker 内部已过滤，这里二次确认）
    let entries: Vec<FileEntry> = entries
        .into_iter()
        .filter(|e| e.size >= min_size)
        .collect();

    // 重新计算总大小
    let total_size: u64 = entries.iter().map(|e| e.size).sum();

    Ok(ScanResult {
        entries,
        total_size,
        duration_ms: start.elapsed().as_millis() as u64,
    })
}

/// 删除选中的大文件（移至废纸篓）
#[tauri::command]
pub async fn delete_large_files(paths: Vec<String>) -> Result<DeleteResult, String> {
    Ok(safe_delete(&paths))
}
