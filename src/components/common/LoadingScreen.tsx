import { Server, Settings, ShieldCheck, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const currentStepData = steps[currentStepIndex] || steps[0];
  const CurrentIcon = currentStepData.icon;

  return (
    <div className="relative min-h-screen w-full bg-background flex flex-col items-center justify-center overflow-hidden selection:bg-primary/20">
      {/* 背景光效装饰 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full opacity-20 animate-pulse" />

      {/* 主体卡片 - 极致纯净版 (Ultimate Pure) */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* 1. Logo 核心视觉 - 氛围感状态 (Ambient Status) */}
        <div className="relative group mb-8 animate-in zoom-in-90 fade-in duration-700 ease-out">
          {/* 呼吸光晕：加载时呼吸，就绪时绽放 */}
          <div
            className={cn(
              "absolute inset-0 blur-2xl rounded-full transition-all duration-1000",
              currentStage === "ready"
                ? "bg-green-500/20 opacity-50 scale-110"
                : "bg-primary/20 opacity-30 animate-pulse"
            )}
          />

          <div
            className={cn(
              "relative w-24 h-24 bg-gradient-to-br from-background to-muted rounded-[2rem] border shadow-2xl flex items-center justify-center transform transition-transform duration-700 hover:scale-105",
              currentStage === "ready"
                ? "border-green-500/20"
                : "border-border/40"
            )}
          >
            <svg
              className={cn(
                "w-10 h-10 transition-colors duration-700",
                currentStage === "ready"
                  ? "text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                  : "drop-shadow-[0_0_10px_rgba(36,200,219,0.4)]"
              )}
              fill="none"
              stroke={
                currentStage === "ready"
                  ? "currentColor"
                  : "url(#tauri-gradient)"
              }
              viewBox="0 0 24 24"
            >
              <defs>
                <linearGradient
                  id="tauri-gradient"
                  x1="100%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#FFC131" />
                  <stop offset="100%" stopColor="#24C8DB" />
                </linearGradient>
              </defs>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
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
            </div>

            {/* 自适应分段进度条 (Smart Segmented) */}
            <div className="flex items-center gap-2 mt-2">
              {steps.map((_, index) => {
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;

                return (
                  <div
                    key={index}
                    className={cn(
                      "h-1 rounded-full transition-all duration-500 ease-out",
                      isActive
                        ? "w-8 bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
                        : "w-2 bg-primary/20 dark:bg-primary/30",
                      isCompleted && "w-2.5 bg-primary/60 dark:bg-primary/70"
                    )}
                  />
                );
              })}
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
