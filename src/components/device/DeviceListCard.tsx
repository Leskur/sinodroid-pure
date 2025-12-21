import { RefreshCw, Smartphone, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { type Device } from "@/lib/adb";

interface DeviceListCardProps {
  devices: Device[];
  selectedDevice: string;
  setSelectedDevice: (id: string) => void;
  refreshDevices: () => Promise<void>;
  autoDetect: boolean;
  setAutoDetect: (value: boolean) => void;
  disconnectDevice: (deviceId: string) => Promise<void>;
}

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
            自动检测中 (每2秒)
          </div>
        )}
        <ScrollArea className="h-60 rounded-md border [&::-webkit-scrollbar]:hidden [&::-moz-scrollbar]:hidden">
          <div className="p-2 space-y-2">
            {devices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                未发现设备
              </div>
            ) : (
              devices.map((device) => (
                <div
                  key={device.id}
                  className={cn(
                    "flex gap-1 items-center",
                    selectedDevice === device.id && "ring-2 ring-primary rounded-md"
                  )}
                >
                  <Button
                    variant={selectedDevice === device.id ? "default" : "ghost"}
                    className={cn(
                      "flex-1 justify-start text-left font-mono text-xs",
                      selectedDevice === device.id && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setSelectedDevice(device.id)}
                  >
                    <span className="truncate">{device.id}</span>
                    <Badge
                      variant={device.status === "device" ? "default" : "secondary"}
                      className={cn(
                        "ml-auto text-[10px]",
                        device.status === "device" ? "bg-green-600" : "bg-gray-500"
                      )}
                    >
                      {device.status}
                    </Badge>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => disconnectDevice(device.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer shrink-0"
                    title="断开设备"
                  >
                    <Unplug className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
