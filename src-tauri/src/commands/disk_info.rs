use sysinfo::Disks;
use crate::models::types::DiskInfo;

/// 获取磁盘信息（总容量、已用、可用）
#[tauri::command]
pub async fn get_disk_info() -> Result<DiskInfo, String> {
    let disks = Disks::new_with_refreshed_list();

    // 优先选择挂载点为 / 的根磁盘
    let disk = disks
        .iter()
        .find(|d| d.mount_point().to_string_lossy() == "/")
        .or_else(|| disks.iter().next());

    let disk = match disk {
        Some(d) => d,
        None => return Err("未找到可用磁盘".to_string()),
    };

    let total = disk.total_space();
    let available = disk.available_space();
    let used = total.saturating_sub(available);

    Ok(DiskInfo {
        total,
        used,
        available,
        name: disk.name().to_string_lossy().to_string(),
        mount_point: disk.mount_point().to_string_lossy().to_string(),
    })
}
