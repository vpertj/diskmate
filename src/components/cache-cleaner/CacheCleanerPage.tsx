import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ScanLayout } from "../common/ScanLayout";
import { EmptyState } from "../common/EmptyState";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { useScanProgress } from "@/hooks/useTauriCommand";
import { useScanStore } from "@/stores";
import { scanCache, deleteCacheItems } from "@/lib/tauri-client";
import { formatSize, getFileName, getDirectory } from "@/lib/utils";
import type { ScanResult, DeleteResult } from "@/types";

export function CacheCleanerPage() {
  const { setActiveModule } = useScanStore();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteResult, setDeleteResult] = useState<DeleteResult | null>(null);

  const handleScan = async () => {
    setScanning(true);
    setActiveModule("cache");
    setSelected(new Set());
    try {
      const r = await scanCache();
      if (r) {
        setResult(r);
        const next = new Set(r.entries.map((e) => e.path));
        setSelected(next);
      }
    } catch (e) {
      console.error("缓存扫描失败:", e);
    } finally {
      setScanning(false);
      setActiveModule(null);
    }
  };

  const handleDelete = async () => {
    setConfirmOpen(false);
    const paths = Array.from(selected);
    const r = await deleteCacheItems(paths);
    if (r) {
      setDeleteResult(r);
      setSelected(new Set());
      setResult(null);
    }
  };

  const toggleSelect = (path: string) => {
    const next = new Set(selected);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setSelected(next);
  };

  const selectedSize = result?.entries
    .filter((e) => selected.has(e.path))
    .reduce((s, e) => s + e.size, 0) ?? 0;

  return (
    <>
      <ScanLayout
        title="系统缓存清理"
        description="扫描 ~/Library/Caches 和 ~/Library/Logs 下的应用缓存"
        icon={<Trash2 size={20} />}
        scanning={scanning}
        foundSize={result?.totalSize ?? 0}
        onScan={handleScan}
        scanText="扫描缓存"
        footer={
          result && result.entries.length > 0 ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (selected.size === result.entries.length) setSelected(new Set());
                    else setSelected(new Set(result.entries.map((e) => e.path)));
                  }}
                  className="text-sm text-ink-secondary hover:text-ink-primary cursor-pointer"
                >
                  {selected.size === result.entries.length ? "取消全选" : "全选"}
                </button>
                <span className="text-sm text-ink-tertiary">
                  已选 {selected.size} 项 · {formatSize(selectedSize)}
                </span>
              </div>
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={selected.size === 0}
                className="h-10 px-6 rounded-xl bg-macos-red/90 hover:bg-macos-red text-white font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,69,58,0.3)]"
              >
                清理选中
              </button>
            </div>
          ) : null
        }
      >
        {!result && !scanning && (
          <EmptyState title="点击扫描开始" description="扫描后，将显示所有可清理的缓存项" />
        )}
        {result && result.entries.length === 0 && (
          <EmptyState title="无缓存可清理" description="你的磁盘很干净！" />
        )}
        {result && result.entries.length > 0 && (
          <div className="space-y-2 pb-4">
            {result.entries.slice(0, 200).map((entry) => {
              const isSelected = selected.has(entry.path);
              return (
                <div
                  key={entry.path}
                  className={`glass-card rounded-xl p-3 flex items-center gap-3 transition-all cursor-pointer ${
                    isSelected ? "ring-1 ring-macos-blue/50" : ""
                  }`}
                  onClick={() => toggleSelect(entry.path)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(entry.path)}
                    className="w-4 h-4 accent-macos-blue cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-primary truncate">{getFileName(entry.path)}</p>
                    <p className="text-xs text-ink-tertiary truncate">{getDirectory(entry.path)}</p>
                  </div>
                  <span className="text-sm font-mono text-macos-green whitespace-nowrap">
                    {formatSize(entry.size)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </ScanLayout>

      <ConfirmDialog
        open={confirmOpen}
        title="确认清理缓存"
        description={`将清理 ${selected.size} 项缓存，释放 ${formatSize(selectedSize)} 空间。文件将移至废纸篓，可恢复。`}
        confirmText="确认清理"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
