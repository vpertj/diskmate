use std::path::PathBuf;

/// 获取用户主目录
pub fn home_dir() -> Option<PathBuf> {
    dirs::home_dir()
}

/// macOS 标准缓存路径列表
pub fn cache_paths() -> Vec<PathBuf> {
    let home = match home_dir() {
        Some(h) => h,
        None => return vec![],
    };

    vec![
        home.join("Library/Caches"),
        home.join("Library/Logs"),
        home.join("Library/Safari/Cache.db"),
        // 系统临时目录
        PathBuf::from("/tmp"),
        PathBuf::from("/private/var/folders"),
    ]
}

/// 应用残留可能存在的路径模式（基于应用名和 Bundle ID）
pub fn app_residual_paths(app_name: &str, bundle_id: &Option<String>) -> Vec<PathBuf> {
    let home = match home_dir() {
        Some(h) => h,
        None => return vec![],
    };

    let mut paths = vec![
        home.join("Library/Application Support").join(app_name),
        home.join("Library/Caches").join(app_name),
        home.join("Library/Logs").join(app_name),
        home.join("Library/Saved Application State").join(format!("{}.savedState", app_name)),
    ];

    // 如果有 Bundle ID，添加 plist 路径
    if let Some(bid) = bundle_id {
        paths.push(home.join("Library/Preferences").join(format!("{}.plist", bid)));
        paths.push(home.join("Library/Caches").join(bid));
        paths.push(home.join("Library/Saved Application State").join(format!("{}.savedState", bid)));
    }

    paths
}

/// /Applications 目录
pub fn applications_dir() -> PathBuf {
    PathBuf::from("/Applications")
}

/// 用户主目录下的常见扫描目录
pub fn common_scan_dirs() -> Vec<PathBuf> {
    let home = match home_dir() {
        Some(h) => h,
        None => return vec![],
    };

    vec![
        home.join("Documents"),
        home.join("Downloads"),
        home.join("Desktop"),
        home.join("Movies"),
        home.join("Pictures"),
    ]
}
