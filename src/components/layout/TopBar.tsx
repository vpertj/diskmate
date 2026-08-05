import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Clock, RefreshCw } from "lucide-react";
import { useDiskStore } from "@/stores";
import { getDiskInfo } from "@/lib/tauri-client";
import { cn } from "@/lib/utils";

const titleMap: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "仪表盘", subtitle: "磁盘总览与智能扫描" },
  "/cache": { title: "系统缓存清理", subtitle: "扫描并清理应用缓存和日志" },
  "/large-files": { title: "大文件扫描", subtitle: "找出占用空间最大的文件" },
  "/duplicates": { title: "重复文件检测", subtitle: "识别并删除重复文件" },
  "/uninstaller": { title: "应用卸载", subtitle: "彻底卸载应用并清理残留" },
  "/trash": { title: "废纸篓清理", subtitle: "查看并清空废纸篓" },
  "/visualizer": { title: "磁盘占用可视化", subtitle: "直观查看磁盘空间分布" },
};

/**
 * 顶部标题栏
 */
export function TopBar() {
  const location = useLocation().pathname;
  const { diskInfo, setDiskInfo, setLoading } = useDiskStore();
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    refreshDisk();
  }, []);

  const refreshDisk = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const info = await getDiskInfo();
      if (info) setDiskInfo(info);
    } catch (e) {
      console.error("获取磁盘信息失败:", e);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const meta = titleMap[location] || { title: "DiskMate", subtitle: "" };

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-surface-tertiary/30 bg-surface-secondary/30 backdrop-blur-xl">
      <div>
        <h2 className="text-base font-semibold text-ink-primary leading-none">
          {meta.title}
        </h2>
        <p className="text-xs text-ink-tertiary mt-1">{meta.subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {diskInfo && (
          <div className="text-xs text-ink-tertiary">
            <span className="text-macos-green font-mono font-semibold">
              {Math.round(diskInfo.available / 1024 / 1024 / 1024)} GB
            </span>{" "}
            可用
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-ink-tertiary font-mono">
          <Clock size={13} />
          {now.toLocaleTimeString("zh-CN", { hour12: false })}
        </div>

        <button
          onClick={refreshDisk}
          disabled={refreshing}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
            refreshing
              ? "text-ink-tertiary"
              : "text-ink-secondary hover:bg-surface-tertiary/50 hover:text-ink-primary"
          )}
          title="刷新磁盘信息"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
    </header>
  );
}
