import { useEffect, useState } from "react";
import {
  Check,
  Loader2,
  Server,
  Settings,
  ShieldCheck,
  Rocket,
} from "lucide-react";

export type LoadingStepKey = "check" | "setup" | "server" | "ready";

interface LoadingStep {
  id: LoadingStepKey;
  title: string;
  description: string;
  icon: React.ElementType;
}

export function LoadingScreen({
  currentStage = "check",
}: {
  currentStage?: LoadingStepKey;
}) {
  // 步骤定义
  const steps: LoadingStep[] = [
    {
      id: "check",
      title: "环境验证",
      description: "正在校验运行环境...",
      icon: ShieldCheck,
    },
    {
      id: "setup",
      title: "组件配置",
      description: "配置 ADB 核心组件...",
      icon: Settings,
    },
    {
      id: "server",
      title: "服务启动",
      description: "初始化设备通信服务...",
      icon: Server,
    },
    {
      id: "ready",
      title: "即将就绪",
      description: "准备完成，马上开始...",
      icon: Rocket,
    },
  ];

  // 计算当前步骤的索引和总进度
  const currentStepIndex = steps.findIndex((s) => s.id === currentStage);
  // 进度计算：基础进度(index/length) + 微调
  const baseProgress = ((currentStepIndex + 1) / steps.length) * 100;

  // 使用平滑过渡的进度显示
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    setDisplayProgress(baseProgress);
  }, [baseProgress]);

  const currentStepData = steps[currentStepIndex] || steps[0];
  const CurrentIcon = currentStepData.icon;

  return (
    <div className="relative min-h-screen w-full bg-background flex flex-col items-center justify-center overflow-hidden selection:bg-primary/20">
      {/* 背景光效装饰 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full opacity-20 animate-pulse" />

      {/* 主体卡片 - 极致纯净版 (Ultimate Pure) */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* 1. Logo 核心视觉 */}
        <div className="relative group mb-8 animate-in zoom-in-90 fade-in duration-700 ease-out">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-background to-muted rounded-[2rem] border border-border/40 shadow-2xl flex items-center justify-center transform transition-transform duration-700 hover:scale-105">
            <svg
              className="w-10 h-10 text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          {/* 状态指示徽标 - 仅在 Logo 上显示微小的动态反馈 */}
          <div className="absolute -bottom-2 -right-2 transition-all duration-500">
            {currentStage === "ready" ? (
              <div className="w-7 h-7 bg-background rounded-full flex items-center justify-center border border-border shadow-sm animate-in zoom-in">
                <Check className="w-4 h-4 text-green-500" />
              </div>
            ) : (
              <div className="w-7 h-7 bg-background rounded-full flex items-center justify-center border border-border shadow-sm animate-in zoom-in">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* 2. 文本与状态融合 */}
        <div className="space-y-5 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200 fill-mode-both">
          {/* 标题 */}
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-b from-foreground to-muted-foreground/70 bg-clip-text text-transparent">
            Sinodroid Pure
          </h1>

          {/* 动态状态行: 替代原来的 Slogan */}
          <div className="flex flex-col items-center gap-4 min-h-[60px]">
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground/80 font-medium tracking-wide">
              <CurrentIcon className="w-3.5 h-3.5 text-primary/70" />
              <span>{currentStepData.description}</span>
              <span className="font-mono text-xs opacity-40 tabular-nums">
                {Math.round(displayProgress)}%
              </span>
            </div>

            {/* 极简微型进度条 - 放在文字正下方作为装饰线 */}
            <div className="h-0.5 w-24 bg-muted/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/60 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 底部版权/版本 */}
      <div className="absolute bottom-6 text-[10px] text-muted-foreground/40 font-mono tracking-widest uppercase">
        Version 0.1.0 Beta
      </div>
    </div>
  );
}
