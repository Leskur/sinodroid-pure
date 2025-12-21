import { RefreshCw, Smartphone, Unplug, Usb, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        badgeColor: "bg-blue-600"
      };
    case "usb":
      return {
        icon: Usb,
        label: "USB",
        color: "text-green-400",
        bg: "bg-green-500/20",
        badgeColor: "bg-green-600"
      };
    default:
      // 默认当作 USB 处理
      return {
        icon: Usb,
        label: "USB",
        color: "text-green-400",
        bg: "bg-green-500/20",
        badgeColor: "bg-green-600"
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
  // Debug: Log received devices
  if (devices.length > 0) {
    console.log("[DeviceListCard] Received devices:", devices.map(d => ({
      id: d.id,
      status: d.status,
      connectionType: d.connectionType,
      hasType: !!d.connectionType
    })));
  }

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          设备列表
        </CardTitle>
        <CardDescription>选择要操作的设备</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button
            onClick={refreshDevices}
            className="flex-1"
            variant="secondary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button
            onClick={() => setAutoDetect(!autoDetect)}
            className={`flex-1 ${autoDetect ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}`}
            variant={autoDetect ? "default" : "secondary"}
          >
            {autoDetect ? "自动: 开" : "自动: 关"}
          </Button>
        </div>
        {autoDetect && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            自动检测中 (每3秒)
          </div>
        )}
        <ScrollArea className="h-60 rounded-md border [&::-webkit-scrollbar]:hidden [&::-moz-scrollbar]:hidden">
          <div className="p-2 space-y-2">
            {devices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                未发现设备
              </div>
            ) : (
              devices.map((device) => {
                // 安全获取连接类型，处理可能的 undefined 情况
                const connectionType = device.connectionType || "usb";
                const config = getConnectionTypeConfig(connectionType);
                const Icon = config.icon;
                const isWifi = connectionType === "wifi";

                return (
                  <div
                    key={device.id}
                    className={cn(
                      "flex gap-1 items-center",
                      selectedDevice === device.id && "ring-2 ring-primary rounded-md"
                    )}
                  >
                    {/* 只对 WiFi 设备显示断开按钮 - 放在最前面 */}
                    {isWifi && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => disconnectDevice(device.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer shrink-0"
                        title="断开 WiFi 连接"
                      >
                        <Unplug className="w-4 h-4" />
                      </Button>
                    )}

                    {/* 状态标识 */}
                    <Badge
                      variant={device.status === "device" ? "default" : "secondary"}
                      className={cn(
                        "text-[10px] shrink-0",
                        device.status === "device" ? config.badgeColor : "bg-gray-500"
                      )}
                    >
                      {device.status}
                    </Badge>

                    {/* 设备按钮 - 占满剩余空间 */}
                    <Button
                      variant={selectedDevice === device.id ? "default" : "ghost"}
                      className={cn(
                        "flex-1 justify-start text-left font-mono text-xs min-w-0",
                        selectedDevice === device.id && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => setSelectedDevice(device.id)}
                      title={device.id}  // 完整设备名提示
                    >
                      {/* 连接类型图标 */}
                      <Icon className={cn("w-3.5 h-3.5 mr-1.5 shrink-0", config.color)} />

                      {/* 设备ID - 允许压缩但保留最小空间 */}
                      <span className="truncate min-w-0">{device.id}</span>
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
