import { invoke } from "@tauri-apps/api/core";
import type {
  AppResidualResult,
  DeleteResult,
  DiskInfo,
  DuplicateGroup,
  ScanResult,
  TrashInfo,
  TreeNode,
} from "@/types";

/**
 * Tauri IPC 调用封装层
 * 统一 error 处理，前端通过此模块调用 Rust 后端
 */

// 磁盘信息
export const getDiskInfo = (): Promise<DiskInfo> => invoke("get_disk_info");

// 系统缓存清理
export const scanCache = (): Promise<ScanResult> => invoke("scan_cache");
export const scanLogs = (): Promise<ScanResult> => invoke("scan_logs");
export const deleteCacheItems = (paths: string[]): Promise<DeleteResult> =>
  invoke("delete_cache_items", { paths });

// 大文件扫描
export const scanLargeFiles = (
  rootPath?: string,
  minSize?: number
): Promise<ScanResult> =>
  invoke("scan_large_files", { rootPath, minSize });
export const deleteLargeFiles = (paths: string[]): Promise<DeleteResult> =>
  invoke("delete_large_files", { paths });

// 重复文件检测
export const scanDuplicates = (paths: string[]): Promise<DuplicateGroup[]> =>
  invoke("scan_duplicates", { paths });
export const deleteDuplicates = (paths: string[]): Promise<DeleteResult> =>
  invoke("delete_duplicates", { paths });

// 应用卸载残留
export const listApplications = (): Promise<string[]> => invoke("list_applications");
export const scanAppResidual = (appName: string): Promise<AppResidualResult> =>
  invoke("scan_app_residual", { appName });
export const uninstallApp = (
  appPath: string,
  residualPaths: string[]
): Promise<DeleteResult> =>
  invoke("uninstall_app", { appPath, residualPaths });
export const cleanAppResidual = (paths: string[]): Promise<DeleteResult> =>
  invoke("clean_app_residual", { paths });

// 废纸篓清理
export const getTrashInfo = (): Promise<TrashInfo> => invoke("get_trash_info");
export const emptyTrash = (): Promise<void> => invoke("empty_trash");

// 磁盘占用可视化
export const scanDirectoryTree = (
  rootPath: string,
  maxDepth?: number
): Promise<TreeNode> =>
  invoke("scan_directory_tree", { rootPath, maxDepth });
