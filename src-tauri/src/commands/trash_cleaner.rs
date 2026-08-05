use crate::models::types::TrashInfo;
use crate::utils::file_ops::dir_size;
use std::path::PathBuf;

/// 获取废纸篓信息（大小 + 文件数）
#[tauri::command]
pub async fn get_trash_info() -> Result<TrashInfo, String> {
    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("/"));
    let trash_path = home.join(".Trash");

    if !trash_path.exists() {
        return Ok(TrashInfo {
            size: 0,
            item_count: 0,
        });
    }

    let size = dir_size(&trash_path);
    let item_count = std::fs::read_dir(&trash_path)
        .map(|entries| entries.filter_map(|e| e.ok()).count() as u32)
        .unwrap_or(0);

    Ok(TrashInfo { size, item_count })
}

/// 清空废纸篓
#[tauri::command]
pub async fn empty_trash() -> Result<(), String> {
    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("/"));
    let trash_path = home.join(".Trash");

    if !trash_path.exists() {
        return Ok(());
    }

    // 遍历废纸篓，删除每个文件/文件夹
    for entry in std::fs::read_dir(&trash_path).map_err(|e| e.to_string())? {
        let entry = match entry {
            Ok(e) => e,
            Err(_) => continue,
        };

        let path = entry.path();
        if path.is_dir() {
            let _ = std::fs::remove_dir_all(&path);
        } else {
            let _ = std::fs::remove_file(&path);
        }
    }

    Ok(())
}
