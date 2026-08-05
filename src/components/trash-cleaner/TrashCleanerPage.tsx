import { useEffect, useState } from "react";
import { HardDriveDownload, Trash2, RefreshCw, CheckCircle2 } from "lucide-react";
import { ProgressRing } from "../common/ProgressRing";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { getTrashInfo, emptyTrash } from "@/lib/tauri-client";
import { formatSize } from "@/lib/utils";
import type { TrashInfo } from "@/types";

export function TrashCleanerPage() {
  const [trashInfo, setTrashInfo] = useState<TrashInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [emptying, setEmptying] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadTrashInfo = async () => {
    setLoading(true);
    try {
      const info = await getTrashInfo();
      if (info) setTrashInfo(info);
    } catch (e) {
      console.error("获取废纸篓信息失败:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrashInfo();
  }, []);

  const handleEmptyTrash = async () => {
    setConfirmOpen(false);
    setEmptying(true);
    try {
      await emptyTrash();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadTrashInfo();
    } catch (e) {
      console.error("清空废纸篓失败:", e);
    } finally {
      setEmptying(false);
    }
  };

  const usedPercent = trashInfo && trashInfo.size > 0
    ? Math.min(100, Math.log10(trashInfo.size / 1024 / 1024 + 1) * 25)
    : 0;

  return (
    <div className="h-full overflow-y-auto p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center text-white shadow-glow">
          <HardDriveDownload size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">废纸篓清理</h1>
          <p className="text-sm text-ink-tertiary mt-0.5">查看废纸篓占用并一键清空</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center hover-glow">
          {loading ? (
            <div className="w-20 h-20 rounded-full border-4 border-macos-blue/30 border-t-macos-blue animate-spin" />
          ) : success ? (
            <>
              <div className="w-24 h-24 rounded-full bg-macos-green/20 flex items-center justify-center mb-4">
                <CheckCircle2 size={48} className="text-macos-green" />
              </div>
              <span className="text-lg font-semibold text-macos-green">已清空！</span>
              <span className="text-xs text-ink-tertiary mt-1">磁盘空间已释放</span>
            </>
          ) : (
            <>
              <ProgressRing value={usedPercent} size={180} strokeWidth={14} from="#FFD60A" to="#FF9F0A" animate>
                <Trash2 size={36} className="text-macos-yellow mb-1" />
                <span className="text-2xl font-bold">{trashInfo ? formatSize(trashInfo.size) : "—"}</span>
                <span className="text-xs text-ink-tertiary mt-1">废纸篓占用</span>
              </ProgressRing>
              <div className="mt-4 text-center">
                <p className="text-sm text-ink-secondary">
                  {trashInfo ? `包含 ${trashInfo.itemCount} 个项目` : "未获取信息"}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="glass-card rounded-2xl p-8 flex flex-col justify-center hover-glow">
          <h3 className="text-lg font-semibold mb-2">一键清空废纸篓</h3>
          <p className="text-sm text-ink-tertiary mb-6 leading-relaxed">
            清空废纸篓将永久删除所有文件，无法恢复。请确认废纸篓中没有需要的文件后再执行此操作。
          </p>
          <div className="flex gap-3">
            <button
              onClick={loadTrashInfo}
              disabled={loading}
              className="h-11 px-5 rounded-xl bg-surface-tertiary text-ink-primary font-medium hover:bg-surface-elevated transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              刷新
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={emptying || !trashInfo || trashInfo.size === 0}
              className="flex-1 h-11 rounded-xl bg-macos-red/90 hover:bg-macos-red text-white font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,69,58,0.3)]"
            >
              <Trash2 size={16} />
              {emptying ? "清空中..." : "清空废纸篓"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="确认清空废纸篓"
        description={`将永久删除废纸篓中的所有 ${trashInfo?.itemCount ?? 0} 个项目，释放 ${formatSize(trashInfo?.size ?? 0)} 空间。此操作无法恢复。`}
        confirmText="确认清空"
        onConfirm={handleEmptyTrash}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
