import { RefreshCw, Copy, Loader2, MonitorSmartphone, Info, Battery, Wifi, HardDrive, MemoryStick, Cpu, Shield, Terminal, Activity, Network, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export interface DeviceInfo {
  // 基础信息
  model: string;
  manufacturer: string;
  androidVersion: string;
  sdkVersion: string;
  serialNumber: string;

  // 状态信息
  battery: string;
  storage: string;
  ram: string;
  cpu: string;
  resolution: string;
  wifi: string;

  // 新增信息（按重要程度排序）
  ipAddress: string;        // IP 地址 - 高重要性
  securityPatch: string;    // 安全补丁 - 高重要性
  foregroundApp: string;    // 前台应用 - 中重要性
  kernelVersion: string;    // 内核版本 - 中重要性
  buildNumber: string;      // 构建版本 - 中重要性
  macAddress: string;       // MAC 地址 - 低重要性
  simStatus: string;        // SIM 卡状态 - 低重要性
  board: string;            // 主板型号 - 低重要性
}

interface DeviceInfoCardProps {
  selectedDevice: string;
  loadingInfo: boolean;
  deviceInfo: DeviceInfo | null;
  fetchDeviceInfo: (deviceId: string) => Promise<void>;
}

export function DeviceInfoCard({
  selectedDevice,
  loadingInfo,
  deviceInfo,
  fetchDeviceInfo,
}: DeviceInfoCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">当前设备</CardTitle>
            <CardDescription>设备详细信息展示</CardDescription>
          </div>
          {selectedDevice && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchDeviceInfo(selectedDevice)}
                disabled={loadingInfo}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingInfo ? "animate-spin" : ""}`} />
                刷新
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(selectedDevice);
                  toast.success("已复制到剪贴板");
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!selectedDevice ? (
          <div className="text-center py-8 text-muted-foreground">
            请先选择设备
          </div>
        ) : loadingInfo ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            正在获取设备信息...
          </div>
        ) : deviceInfo ? (
          <div className="space-y-4">
            {/* 重要信息 - 第一行 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <MonitorSmartphone className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">设备型号</div>
                  <div className="font-medium text-sm truncate" title={deviceInfo.model}>
                    {deviceInfo.model}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">制造商: {deviceInfo.manufacturer}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <Info className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">Android 版本</div>
                  <div className="font-medium text-sm">{deviceInfo.androidVersion}</div>
                  <div className="text-xs text-muted-foreground mt-1">SDK: {deviceInfo.sdkVersion}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">安全补丁</div>
                  <div className="font-medium text-sm">{deviceInfo.securityPatch}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <Network className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">IP 地址</div>
                  <div className="font-medium text-sm font-mono">{deviceInfo.ipAddress}</div>
                </div>
              </div>
            </div>

            {/* 状态信息 - 第二行 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <Battery className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">电池状态</div>
                  <div className="font-medium text-sm">{deviceInfo.battery}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <Wifi className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">WiFi 状态</div>
                  <div className="font-medium text-sm">{deviceInfo.wifi}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <HardDrive className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">存储空间</div>
                  <div className="font-medium text-xs break-words leading-relaxed">{deviceInfo.storage}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <MemoryStick className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">内存 (RAM)</div>
                  <div className="font-medium text-sm">{deviceInfo.ram}</div>
                </div>
              </div>
            </div>

            {/* 硬件信息 - 第三行 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <Cpu className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">处理器 (CPU)</div>
                  <div className="font-medium text-sm break-words">{deviceInfo.cpu}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <MonitorSmartphone className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">屏幕分辨率</div>
                  <div className="font-medium text-sm">{deviceInfo.resolution}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <Terminal className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">内核版本</div>
                  <div className="font-medium text-xs break-all">{deviceInfo.kernelVersion}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <Activity className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">构建版本</div>
                  <div className="font-medium text-xs break-all">{deviceInfo.buildNumber}</div>
                </div>
              </div>
            </div>

            {/* 其他信息 - 第四行 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <Smartphone className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">前台应用</div>
                  <div className="font-medium text-xs break-all">{deviceInfo.foregroundApp}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <Wifi className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">MAC 地址</div>
                  <div className="font-medium text-sm font-mono">{deviceInfo.macAddress}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <Info className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">SIM 卡状态</div>
                  <div className="font-medium text-sm">{deviceInfo.simStatus}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <Info className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">主板型号</div>
                  <div className="font-medium text-sm">{deviceInfo.board}</div>
                </div>
              </div>
            </div>

            {/* 底部设备 ID */}
            <div className="pt-3 border-t">
              <div className="text-xs text-muted-foreground mb-1">设备 ID</div>
              <code className="text-xs font-mono bg-muted/50 px-2 py-1 rounded block break-all">{selectedDevice}</code>
              {deviceInfo.serialNumber && deviceInfo.serialNumber !== "N/A" && (
                <div className="text-xs text-muted-foreground mt-1">序列号: {deviceInfo.serialNumber}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            无法获取设备信息
          </div>
        )}
      </CardContent>
    </Card>
  );
}
