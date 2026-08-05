import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 删除/清空二次确认弹窗
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!open && !visible) return null;

  const variantStyles = {
    danger: "bg-macos-red/90 hover:bg-macos-red shadow-[0_0_30px_rgba(255,69,58,0.4)]",
    warning: "bg-macos-yellow/90 hover:bg-macos-yellow text-black shadow-[0_0_30px_rgba(255,214,10,0.4)]",
    default: "bg-gradient-accent hover:opacity-90 shadow-glow",
  };

  const iconColor = {
    danger: "text-macos-red",
    warning: "text-macos-yellow",
    default: "text-macos-blue",
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        open ? "animate-fade-in" : "opacity-0 transition-opacity duration-200"
      )}
    >
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* 对话框 */}
      <div
        className={cn(
          "glass-card relative w-full max-w-md rounded-2xl p-6 mx-4",
          open ? "animate-slide-up" : "opacity-0"
        )}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-ink-tertiary hover:text-ink-primary transition-colors"
          aria-label="关闭"
        >
          <X size={18} />
        </button>

        {/* 图标 */}
        <div className="mb-4 flex justify-center">
          <div
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center",
              "bg-surface-tertiary/50"
            )}
          >
            <AlertTriangle size={28} className={iconColor[variant]} />
          </div>
        </div>

        {/* 标题 */}
        <h2 className="text-xl font-bold text-center mb-2 text-ink-primary">
          {title}
        </h2>

        {/* 描述 */}
        {description && (
          <p className="text-sm text-ink-secondary text-center mb-6 leading-relaxed">
            {description}
          </p>
        )}

        {/* 按钮组 */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl bg-surface-tertiary text-ink-primary font-medium hover:bg-surface-elevated transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "flex-1 h-11 rounded-xl text-white font-semibold transition-all cursor-pointer",
              variantStyles[variant]
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
