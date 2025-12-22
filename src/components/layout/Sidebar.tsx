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
        <div className="flex items-center gap-3" data-tauri-drag-region>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
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
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => setActiveSidebar("about")}
        >
          <Info className="w-4 h-4 mr-2" />
          关于软件
        </Button>
      </div>
    </aside>
  );
}
