import { Terminal, Smartphone, Loader2 } from "lucide-react";

interface StatusBarProps {
  adbVersion: string;
  devicesCount: number;
  preheating?: boolean;
}

export function StatusBar({ adbVersion, devicesCount, preheating = false }: StatusBarProps) {
  // 提取 ADB 版本号（去掉换行和多余信息）
  const version = adbVersion.split("\n")[0].replace("Android Debug Bridge version ", "");

  return (
    <div className="border-t bg-card/50 backdrop-blur-sm h-10 flex items-center px-4 text-xs text-muted-foreground gap-6 sticky bottom-0">
      <div className="flex items-center gap-2">
        <Terminal className="w-3.5 h-3.5" />
        <span>ADB: {version}</span>
      </div>
      <div className="flex items-center gap-2">
        <Smartphone className="w-3.5 h-3.5" />
        <span>已连接: {devicesCount}</span>
      </div>
      {preheating && (
        <div className="flex items-center gap-2 text-blue-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>正在预热...</span>
        </div>
      )}
      <div className="ml-auto opacity-60">
        Sinodroid Pure v1.0
      </div>
    </div>
  );
}
