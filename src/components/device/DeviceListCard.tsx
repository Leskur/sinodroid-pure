import { RefreshCw, Smartphone, Unplug, Usb, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        badgeColor: "bg-blue-600 text-blue-100"
      };
    case "usb":
      return {
        icon: Usb,
        label: "USB",
        color: "text-green-400",
        bg: "bg-green-500/20",
        badgeColor: "bg-green-600 text-green-100"
      };
    default:
      // 默认当作 USB 处理
      return {
        icon: Usb,
        label: "USB",
        color: "text-green-400",
        bg: "bg-green-500/20",
        badgeColor: "bg-green-600 text-green-100"
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
    <Card className="lg:col-span-1 border-2 border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 font-semibold">
          <div className="bg-blue-500/20 p-1.5 rounded-lg">
            <Smartphone className="w-5 h-5 text-blue-400" />
          </div>
          设备列表
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground/80">
          选择要操作的设备
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 控制按钮组 */}
        <div className="flex gap-2">
          <Button
            onClick={refreshDevices}
            className="flex-1 shadow-sm hover:shadow-md transition-shadow"
            variant="secondary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button
            onClick={() => setAutoDetect(!autoDetect)}
            className={cn(
              "flex-1 shadow-sm hover:shadow-md transition-all",
              autoDetect
                ? "bg-green-600 hover:bg-green-700 hover:scale-[1.02]"
                : "bg-gray-600 hover:bg-gray-700"
            )}
            variant={autoDetect ? "default" : "secondary"}
          >
            {autoDetect ? "自动: 开" : "自动: 关"}
          </Button>
        </div>

        {/* 自动检测状态指示器 */}
        {autoDetect && (
          <div className="flex items-center gap-2 text-xs px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="font-medium">自动检测中</span>
            <span className="text-green-500/60">(每3秒)</span>
          </div>
        )}

        {/* 设备列表 */}
        <div className="h-64 rounded-lg border border-border/50 bg-background/50 overflow-hidden">
          <div className="h-full overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {devices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2 w-full h-full">
                <div className="bg-gray-500/10 p-3 rounded-full">
                  <Smartphone className="w-6 h-6 opacity-50" />
                </div>
                <div className="text-sm font-medium">未发现设备</div>
                <div className="text-xs opacity-60">请连接设备或检查 ADB</div>
              </div>
            ) : (
              devices.map((device) => {
                const connectionType = device.connectionType || "usb";
                const config = getConnectionTypeConfig(connectionType);
                const Icon = config.icon;
                const isWifi = connectionType === "wifi";
                const isSelected = selectedDevice === device.id;

                return (
                  <div
                    key={device.id}
                    className={cn(
                      "group relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
                      "hover:shadow-md hover:scale-[1.01]",
                      // 默认状态
                      "bg-card border-border/60 hover:border-blue-400/50",
                      // 选中状态
                      isSelected && "bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/20",
                      // WiFi 设备悬停时显示断开按钮
                      isWifi && "pr-12"
                    )}
                    onClick={() => setSelectedDevice(device.id)}
                  >
                    <div className="flex items-center gap-3">
                      {/* 连接类型图标 */}
                      <div className={cn(
                        "p-2 rounded-lg shrink-0 transition-transform duration-200",
                        config.bg,
                        "group-hover:scale-110"
                      )}>
                        <Icon className={cn("w-5 h-5", config.color)} />
                      </div>

                      {/* 设备信息 */}
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "font-mono text-sm font-semibold truncate",
                          isSelected ? "text-blue-300" : "text-foreground"
                        )}>
                          {device.id}
                        </div>

                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge className={cn(
                            "text-[10px] px-1.5 py-0.5 font-medium",
                            device.status === "device"
                              ? config.badgeColor
                              : "bg-gray-600 text-gray-300"
                          )}>
                            {device.status}
                          </Badge>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded",
                            "bg-gray-500/20 text-gray-400"
                          )}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* WiFi 断开按钮 */}
                    {isWifi && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          disconnectDevice(device.id);
                        }}
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2",
                          "text-red-400 hover:text-red-500 hover:bg-red-500/10",
                          "opacity-0 group-hover:opacity-100 transition-all duration-200",
                          "hover:scale-110"
                        )}
                        title="断开 WiFi 连接"
                      >
                        <Unplug className="w-4 h-4" />
                      </Button>
                    )}

                    {/* 选中指示器 */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 统计信息 */}
        {devices.length > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>共 {devices.length} 台设备</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              {devices.filter(d => d.connectionType === "wifi").length} WiFi
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
