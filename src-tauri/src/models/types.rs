use serde::{Deserialize, Serialize};

/// 文件条目 - 所有扫描模块的通用文件描述
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    /// 文件完整路径
    pub path: String,
    /// 文件大小（字节）
    pub size: u64,
    /// 修改时间（Unix 时间戳，秒）
    pub modified: u64,
    /// 文件分类
    pub file_type: FileType,
    /// 是否为目录
    pub is_dir: bool,
}

/// 扫描模块标识
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum ScanModule {
    Cache,
    LargeFile,
    Duplicate,
    Uninstaller,
    Trash,
    Visualizer,
}

/// 文件分类
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum FileType {
    Cache,
    Log,
    LargeFile,
    Duplicate,
    AppResidual,
    Regular,
}

/// 扫描进度事件 payload - 通过 Tauri event 推送前端
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanProgress {
    /// 当前模块
    pub module: ScanModule,
    /// 当前已处理数
    pub current: u32,
    /// 总数（预估）
    pub total: u32,
    /// 已发现的可清理空间（字节）
    pub found_size: u64,
    /// 当前正在扫描的路径
    pub current_path: String,
    /// 扫描阶段（用于重复检测的多阶段提示）
    pub stage: String,
}

/// 磁盘信息
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiskInfo {
    /// 总容量（字节）
    pub total: u64,
    /// 已用空间（字节）
    pub used: u64,
    /// 可用空间（字节）
    pub available: u64,
    /// 磁盘名称
    pub name: String,
    /// 挂载点
    pub mount_point: String,
}

/// 扫描结果 - 通用容器
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResult {
    /// 扫描到的文件条目
    pub entries: Vec<FileEntry>,
    /// 总可清理大小（字节）
    pub total_size: u64,
    /// 扫描耗时（毫秒）
    pub duration_ms: u64,
}

/// 重复文件组
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DuplicateGroup {
    /// 文件哈希（SHA256）
    pub hash: String,
    /// 单个文件大小（字节）
    pub size: u64,
    /// 重复的文件列表
    pub files: Vec<FileEntry>,
}

/// 删除结果
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteResult {
    /// 成功删除的文件数
    pub deleted_count: u32,
    /// 释放的空间（字节）
    pub freed_size: u64,
    /// 失败的文件列表
    pub failed: Vec<DeleteFailure>,
}

/// 删除失败项
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteFailure {
    pub path: String,
    pub error: String,
}

/// 应用残留扫描结果
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppResidualResult {
    /// 应用名称
    pub app_name: String,
    /// 应用 Bundle ID
    pub bundle_id: Option<String>,
    /// 应用本体路径
    pub app_path: String,
    /// 残留文件分组
    pub groups: Vec<ResidualGroup>,
    /// 总残留大小（字节）
    pub total_size: u64,
}

/// 残留文件分组
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResidualGroup {
    /// 分组名（如 Application Support、Preferences 等）
    pub category: String,
    /// 该组下的文件
    pub files: Vec<FileEntry>,
    /// 该组总大小
    pub size: u64,
}

/// 磁盘目录树节点 - 用于可视化
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TreeNode {
    /// 节点名称
    pub name: String,
    /// 完整路径
    pub path: String,
    /// 大小（字节）
    pub size: u64,
    /// 是否目录
    pub is_dir: bool,
    /// 子节点
    pub children: Vec<TreeNode>,
}

/// 垃圾桶信息
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrashInfo {
    /// 废纸篓占用大小（字节）
    pub size: u64,
    /// 废纸篓内文件数
    pub item_count: u32,
}
