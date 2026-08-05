import { useState } from "react";
import { Files } from "lucide-react";
import { ScanLayout } from "../common/ScanLayout";
import { EmptyState } from "../common/EmptyState";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { useScanStore } from "@/stores";
import { scanDuplicates, deleteDuplicates } from "@/lib/tauri-client";
import { formatSize, getFileName, getDirectory, formatDate } from "@/lib/utils";
import type { DuplicateGroup } from "@/types";

export function DuplicateFinderPage() {
  const { setActiveModule } = useScanStore();
  const [scanning, setScanning] = useState(false);
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [keepSet, setKeepSet] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    setActiveModule("duplicate");
    setGroups([]);
    setKeepSet(new Set());
    try {
      const paths = ["/Users/" + "tianjun" + "/Documents", "/Users/" + "tianjun" + "/Downloads"];
      const r = await scanDuplicates(paths);
      if (r) {
        setGroups(r);
        const keep = new Set<string>();
        r.forEach((g) => {
          if (g.files[0]) keep.add(g.files[0].path);
        });
        setKeepSet(keep);
      }
    } catch (e) {
      console.error("重复检测失败:", e);
    } finally {
      setScanning(false);
      setActiveModule(null);
    }
  };

  const toggleKeep = (path: string) => {
    const next = new Set(keepSet);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setKeepSet(next);
  };

  const deletePaths = groups
    .flatMap((g) => g.files)
    .map((f) => f.path)
    .filter((p) => !keepSet.has(p));

  const deleteSize = groups
    .flatMap((g) => g.files)
    .filter((f) => !keepSet.has(f.path))
    .reduce((s, f) => s + f.size, 0);

  const handleDelete = async () => {
    setConfirmOpen(false);
    await deleteDuplicates(deletePaths);
    setGroups([]);
    setKeepSet(new Set());
  };

  return (
    <>
      <ScanLayout
        title="重复文件检测"
        description="多阶段哈希算法精确识别重复文件"
        icon={<Files size={20} />}
        scanning={scanning}
        foundSize={deleteSize}
        onScan={handleScan}
        scanText="扫描重复文件"
        footer={
          groups.length > 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-tertiary">
                {groups.length} 组重复 · 将删除 {deletePaths.length} 个文件 · {formatSize(deleteSize)}
              </span>
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={deletePaths.length === 0}
                className="h-10 px-6 rounded-xl bg-macos-red/90 hover:bg-macos-red text-white font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                删除未保留项
              </button>
            </div>
          ) : null
        }
      >
        {!groups.length && !scanning && (
          <EmptyState title="点击扫描开始" description="扫描后，将显示所有重复文件组" />
        )}
        {groups.length === 0 && scanning && (
          <EmptyState title="正在扫描..." description="多阶段哈希检测中，请稍候" />
        )}
        {groups.length > 0 && (
          <div className="space-y-4 pb-4">
            {groups.map((group) => (
              <div key={group.hash} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-semibold">重复组</span>
                    <span className="ml-2 text-xs text-ink-tertiary">
                      {group.files.length} 个文件 · 每个大小 {formatSize(group.size)}
                    </span>
                  </div>
                  <span className="text-sm font-mono text-macos-yellow">
                    浪费 {formatSize(group.size * (group.files.length - 1))}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.files.map((file) => {
                    const kept = keepSet.has(file.path);
                    return (
                      <div
                        key={file.path}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                          kept ? "bg-macos-green/10 ring-1 ring-macos-green/30" : "bg-surface-tertiary/30"
                        }`}
                        onClick={() => toggleKeep(file.path)}
                      >
                        <input
                          type="checkbox"
                          checked={kept}
                          onChange={() => toggleKeep(file.path)}
                          className="w-4 h-4 accent-macos-green cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{getFileName(file.path)}</p>
                          <p className="text-xs text-ink-tertiary truncate">{getDirectory(file.path)}</p>
                        </div>
                        <span className="text-xs text-ink-tertiary">{formatDate(file.modified)}</span>
                        {kept && <span className="text-xs font-semibold text-macos-green">保留</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScanLayout>

      <ConfirmDialog
        open={confirmOpen}
        title="确认删除重复文件"
        description={`将删除 ${deletePaths.length} 个文件，释放 ${formatSize(deleteSize)} 空间。已标记"保留"的文件不会被删除。`}
        confirmText="确认删除"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
