import { Smartphone, Trash2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type SidebarType = "device" | "debloat" | "log";

interface SidebarProps {
  activeSidebar: SidebarType;
  setActiveSidebar: (type: SidebarType) => void;
  operationLogCount: number;
}

export function Sidebar({
  activeSidebar,
  setActiveSidebar,
  operationLogCount,
}: SidebarProps) {
  return (
    <aside className="w-64 border-r bg-card/50 overflow-y-auto flex-shrink-0 [&::-webkit-scrollbar]:hidden [&::-moz-scrollbar]:hidden h-screen sticky top-0">
      <div className="p-4 space-y-4">
        {/* Logo 区域 */}
        <div className="flex items-center gap-3">
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
            onClick={() => setActiveSidebar("device")}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            设备管理
          </Button>
          <Button
            variant={activeSidebar === "debloat" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveSidebar("debloat")}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            卸载预装应用
          </Button>
          <Button
            variant={activeSidebar === "log" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveSidebar("log")}
          >
            <History className="w-4 h-4 mr-2" />
            操作记录
            {operationLogCount > 0 && (
              <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 rounded-full">
                {operationLogCount}
              </span>
            )}
          </Button>
        </nav>
      </div>
    </aside>
  );
}
