import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind 类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化文件大小（字节 → 友好显示）
 * @example 1024 → "1 KB"
 * @example 1048576 → "1 MB"
 */
export function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(i === 0 ? 0 : 2)} ${units[i - 1]}`;
}

/**
 * 格式化数字（添加千分位分隔符）
 */
export function formatNumber(n: number): string {
  return n.toLocaleString("zh-CN");
}

/**
 * Unix 时间戳转友好日期
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 周前`;
  if (days < 365) return `${Math.floor(days / 30)} 个月前`;
  return date.toLocaleDateString("zh-CN");
}

/**
 * 从文件路径提取文件名
 */
export function getFileName(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

/**
 * 从文件路径提取所在目录
 */
export function getDirectory(path: string): string {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/") || "/";
}

/**
 * 从文件名提取扩展名
 */
export function getFileExtension(path: string): string {
  const name = getFileName(path);
  const parts = name.split(".");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].toLowerCase();
}

/**
 * 根据扩展名获取文件类型图标标识
 */
export function getFileTypeIcon(path: string): string {
  const ext = getFileExtension(path);
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "heic", "svg", "bmp"];
  const videoExts = ["mp4", "mov", "avi", "mkv", "flv", "wmv"];
  const audioExts = ["mp3", "wav", "aac", "flac", "m4a"];
  const docExts = ["pdf", "doc", "docx", "txt", "rtf", "md"];
  const archiveExts = ["zip", "rar", "7z", "tar", "gz", "dmg"];
  const codeExts = ["js", "ts", "tsx", "jsx", "py", "rs", "go", "java", "c", "cpp"];

  if (imageExts.includes(ext)) return "image";
  if (videoExts.includes(ext)) return "video";
  if (audioExts.includes(ext)) return "audio";
  if (docExts.includes(ext)) return "document";
  if (archiveExts.includes(ext)) return "archive";
  if (codeExts.includes(ext)) return "code";
  return "file";
}
