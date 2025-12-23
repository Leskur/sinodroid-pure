import { Smartphone, Package, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SidebarType = "device" | "debloat" | "log" | "about";

interface SidebarProps {
  activeSidebar: SidebarType;
  setActiveSidebar: (type: SidebarType) => void;
  disabled?: boolean;
}

export function Sidebar({
  activeSidebar,
  setActiveSidebar,
  disabled = false,
}: SidebarProps) {
  return (
    <aside className="w-64 border-r bg-card/50 overflow-y-auto flex-shrink-0 [&::-webkit-scrollbar]:hidden [&::-moz-scrollbar]:hidden h-full sticky top-0 flex flex-col justify-between">
      <div className="p-4 space-y-4">
        {/* Logo 区域 */}
        <div
          className="flex items-center gap-3 select-none"
          data-tauri-drag-region
        >
          <div className="w-10 h-10 bg-gradient-to-br from-background to-muted rounded-xl border border-border/40 shadow-sm flex items-center justify-center">
            <svg
              className="w-5 h-5 drop-shadow-[0_0_8px_rgba(36,200,219,0.3)]"
              fill="none"
              stroke="url(#tauri-sidebar-gradient)"
              viewBox="0 0 24 24"
            >
              <defs>
                <linearGradient
                  id="tauri-sidebar-gradient"
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
          <span className="text-lg font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Sinodroid Pure
          </span>
        </div>

        {/* 导航菜单 */}
        <nav className="space-y-2">
          <Button
            variant={activeSidebar === "device" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => !disabled && setActiveSidebar("device")}
            disabled={disabled}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            设备管理
          </Button>
          <Button
            variant={activeSidebar === "debloat" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => !disabled && setActiveSidebar("debloat")}
            disabled={disabled}
          >
            <Package className="w-4 h-4 mr-2" />
            内置应用
          </Button>
          <Button
            variant={activeSidebar === "log" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveSidebar("log")}
            disabled={false}
          >
            <FileText className="w-4 h-4 mr-2" />
            系统记录
          </Button>
        </nav>
      </div>

      <div className="p-4">
        <Button
          variant={activeSidebar === "about" ? "secondary" : "ghost"}
          className="w-full justify-start text-muted-foreground/60 hover:text-foreground transition-all"
          onClick={() => setActiveSidebar("about")}
        >
          <Info className="w-4 h-4 mr-2" />
          关于软件
        </Button>
      </div>
    </aside>
  );
}
