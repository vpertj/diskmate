import { useState } from "react";
import { HardDrive } from "lucide-react";
import { ScanLayout } from "../common/ScanLayout";
import { EmptyState } from "../common/EmptyState";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { useScanStore } from "@/stores";
import { scanLargeFiles, deleteLargeFiles } from "@/lib/tauri-client";
import { formatSize, getFileName, getDirectory, formatDate } from "@/lib/utils";
import type { ScanResult } from "@/types";

export function LargeFilesPage() {
  const { setActiveModule } = useScanStore();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [minSize, setMinSize] = useState(100 * 1024 * 1024);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    setActiveModule("largeFile");
    try {
      const r = await scanLargeFiles(undefined, minSize);
      if (r) setResult(r);
    } catch (e) {
      console.error("大文件扫描失败:", e);
    } finally {
      setScanning(false);
      setActiveModule(null);
    }
  };

  const handleDelete = async () => {
    setConfirmOpen(false);
    const paths = Array.from(selected);
    await deleteLargeFiles(paths);
    setSelected(new Set());
    setResult(null);
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
        title="大文件扫描"
        description="扫描用户主目录下占用空间最大的文件"
        icon={<HardDrive size={20} />}
        scanning={scanning}
        foundSize={result?.totalSize ?? 0}
        onScan={handleScan}
        scanText="扫描大文件"
        configArea={
          <div className="glass-card rounded-xl p-4">
            <label className="text-sm text-ink-secondary">最小文件大小: {formatSize(minSize)}</label>
            <input
              type="range"
              min={50 * 1024 * 1024}
              max={1024 * 1024 * 1024}
              step={50 * 1024 * 1024}
              value={minSize}
              onChange={(e) => setMinSize(Number(e.target.value))}
              className="w-full mt-2 accent-macos-blue cursor-pointer"
            />
          </div>
        }
        footer={
          result && result.entries.length > 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-tertiary">
                已选 {selected.size} 项 · {formatSize(selectedSize)}
              </span>
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={selected.size === 0}
                className="h-10 px-6 rounded-xl bg-macos-red/90 hover:bg-macos-red text-white font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                移到废纸篓
              </button>
            </div>
          ) : null
        }
      >
        {!result && !scanning && (
          <EmptyState title="点击扫描开始" description="扫描后，将显示所有大文件" />
        )}
        {result && result.entries.length === 0 && (
          <EmptyState title="未发现大文件" description="当前阈值下没有匹配的文件" />
        )}
        {result && result.entries.length > 0 && (
          <div className="space-y-2 pb-4">
            {result.entries.map((entry) => {
              const isSelected = selected.has(entry.path);
              return (
                <div
                  key={entry.path}
                  className={`glass-card rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all ${
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
                    <p className="text-sm font-medium truncate">{getFileName(entry.path)}</p>
                    <p className="text-xs text-ink-tertiary truncate">{getDirectory(entry.path)}</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="text-sm font-mono text-macos-green">{formatSize(entry.size)}</p>
                    <p className="text-xs text-ink-tertiary">{formatDate(entry.modified)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScanLayout>

      <ConfirmDialog
        open={confirmOpen}
        title="确认删除大文件"
        description={`将删除 ${selected.size} 个文件，释放 ${formatSize(selectedSize)} 空间。文件将移至废纸篓。`}
        confirmText="确认删除"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
