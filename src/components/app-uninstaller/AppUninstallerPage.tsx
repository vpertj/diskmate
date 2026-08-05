import { useState } from "react";
import { Package, Search } from "lucide-react";
import { EmptyState } from "../common/EmptyState";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { listApplications, scanAppResidual, uninstallApp } from "@/lib/tauri-client";
import { formatSize, getFileName } from "@/lib/utils";
import type { AppResidualResult } from "@/types";

export function AppUninstallerPage() {
  const [apps, setApps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [residual, setResidual] = useState<AppResidualResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadApps = async () => {
    setLoading(true);
    try {
      const list = await listApplications();
      if (list) setApps(list);
    } catch (e) {
      console.error("加载应用列表失败:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleScanResidual = async (appName: string) => {
    setSelected(appName);
    setScanning(true);
    setResidual(null);
    try {
      const r = await scanAppResidual(appName);
      if (r) setResidual(r);
    } catch (e) {
      console.error("扫描残留失败:", e);
    } finally {
      setScanning(false);
    }
  };

  const handleUninstall = async () => {
    setConfirmOpen(false);
    if (!residual) return;
    const paths = residual.groups.flatMap((g) => g.files.map((f) => f.path));
    await uninstallApp(residual.appPath, paths);
    setResidual(null);
    setSelected(null);
  };

  const filtered = apps.filter((a) => a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full overflow-y-auto p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center text-white shadow-glow">
          <Package size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">应用卸载</h1>
          <p className="text-sm text-ink-tertiary mt-0.5">彻底卸载应用并清理残留文件</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-3 mb-6 flex items-center gap-3">
        <Search size={16} className="text-ink-tertiary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索应用..."
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-tertiary"
        />
        <button
          onClick={loadApps}
          disabled={loading}
          className="text-sm text-macos-blue cursor-pointer hover:underline disabled:opacity-50"
        >
          {loading ? "加载中..." : apps.length ? "刷新" : "加载应用列表"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-1 max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 && !loading && (
            <EmptyState title="暂无应用" description="点击右上角加载应用列表" />
          )}
          {filtered.map((app) => (
            <button
              key={app}
              onClick={() => handleScanResidual(app)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer text-left ${
                selected === app ? "bg-gradient-accent text-white shadow-glow" : "glass-card hover:opacity-90"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                selected === app ? "bg-white/20" : "bg-surface-tertiary"
              }`}>
                <Package size={16} />
              </div>
              <span className="text-sm font-medium truncate">{app.replace(".app", "")}</span>
            </button>
          ))}
        </div>

        <div className="col-span-2">
          {!selected && <EmptyState title="选择一个应用" description="点击左侧应用查看残留文件" />}
          {selected && scanning && <EmptyState title="扫描中..." description="正在查找残留文件" />}
          {residual && !scanning && (
            <div className="space-y-4">
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{residual.appName}</h3>
                    <p className="text-xs text-ink-tertiary mt-1">Bundle ID: {residual.bundleId || "未知"}</p>
                    <p className="text-xs text-ink-tertiary">路径: {residual.appPath}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold gradient-text">{formatSize(residual.totalSize)}</span>
                    <p className="text-xs text-ink-tertiary mt-1">总残留大小</p>
                  </div>
                </div>
              </div>

              {residual.groups.length === 0 ? (
                <EmptyState title="无残留文件" description="该应用很干净" />
              ) : (
                residual.groups.map((group) => (
                  <div key={group.category} className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{group.category}</span>
                      <span className="text-sm font-mono text-macos-green">{formatSize(group.size)}</span>
                    </div>
                    <div className="space-y-1">
                      {group.files.slice(0, 10).map((f) => (
                        <div key={f.path} className="text-xs text-ink-tertiary truncate py-1">
                          {getFileName(f.path)} - {formatSize(f.size)}
                        </div>
                      ))}
                      {group.files.length > 10 && (
                        <div className="text-xs text-ink-tertiary">+ {group.files.length - 10} 项更多</div>
                      )}
                    </div>
                  </div>
                ))
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={residual.groups.length === 0}
                  className="flex-1 h-11 rounded-xl bg-macos-red/90 hover:bg-macos-red text-white font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  彻底卸载
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="确认彻底卸载"
        description={`将删除 ${residual?.appName} 及所有残留文件，释放 ${formatSize(residual?.totalSize ?? 0)} 空间。此操作不可恢复。`}
        confirmText="确认卸载"
        onConfirm={handleUninstall}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
