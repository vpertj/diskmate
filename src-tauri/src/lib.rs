mod commands;
mod models;
mod scanner;
mod utils;

use commands::{
    app_uninstaller, cache_scanner, disk_info, disk_visualizer, duplicate_scanner,
    large_file_scanner, trash_cleaner,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            // 磁盘信息
            disk_info::get_disk_info,
            // 系统缓存清理
            cache_scanner::scan_cache,
            cache_scanner::scan_logs,
            cache_scanner::delete_cache_items,
            // 大文件扫描
            large_file_scanner::scan_large_files,
            large_file_scanner::delete_large_files,
            // 重复文件检测
            duplicate_scanner::scan_duplicates,
            duplicate_scanner::delete_duplicates,
            // 应用卸载残留
            app_uninstaller::list_applications,
            app_uninstaller::scan_app_residual,
            app_uninstaller::uninstall_app,
            app_uninstaller::clean_app_residual,
            // 废纸篓清理
            trash_cleaner::get_trash_info,
            trash_cleaner::empty_trash,
            // 磁盘占用可视化
            disk_visualizer::scan_directory_tree,
        ])
        .run(tauri::generate_context!())
        .expect("error while running DiskMate application");
}
