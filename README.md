# DiskMate - 专业 Mac 磁盘清理工具

DiskMate 是一款基于 Tauri 2 + React 构建的专业级 macOS 磁盘清理工具，提供系统缓存清理、大文件扫描、重复文件检测、应用卸载残留、废纸篓清理、磁盘占用可视化等六大核心功能。

## 技术栈

- 前端：React 18 + TypeScript + Vite 5 + Tailwind CSS 3 + Zustand
- 后端：Rust + Tauri 2（walkdir / sha2 / trash / sysinfo / tokio）

## 功能特性

| 模块 | 描述 |
|------|------|
| Dashboard 仪表盘 | 磁盘总览环形图、健康度评分、智能扫描、6 模块快捷入口 |
| 系统缓存清理 | 扫描 ~/Library/Caches 和 Logs，按应用分组删除 |
| 大文件扫描 | 可配置阈值（50MB-1GB），列表展示和详情 |
| 重复文件检测 | 三阶段哈希算法（size → partial → full SHA256） |
| 应用卸载残留 | 扫描 Application Support/Preferences/Caches/Logs/Saved State |
| 废纸篓清理 | 显示占用大小，一键安全清空 |
| 磁盘占用可视化 | 矩形树图 + 详情面板 |

## 安全设计

- 所有删除操作通过 trash crate 移至废纸篓，可恢复
- 危险操作（清空废纸篓、卸载 App）必须二次确认

## 开发

```bash
npm install
npm run tauri dev
npm run tauri build
```

## 系统要求

- macOS 12+
- Node.js 18+
- Rust 1.70+
