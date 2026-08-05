use std::path::Path;
use tauri::{AppHandle, Emitter};
use crate::models::types::{ScanModule, ScanProgress, TreeNode};
use crate::utils::file_ops::dir_size;

/// 扫描目录树结构，返回层级化的 TreeNode（用于可视化）
/// - root_path: 扫描根目录
/// - max_depth: 最大递归深度（默认 3 层）
#[tauri::command]
pub async fn scan_directory_tree(
    app_handle: AppHandle,
    root_path: String,
    max_depth: Option<usize>,
) -> Result<TreeNode, String> {
    let root = Path::new(&root_path);
    if !root.exists() {
        return Err(format!("路径不存在: {}", root_path));
    }

    let app_handle = std::sync::Arc::new(app_handle);
    let max_depth = max_depth.unwrap_or(3);

    let tree = build_tree(root, 0, max_depth, &app_handle);

    Ok(tree)
}

/// 递归构建目录树
fn build_tree(
    path: &Path,
    current_depth: usize,
    max_depth: usize,
    app_handle: &std::sync::Arc<AppHandle>,
) -> TreeNode {
    let name = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| path.to_string_lossy().to_string());

    let metadata = path.metadata().ok();

    let is_dir = metadata.as_ref().map(|m| m.is_dir()).unwrap_or(false);

    // 推送进度
    let _ = app_handle.emit(
        "scan-progress",
        ScanProgress {
            module: ScanModule::Visualizer,
            current: current_depth as u32,
            total: max_depth as u32,
            found_size: 0,
            current_path: path.to_string_lossy().to_string(),
            stage: "building-tree".to_string(),
        },
    );

    if !is_dir {
        let size = metadata.map(|m| m.len()).unwrap_or(0);
        return TreeNode {
            name,
            path: path.to_string_lossy().to_string(),
            size,
            is_dir: false,
            children: vec![],
        };
    }

    // 达到最大深度，只计算总大小，不递归
    if current_depth >= max_depth {
        let size = dir_size(path);
        return TreeNode {
            name,
            path: path.to_string_lossy().to_string(),
            size,
            is_dir: true,
            children: vec![],
        };
    }

    // 递归构建子节点
    let mut children: Vec<TreeNode> = Vec::new();
    let mut total_size: u64 = 0;

    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries.filter_map(|e| e.ok()) {
            let child_path = entry.path();
            let child = build_tree(&child_path, current_depth + 1, max_depth, app_handle);
            total_size += child.size;
            children.push(child);
        }
    }

    // 子节点按大小降序排列
    children.sort_by(|a, b| b.size.cmp(&a.size));

    TreeNode {
        name,
        path: path.to_string_lossy().to_string(),
        size: total_size,
        is_dir: true,
        children,
    }
}
