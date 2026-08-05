import { type ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * 无数据空状态占位组件
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-surface-tertiary/30 flex items-center justify-center mb-4 text-ink-tertiary">
        {icon || <Inbox size={28} />}
      </div>
      <h3 className="text-lg font-semibold text-ink-secondary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-ink-tertiary max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
