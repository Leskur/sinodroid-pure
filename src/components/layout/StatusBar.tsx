import { useEffect, useState } from "react";
import { Smartphone, Loader2 } from "lucide-react";
import { getVersion } from "@tauri-apps/api/app";

interface StatusBarProps {
  connectedCount: number;
  selectedDevice: string | null;
  deviceName?: string;
  loading?: boolean;
  loadingText?: string;
}

export function StatusBar({
  connectedCount,
  selectedDevice,
  deviceName,
  loading,
  loadingText = "处理中...",
}: StatusBarProps) {
  const [appVersion, setAppVersion] = useState("");

  useEffect(() => {
    getVersion().then((v) => setAppVersion(v));
  }, []);

  return (
    <div className="border-t bg-card/80 backdrop-blur-md h-9 flex items-center px-4 gap-4 text-[10px] font-medium select-none overflow-hidden text-muted-foreground">
      {/* 1. Device Section */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`p-1 rounded-md transition-colors ${
            selectedDevice
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground/40"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" strokeWidth={1.5} />
        </div>

        {selectedDevice ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-foreground/90 truncate max-w-[120px] md:max-w-none font-sans">
              {deviceName || "Android Device"}
            </span>
            <div className="h-3 w-[1px] bg-border/60 mx-1" />
            <span className="font-mono text-muted-foreground/60 tracking-tight">
              {selectedDevice}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground/50">无设备连接</span>
        )}

        {connectedCount > 1 && (
          <div className="flex items-center px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground/60 font-mono text-[9px] tracking-tight">
            +{connectedCount - 1}
          </div>
        )}
      </div>

      {/* 2. Task Status (Center aligned via flex-1 spacer) */}
      <div className="flex-1 flex justify-center">
        {loading && (
          <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-primary/5 border border-primary/10 text-primary/80 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" strokeWidth={1.5} />
            <span className="font-mono tracking-tight">{loadingText}</span>
          </div>
        )}
      </div>

      {/* 3. System Status */}
      <div className="flex items-center gap-4 shrink-0 opacity-80 hover:opacity-100 transition-opacity">
        {/* ADB */}
        <div className="flex items-center gap-2 text-green-600/90 dark:text-green-500/90">
          <div className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
          </div>
          <span className="font-mono font-normal tracking-tight">
            ADB ONLINE
          </span>
        </div>

        {/* Divider */}
        <div className="h-3 w-[1px] bg-border/60" />

        {/* Version */}
        <div className="font-mono text-muted-foreground/40 tracking-widest font-normal">
          v{appVersion || "..."}
        </div>
      </div>
    </div>
  );
}
