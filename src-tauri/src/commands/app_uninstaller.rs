use std::path::Path;
use tauri::{AppHandle, Emitter};
use crate::models::types::{AppResidualResult, DeleteResult, FileEntry, FileType, ResidualGroup, ScanModule, ScanProgress};
use crate::scanner::walker::scan_directory;
use crate::utils::file_ops::{dir_size, safe_delete};
use crate::utils::paths::{app_residual_paths, applications_dir};

/// 扫描 /Applications 下的应用列表
#[tauri::command]
pub async fn list_applications() -> Result<Vec<String>, String> {
    let apps_dir = applications_dir();
    let mut apps = Vec::new();

    for entry in std::fs::read_dir(&apps_dir).map_err(|e| e.to_string())? {
        let entry = match entry {
            Ok(e) => e,
            Err(_) => continue,
        };

        let name = entry.file_name().to_string_lossy().to_string();
        if name.ends_with(".app") {
            apps.push(name);
        }
    }

    apps.sort();
    Ok(apps)
}

/// 扫描指定应用的残留文件
#[tauri::command]
pub async fn scan_app_residual(
    app_handle: AppHandle,
    app_name: String,
) -> Result<AppResidualResult, String> {
    let app_handle = std::sync::Arc::new(app_handle);

    // 提取应用名（去除 .app 后缀）
    let app_base = app_name.trim_end_matches(".app");
    let bundle_id = guess_bundle_id(&app_name);

    let app_path = applications_dir().join(&app_name);
    let residual_paths = app_residual_paths(app_base, &bundle_id);

    let progress_cb: crate::scanner::walker::ProgressCallback = Box::new({
        let app_handle = app_handle.clone();
        move |p: ScanProgress| {
            let _ = app_handle.emit("scan-progress", p);
        }
    });

    let mut groups: Vec<ResidualGroup> = Vec::new();
    let mut total_size: u64 = 0;

    for residual_path in &residual_paths {
        if !residual_path.exists() {
            continue;
        }

        let category = residual_path
            .components()
            .nth(4)
            .and_then(|c| c.as_os_str().to_str())
            .unwrap_or("其他")
            .to_string();

        let size = if residual_path.is_dir() {
            dir_size(residual_path)
        } else {
            residual_path
                .metadata()
                .map(|m| m.len())
                .unwrap_or(0)
        };

        let files = if residual_path.is_dir() {
            scan_directory(
                residual_path,
                ScanModule::Uninstaller,
                FileType::AppResidual,
                |_| {},
                Some(&progress_cb),
            )
        } else {
            vec![FileEntry {
                path: residual_path.to_string_lossy().to_string(),
                size,
                modified: residual_path
                    .metadata()
                    .ok()
                    .and_then(|m| m.modified().ok())
                    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                    .map(|d| d.as_secs())
                    .unwrap_or(0),
                file_type: FileType::AppResidual,
                is_dir: false,
            }]
        };

        total_size += size;
        groups.push(ResidualGroup {
            category,
            files,
            size,
        });
    }

    Ok(AppResidualResult {
        app_name: app_base.to_string(),
        bundle_id,
        app_path: app_path.to_string_lossy().to_string(),
        groups,
        total_size,
    })
}

/// 彻底卸载应用（删除 App 本体 + 所有残留）
#[tauri::command]
pub async fn uninstall_app(
    app_path: String,
    residual_paths: Vec<String>,
) -> Result<DeleteResult, String> {
    let mut all_paths = residual_paths;
    if Path::new(&app_path).exists() {
        all_paths.push(app_path);
    }
    Ok(safe_delete(&all_paths))
}

/// 仅清理残留文件（不删除 App 本体）
#[tauri::command]
pub async fn clean_app_residual(paths: Vec<String>) -> Result<DeleteResult, String> {
    Ok(safe_delete(&paths))
}

/// 从应用 Info.plist 推测 Bundle ID（简化版：基于应用名）
fn guess_bundle_id(app_name: &str) -> Option<String> {
    let base = app_name.trim_end_matches(".app");
    // 简化策略：将空格转成点，全小写，加 com. 前缀
    let normalized = base.replace(' ', "").to_lowercase();
    Some(format!("com.{}", normalized))
}
