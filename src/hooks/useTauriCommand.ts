import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { ScanProgress } from "@/types";

/**
 * 通用 Tauri command 调用 hook，统一错误处理
 */
export function useTauriCommand<T, A extends unknown[]>(
  command: string,
  options?: { onSuccess?: (data: T) => void; onError?: (e: string) => void }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (...args: A): Promise<T | null> => {
    setLoading(true);
    setError(null);

    // 构建 invoke 参数对象
    const argObj: Record<string, unknown> = {};
    if (args.length === 1 && typeof args[0] === "object" && args[0] !== null) {
      Object.assign(argObj, args[0] as object);
    } else {
      args.forEach((a, i) => {
        argObj[`arg${i}`] = a;
      });
    }

    try {
      const result = await invoke<T>(command, argObj);
      options?.onSuccess?.(result);
      return result;
    } catch (e) {
      const msg = typeof e === "string" ? e : String(e);
      setError(msg);
      console.error(`[Tauri Command] ${command} 失败:`, msg);
      options?.onError?.(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { run, loading, error };
}

/**
 * 监听扫描进度事件
 */
export function useScanProgress() {
  const [progress, setProgress] = useState<ScanProgress | null>(null);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setup = async () => {
      unlisten = await listen<ScanProgress>("scan-progress", (event) => {
        setProgress(event.payload);
      });
    };

    setup().catch(console.error);

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  return { progress, setProgress };
}
