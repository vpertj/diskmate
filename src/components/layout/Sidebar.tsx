import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Trash2,
  HardDrive,
  Files,
  Package,
  BarChart3,
  Sparkles,
  HardDriveDownload,
} from "lucide-react";
import { cn, formatSize } from "@/lib/utils";
import { useDiskStore } from "@/stores";

const navItems = [
  { to: "/", label: "仪表盘", icon: LayoutDashboard },
  { to: "/cache", label: "缓存清理", icon: Trash2 },
  { to: "/large-files", label: "大文件扫描", icon: HardDrive },
  { to: "/duplicates", label: "重复检测", icon: Files },
  { to: "/uninstaller", label: "应用卸载", icon: Package },
  { to: "/trash", label: "废纸篓", icon: HardDriveDownload },
  { to: "/visualizer", label: "磁盘可视化", icon: BarChart3 },
];

/**
 * 左侧导航栏
 */
export function Sidebar() {
  const { diskInfo, freePercent } = useDiskStore();
  const free = freePercent();
  const statusColor =
    free > 30 ? "#30D158" : free > 15 ? "#FFD60A" : "#FF453A";
  const statusText = free > 30 ? "健康" : free > 15 ? "警告" : "危险";

  return (
    <aside className="w-60 flex-shrink-0 bg-surface-secondary/50 backdrop-blur-xl border-r border-surface-tertiary/30 flex flex-col">
      {/* Logo 区域 */}
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-ink-primary leading-none">DiskMate</h1>
          <p className="text-[10px] text-ink-tertiary mt-0.5">磁盘清理专家</p>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-accent text-white shadow-glow"
                    : "text-ink-secondary hover:bg-surface-tertiary/50 hover:text-ink-primary cursor-pointer"
                )
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* 底部磁盘状态 */}
      {diskInfo && (
        <div className="p-4 border-t border-surface-tertiary/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-ink-tertiary">磁盘状态</span>
            <span
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: statusColor }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: statusColor }}
              />
              {statusText}
            </span>
          </div>
          <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${100 - free}%`,
                background: `linear-gradient(90deg, ${statusColor}aa, ${statusColor})`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-ink-tertiary">
            <span>已用 {formatSize(diskInfo.used)}</span>
            <span>剩余 {formatSize(diskInfo.available)}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
