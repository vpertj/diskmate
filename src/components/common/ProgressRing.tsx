import { cn } from "@/lib/utils";

interface ProgressRingProps {
  /** 进度百分比 0-100 */
  value: number;
  /** 环形大小（像素） */
  size?: number;
  /** 环形宽度 */
  strokeWidth?: number;
  /** 中心内容 */
  children?: React.ReactNode;
  /** 渐变色（起止） */
  from?: string;
  to?: string;
  className?: string;
  /** 是否显示流光动画 */
  animate?: boolean;
}

/**
 * 环形进度图组件
 * 用于 Dashboard 磁盘总览、扫描进度展示
 */
export function ProgressRing({
  value,
  size = 200,
  strokeWidth = 16,
  children,
  from = "#0A84FF",
  to = "#30D158",
  className,
  animate = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedValue = Math.max(0, Math.min(100, value));
  const offset = circumference - (clampedValue / 100) * circumference;

  const gradientId = `progress-gradient-${Math.random().toString(36).slice(2)}`;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className={cn("transform -rotate-90", animate && "transition-all duration-700 ease-out")}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        {/* 背景环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3A3A3C"
          strokeWidth={strokeWidth}
          opacity={0.4}
        />
        {/* 进度环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.7s ease-out",
          }}
        />
      </svg>
      {/* 中心内容 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
