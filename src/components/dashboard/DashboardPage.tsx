import { useNavigate } from "react-router-dom";
import {
  Trash2,
  HardDrive,
  Files,
  Package,
  HardDriveDownload,
  BarChart3,
  Zap,
} from "lucide-react";
import { ProgressRing } from "../common/ProgressRing";
import { useDiskStore } from "@/stores";
import { formatSize, cn } from "@/lib/utils";

const moduleCards = [
  { to: "/cache", label: "缓存清理", desc: "应用缓存与日志", icon: Trash2, color: "from-blue-500 to-cyan-400" },
  { to: "/large-files", label: "大文件扫描", desc: "找出占用最大的文件", icon: HardDrive, color: "from-purple-500 to-pink-400" },
  { to: "/duplicates", label: "重复检测", desc: "识别重复文件", icon: Files, color: "from-orange-500 to-yellow-400" },
  { to: "/uninstaller", label: "应用卸载", desc: "彻底卸载残留", icon: Package, color: "from-red-500 to-rose-400" },
  { to: "/trash", label: "废纸篓", desc: "一键清空", icon: HardDriveDownload, color: "from-green-500 to-emerald-400" },
  { to: "/visualizer", label: "磁盘可视化", desc: "空间分布可视化", icon: BarChart3, color: "from-indigo-500 to-blue-400" },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { diskInfo, healthScore, freePercent } = useDiskStore();
  const health = healthScore();
  const free = freePercent();
  const usedPercent = diskInfo ? 100 - free : 0;

  return (
    <div className="h-full overflow-y-auto p-8 animate-fade-in">
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* 磁盘总览卡 */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center hover-glow">
          <ProgressRing value={usedPercent} size={180} strokeWidth={14} animate>
            <span className="text-4xl font-bold gradient-text">{usedPercent}%</span>
            <span className="text-xs text-ink-tertiary mt-1">磁盘已使用</span>
          </ProgressRing>
          {diskInfo && (
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-4 text-sm">
                <div>
                  <span className="text-ink-tertiary">已用</span>
                  <span className="ml-1 font-mono font-semibold">{formatSize(diskInfo.used)}</span>
                </div>
                <div className="w-px h-3 bg-surface-tertiary" />
                <div>
                  <span className="text-ink-tertiary">可用</span>
                  <span className="ml-1 font-mono font-semibold text-macos-green">{formatSize(diskInfo.available)}</span>
                </div>
              </div>
              <p className="text-xs text-ink-tertiary mt-1">总容量 {formatSize(diskInfo.total)}</p>
            </div>
          )}
        </div>

        {/* 健康度评分卡 */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center hover-glow">
          <ProgressRing value={health} size={180} strokeWidth={14} from="#30D158" to="#0A84FF" animate>
            <span className="text-4xl font-bold text-macos-green">{health}</span>
            <span className="text-xs text-ink-tertiary mt-1">健康度评分</span>
          </ProgressRing>
          <div className="mt-4 text-center">
            <p className="text-sm text-ink-secondary">
              {health > 80 ? "磁盘状态良好，继续保持" : health > 50 ? "建议清理释放空间" : "磁盘空间紧张，需立即清理"}
            </p>
            <p className="text-xs text-ink-tertiary mt-1">建议保持 20% 以上可用空间</p>
          </div>
        </div>

        {/* 智能扫描卡 */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center hover-glow relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-accent opacity-5" />
          <button
            onClick={() => navigate("/cache")}
            className="relative w-24 h-24 rounded-full bg-gradient-accent flex items-center justify-center shadow-glow hover:scale-105 transition-transform cursor-pointer mb-4 animate-pulse-glow"
          >
            <Zap size={40} className="text-white" />
          </button>
          <span className="relative text-lg font-semibold">智能扫描</span>
          <span className="relative text-xs text-ink-tertiary mt-1">一键扫描所有可清理项</span>
        </div>
      </div>

      {/* 功能模块网格 */}
      <h3 className="text-base font-semibold text-ink-primary mb-3">功能模块</h3>
      <div className="grid grid-cols-3 gap-4">
        {moduleCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.to}
              onClick={() => navigate(card.to)}
              className="glass-card rounded-2xl p-5 text-left hover-glow group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg", card.color)}>
                  <Icon size={22} />
                </div>
                <div>
                  <h4 className="font-semibold text-ink-primary group-hover:text-white transition-colors">{card.label}</h4>
                  <p className="text-xs text-ink-tertiary mt-0.5">{card.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
