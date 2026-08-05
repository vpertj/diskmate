// 与 Rust 端 serde 对齐的 TypeScript 类型定义

export type FileType =
  | "cache"
  | "log"
  | "largeFile"
  | "duplicate"
  | "appResidual"
  | "regular";

export type ScanModule =
  | "cache"
  | "largeFile"
  | "duplicate"
  | "uninstaller"
  | "trash"
  | "visualizer";

export interface FileEntry {
  path: string;
  size: number;
  modified: number;
  fileType: FileType;
  isDir: boolean;
}

export interface DiskInfo {
  total: number;
  used: number;
  available: number;
  name: string;
  mountPoint: string;
}

export interface ScanProgress {
  module: ScanModule;
  current: number;
  total: number;
  foundSize: number;
  currentPath: string;
  stage: string;
}

export interface ScanResult {
  entries: FileEntry[];
  totalSize: number;
  durationMs: number;
}

export interface DuplicateGroup {
  hash: string;
  size: number;
  files: FileEntry[];
}

export interface DeleteResult {
  deletedCount: number;
  freedSize: number;
  failed: DeleteFailure[];
}

export interface DeleteFailure {
  path: string;
  error: string;
}

export interface AppResidualResult {
  appName: string;
  bundleId: string | null;
  appPath: string;
  groups: ResidualGroup[];
  totalSize: number;
}

export interface ResidualGroup {
  category: string;
  files: FileEntry[];
  size: number;
}

export interface TreeNode {
  name: string;
  path: string;
  size: number;
  isDir: boolean;
  children: TreeNode[];
}

export interface TrashInfo {
  size: number;
  itemCount: number;
}
