import { type ReactNode } from "react";
import { Loader2, Search } from "lucide-react";
import { cn, formatSize } from "@/lib/utils";
import { useScanStore } from "@/stores";

interface ScanLayoutProps {
  title: string;
  description: string;
  icon: ReactNode;
  scanning: boolean;
  foundSize?: number;
  onScan: () => void;
  scanText?: string;
  scanningText?: string;
  configArea?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * 扫描模块通用布局
 */
export function ScanLayout({
  title,
  description,
  icon,
  scanning,
  foundSize = 0,
  onScan,
  scanText = "开始扫描",
  scanningText = "扫描中...",
  configArea,
  children,
  footer,
}: ScanLayoutProps) {
  const { progress, progressPercent } = useScanStore();
  const percent = progressPercent();

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* 头部 */}
      <div className="px-8 pt-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center text-white shadow-glow">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ink-primary">{title}</h1>
              <p className="text-sm text-ink-tertiary mt-0.5">{description}</p>
            </div>
          </div>
          <button
            onClick={onScan}
            disabled={scanning}
            className={cn(
              "h-11 px-6 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-2",
              scanning
                ? "bg-surface-tertiary text-ink-tertiary cursor-not-allowed"
                : "bg-gradient-accent text-white shadow-glow hover:opacity-90 hover:-translate-y-0.5"
            )}
          >
            {scanning ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {scanningText}
              </>
            ) : (
              <>
                <Search size={18} />
                {scanText}
              </>
            )}
          </button>
        </div>

        {configArea && <div className="mb-4">{configArea}</div>}

        {scanning && progress && (
          <div className="glass-card rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-ink-secondary">
                {progress.stage === "scanning" ? "扫描中" : "处理中"}
              </span>
              <span className="text-sm font-mono text-ink-primary">{percent}%</span>
            </div>
            <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
              <div
                className="h-full progress-shimmer rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-ink-tertiary truncate max-w-[60%]" title={progress.currentPath}>
                {progress.currentPath}
              </span>
              <span className="text-xs font-mono text-macos-green count-up">
                已发现 {formatSize(foundSize)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto px-8">{children}</div>

      {/* 底部操作栏 */}
      {footer && (
        <div className="px-8 py-4 border-t border-surface-tertiary/50 bg-surface-secondary/30 backdrop-blur-xl">
          {footer}
        </div>
      )}
    </div>
  );
}
