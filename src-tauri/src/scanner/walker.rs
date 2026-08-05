use std::path::Path;
use walkdir::{DirEntry, WalkDir};
use crate::models::types::{FileEntry, FileType, ScanModule, ScanProgress};

/// 遍历回调类型
pub type ProgressCallback = Box<dyn Fn(ScanProgress) + Send + Sync + 'static>;

/// 异步扫描目录，对每个文件执行回调
pub fn scan_directory<F>(
    root: &Path,
    module: ScanModule,
    file_type: FileType,
    mut on_file: F,
    progress: Option<&ProgressCallback>,
) -> Vec<FileEntry>
where
    F: FnMut(&FileEntry),
{
    let mut entries = Vec::new();
    let mut current: u32 = 0;
    let mut found_size: u64 = 0;

    // 不预估总数（total=0 表示未知），扫描中动态递增 current
    for entry in WalkDir::new(root).follow_links(true).into_iter().filter_map(|e| e.ok()) {
        current += 1;

        let metadata = match entry.metadata() {
            Ok(m) => m,
            Err(_) => continue,
        };

        let path_str = entry.path().to_string_lossy().to_string();

        // 推送进度（节流：每 100 项推送一次）
        if current % 100 == 0 {
            if let Some(cb) = progress {
                cb(ScanProgress {
                    module,
                    current,
                    total: 0,
                    found_size,
                    current_path: path_str.clone(),
                    stage: "scanning".to_string(),
                });
            }
        }

        if !metadata.is_file() {
            continue;
        }

        let modified = metadata
            .modified()
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs())
            .unwrap_or(0);

        let entry_file = FileEntry {
            path: path_str,
            size: metadata.len(),
            modified,
            file_type: file_type.clone(),
            is_dir: false,
        };

        found_size += metadata.len();
        on_file(&entry_file);
        entries.push(entry_file);
    }

    entries
}

/// 判断是否为隐藏文件（macOS 风格，以 . 开头）
pub fn is_hidden(entry: &DirEntry) -> bool {
    entry
        .file_name()
        .to_str()
        .map(|s| s.starts_with('.'))
        .unwrap_or(false)
}
