import { useState } from "react";
import { BarChart3, FolderTree, RefreshCw } from "lucide-react";
import { EmptyState } from "../common/EmptyState";
import { scanDirectoryTree } from "@/lib/tauri-client";
import { formatSize, cn } from "@/lib/utils";
import type { TreeNode } from "@/types";

export function DiskVisualizerPage() {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [rootPath, setRootPath] = useState("/Users/tianjun");
  const [selected, setSelected] = useState<TreeNode | null>(null);

  const handleScan = async () => {
    setScanning(true);
    setTree(null);
    setSelected(null);
    try {
      const r = await scanDirectoryTree(rootPath, 3);
      if (r) {
        setTree(r);
        setSelected(r);
      }
    } catch (e) {
      console.error("目录树扫描失败:", e);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center text-white shadow-glow">
          <BarChart3 size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">磁盘占用可视化</h1>
          <p className="text-sm text-ink-tertiary mt-0.5">直观查看磁盘空间分布</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-3 mb-6 flex items-center gap-3">
        <FolderTree size={16} className="text-ink-tertiary" />
        <input
          type="text"
          value={rootPath}
          onChange={(e) => setRootPath(e.target.value)}
          placeholder="输入扫描路径..."
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-tertiary"
        />
        <button
          onClick={handleScan}
          disabled={scanning}
          className="h-9 px-4 rounded-lg bg-gradient-accent text-white text-sm font-medium transition-all cursor-pointer hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw size={14} className={scanning ? "animate-spin" : ""} />
          {scanning ? "扫描中" : "扫描"}
        </button>
      </div>

      {!tree && !scanning && (
        <EmptyState title="输入路径开始扫描" description="扫描后，将以矩形树图展示磁盘空间分布" />
      )}
      {scanning && <EmptyState title="正在扫描..." description="正在构建目录树结构" />}
      {tree && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4">矩形树图</h3>
            <div className="relative w-full h-[60vh] bg-surface rounded-xl overflow-hidden p-2 flex flex-wrap gap-1">
              {tree.children
                .sort((a, b) => b.size - a.size)
                .map((child) => (
                  <TreemapCell
                    key={child.path}
                    node={child}
                    onSelect={setSelected}
                    selected={selected}
                  />
                ))}
            </div>
          </div>
          <div className="col-span-1 glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4">详情</h3>
            {selected ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-ink-tertiary mb-1">名称</p>
                  <p className="text-sm font-medium truncate">{selected.name}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-tertiary mb-1">路径</p>
                  <p className="text-xs text-ink-secondary break-all">{selected.path}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-tertiary mb-1">大小</p>
                  <p className="text-lg font-bold gradient-text">{formatSize(selected.size)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-tertiary mb-1">类型</p>
                  <p className="text-sm">{selected.isDir ? "文件夹" : "文件"}</p>
                </div>
                {selected.isDir && selected.children.length > 0 && (
                  <div>
                    <p className="text-xs text-ink-tertiary mb-2">子项（前 5 大）</p>
                    <div className="space-y-1">
                      {selected.children
                        .sort((a, b) => b.size - a.size)
                        .slice(0, 5)
                        .map((c) => (
                          <button
                            key={c.path}
                            onClick={() => setSelected(c)}
                            className="w-full flex items-center justify-between p-2 rounded-lg bg-surface-tertiary/30 hover:bg-surface-tertiary/50 transition-all cursor-pointer text-left"
                          >
                            <span className="text-xs truncate">{c.name}</span>
                            <span className="text-xs font-mono text-macos-green">{formatSize(c.size)}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState title="选择一个节点" description="点击树图查看详情" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getColorForSize(size: number): string {
  if (size > 1024 * 1024 * 1024) return "linear-gradient(135deg, #0A84FF, #5E5CE6)";
  if (size > 100 * 1024 * 1024) return "linear-gradient(135deg, #5E5CE6, #FF453A)";
  if (size > 10 * 1024 * 1024) return "linear-gradient(135deg, #FF9F0A, #FFD60A)";
  if (size > 1024 * 1024) return "linear-gradient(135deg, #30D158, #0A84FF)";
  return "linear-gradient(135deg, #3A3A3C, #48484A)";
}

function TreemapCell({
  node,
  onSelect,
  selected,
}: {
  node: TreeNode;
  onSelect: (n: TreeNode) => void;
  selected: TreeNode | null;
}) {
  const isSelected = selected?.path === node.path;
  return (
    <button
      onClick={() => onSelect(node)}
      className={cn(
        "rounded-lg flex flex-col items-center justify-center p-3 cursor-pointer transition-all hover:scale-[1.02] min-w-[80px]",
        isSelected ? "ring-2 ring-white" : ""
      )}
      style={{
        background: getColorForSize(node.size),
        flexGrow: Math.max(1, Math.floor(node.size / 1024 / 1024)),
        minHeight: "60px",
      }}
    >
      <span className="text-xs text-white font-medium truncate max-w-full">{node.name}</span>
      <span className="text-[10px] text-white/80 mt-0.5">{formatSize(node.size)}</span>
    </button>
  );
}
