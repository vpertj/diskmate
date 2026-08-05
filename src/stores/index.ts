import { create } from "zustand";
import type { DiskInfo, ScanProgress } from "@/types";

interface DiskState {
  diskInfo: DiskInfo | null;
  loading: boolean;
  error: string | null;

  setDiskInfo: (info: DiskInfo) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 计算健康度评分（0-100，越高越健康）
  healthScore: () => number;
  // 可用空间百分比
  freePercent: () => number;
}

export const useDiskStore = create<DiskState>((set, get) => ({
  diskInfo: null,
  loading: false,
  error: null,

  setDiskInfo: (info) => set({ diskInfo: info }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  healthScore: () => {
    const info = get().diskInfo;
    if (!info || info.total === 0) return 100;
    const usedPercent = (info.used / info.total) * 100;
    // 使用率越高，健康度越低
    return Math.max(0, Math.min(100, Math.round(100 - usedPercent * 1.2)));
  },

  freePercent: () => {
    const info = get().diskInfo;
    if (!info || info.total === 0) return 0;
    return Math.round((info.available / info.total) * 100);
  },
}));

interface ScanState {
  // 当前扫描的模块
  activeModule: string | null;
  // 扫描进度
  progress: ScanProgress | null;
  // 是否正在扫描
  scanning: boolean;

  setActiveModule: (module: string | null) => void;
  setProgress: (progress: ScanProgress | null) => void;
  setScanning: (scanning: boolean) => void;

  // 进度百分比
  progressPercent: () => number;
}

export const useScanStore = create<ScanState>((set, get) => ({
  activeModule: null,
  progress: null,
  scanning: false,

  setActiveModule: (module) => set({ activeModule: module }),
  setProgress: (progress) => set({ progress }),
  setScanning: (scanning) => set({ scanning }),

  progressPercent: () => {
    const p = get().progress;
    if (!p || p.total === 0) return 0;
    return Math.min(100, Math.round((p.current / p.total) * 100));
  },
}));
