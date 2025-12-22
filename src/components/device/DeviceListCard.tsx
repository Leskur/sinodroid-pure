import { RefreshCw, Smartphone, Unplug, Usb, Wifi, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Device, type DeviceConnectionType } from "@/lib/adb";

interface DeviceListCardProps {
  devices: Device[];
  selectedDevice: string;
  setSelectedDevice: (id: string) => void;
  refreshDevices: () => Promise<void>;
  autoDetect: boolean;
  setAutoDetect: (value: boolean) => void;
  disconnectDevice: (deviceId: string) => Promise<void>;
}

// 获取连接类型的样式配置
const getConnectionTypeConfig = (type?: DeviceConnectionType) => {
  switch (type) {
    case "wifi":
      return {
        icon: Wifi,
        label: "WiFi",
        color: "text-blue-400",
        bg: "bg-blue-500/20",
        badgeColor: "bg-blue-600 text-blue-100",
      };
    case "usb":
      return {
        icon: Usb,
        label: "USB",
        color: "text-green-400",
        bg: "bg-green-500/20",
        badgeColor: "bg-green-600 text-green-100",
      };
    default:
      // 默认当作 USB 处理
      return {
        icon: Usb,
        label: "USB",
        color: "text-green-400",
        bg: "bg-green-500/20",
        badgeColor: "bg-green-600 text-green-100",
      };
  }
};

export function DeviceListCard({
  devices,
  selectedDevice,
  setSelectedDevice,
  refreshDevices,
  autoDetect,
  setAutoDetect,
  disconnectDevice,
}: DeviceListCardProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* 标题栏与操作 */}
      <div className="flex items-center justify-between min-h-[42px]">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500 dark:text-blue-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-none">设备列表</h3>
            <p className="text-xs text-muted-foreground mt-1">
              选择要操作的设备
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {autoDetect && (
            <div className="flex items-center gap-1.5 text-[10px] px-2 py-1 bg-green-500/10 text-green-600 rounded-full animate-pulse mr-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              检测中
            </div>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={refreshDevices}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="刷新设备列表"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant={autoDetect ? "secondary" : "ghost"}
            onClick={() => setAutoDetect(!autoDetect)}
            className={cn(
              "h-8 text-xs font-normal",
              autoDetect &&
                "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
            )}
          >
            {autoDetect ? "自动检测" : "开启自动"}
          </Button>
        </div>
      </div>

      {/* 设备列表区域 */}
      <div className="rounded-xl border border-border/40 bg-card/30 overflow-hidden">
        {devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/60 gap-3">
            <div className="bg-muted/50 p-4 rounded-full">
              <Smartphone className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-sm">未发现设备</p>
            <p className="text-xs opacity-70">
              请通过 USB 连接设备或使用 WiFi 连接
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border/40">
              {devices.map((device) => {
                const connectionType = device.connectionType || "usb";
                const config = getConnectionTypeConfig(connectionType);
                const Icon = config.icon;
                const isWifi = connectionType === "wifi";
                const isSelected = selectedDevice === device.id;

                return (
                  <div
                    key={device.id}
                    onClick={() => setSelectedDevice(device.id)}
                    className={cn(
                      "group relative flex items-center p-4 cursor-pointer transition-all hover:bg-muted/30",
                      isSelected && "bg-blue-50/50 dark:bg-blue-900/10"
                    )}
                  >
                    {/* 左侧指示条 */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                    )}

                    {/* 图标 */}
                    <div
                      className={cn(
                        "p-2.5 rounded-lg shrink-0 mr-4 transition-colors",
                        isSelected
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-muted/50 text-muted-foreground",
                        config.color // Overlay specific color if needed
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "font-medium text-sm truncate",
                            isSelected
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-foreground"
                          )}
                        >
                          {device.id}
                        </span>
                        {device.status !== "device" && (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 h-4 border-amber-200 bg-amber-50 text-amber-700"
                          >
                            {device.status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isWifi ? "bg-blue-400" : "bg-green-400"
                            )}
                          />
                          {config.label} 连接
                        </span>
                      </div>
                    </div>

                    {/* WiFi 断开操作 */}
                    {isWifi && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          disconnectDevice(device.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 rounded-full"
                        title="断开连接"
                      >
                        <Unplug className="w-4 h-4" />
                      </Button>
                    )}

                    {/* 选中时的对勾 */}
                    {isSelected && !isWifi && (
                      <div className="w-8 flex justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 列表底部信息栏 */}
            <div className="bg-muted/30 border-t border-border/40 px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground select-none">
              <div className="flex items-center gap-1.5 opacity-70">
                <Info className="w-3 h-3" />
                <span>需开启开发者模式和 USB 调试</span>
              </div>
              <span className="font-mono opacity-60">
                Total: {devices.length}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
