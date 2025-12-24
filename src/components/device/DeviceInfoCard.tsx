import {
  RefreshCw,
  Copy,
  Loader2,
  MonitorSmartphone,
  Info,
  HardDrive,
  Cpu,
  Shield,
  Terminal,
  Smartphone,
  CircuitBoard,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface DeviceInfo {
  // 基础信息
  model: string;
  manufacturer: string;
  brand: string; // 品牌 - 用于过滤广告包
  androidVersion: string;
  sdkVersion: string;
  serialNumber: string;

  // 存储信息
  storage: string;

  // 硬件信息
  ram: string;
  cpu: string;
  resolution: string;

  // 系统信息
  securityPatch: string; // 安全补丁
  kernelVersion: string; // 内核版本
  buildNumber: string; // 构建版本
  board: string; // 主板型号
}

interface DeviceInfoCardProps {
  selectedDevice: string;
  loadingInfo: boolean;
  deviceInfo: DeviceInfo | null;
  fetchDeviceInfo: (deviceId: string, forceRefresh?: boolean) => Promise<void>;
}

export function DeviceInfoCard({
  selectedDevice,
  loadingInfo,
  deviceInfo,
  fetchDeviceInfo,
}: DeviceInfoCardProps) {
  if (!selectedDevice) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground p-8 border-2 border-dashed border-muted rounded-lg bg-muted/5">
        <Smartphone className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-base font-medium">未选择设备</p>
        <p className="text-sm opacity-60">请在左侧列表选择一个设备查看详情</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-2">
      {/* 标题与操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-md text-primary">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-none">设备详情</h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {selectedDevice}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchDeviceInfo(selectedDevice, true)}
            disabled={loadingInfo}
            className="h-8 text-xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${
                loadingInfo ? "animate-spin" : ""
              }`}
            />
            刷新信息
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(selectedDevice);
              toast.success("已复制序列号");
            }}
            title="复制序列号"
            className="h-8 w-8 p-0"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {loadingInfo ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary/50" />
          <p className="text-sm">正在读取设备指纹...</p>
        </div>
      ) : deviceInfo ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* 核心概览 - 醒目的大字 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10 dark:bg-blue-500/10">
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                Android 版本
              </div>
              <div className="text-2xl font-bold text-foreground">
                {deviceInfo.androidVersion}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                SDK {deviceInfo.sdkVersion}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10 dark:bg-purple-500/10">
              <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                内存 (RAM)
              </div>
              <div className="text-2xl font-bold text-foreground">
                {deviceInfo.ram}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                可用: 计算中...
              </div>
            </div>
            <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/10 dark:bg-orange-500/10 col-span-2 md:col-span-2">
              <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">
                设备型号
              </div>
              <div className="text-xl font-bold text-foreground truncate">
                {deviceInfo.model}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {deviceInfo.manufacturer} · {deviceInfo.brand}
              </div>
            </div>
          </div>

          {/* 详细属性列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* 系统部分 */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2 mb-2">
                系统软件
              </h4>
              <InfoItem
                icon={Shield}
                label="安全补丁"
                value={deviceInfo.securityPatch}
              />
              <InfoItem
                icon={Terminal}
                label="内核版本"
                value={deviceInfo.kernelVersion}
              />
              <InfoItem
                icon={GitBranch}
                label="构建版本"
                value={deviceInfo.buildNumber}
              />
              <InfoItem
                icon={CircuitBoard}
                label="主板代号"
                value={deviceInfo.board}
              />
            </div>

            {/* 硬件部分 */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2 mb-2">
                硬件配置
              </h4>
              <InfoItem icon={Cpu} label="处理器" value={deviceInfo.cpu} />
              <InfoItem
                icon={HardDrive}
                label="存储空间"
                value={deviceInfo.storage}
              />
              <InfoItem
                icon={MonitorSmartphone}
                label="屏幕分辨率"
                value={deviceInfo.resolution}
              />
              <InfoItem
                icon={Smartphone}
                label="序列号"
                value={deviceInfo.serialNumber}
                copyable
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-xl">
          <Info className="w-8 h-8 opacity-20 mb-2" />
          <p className="text-sm">无法读取设备详细信息</p>
        </div>
      )}
    </div>
  );
}

// 辅助组件：信息行
function InfoItem({
  icon: Icon,
  label,
  value,
  copyable,
}: {
  icon: any;
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="flex items-center justify-between group py-1">
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground/80">
        <Icon className="w-4 h-4 opacity-70" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2 overflow-hidden pl-4">
        <span
          className="text-sm font-medium text-foreground truncate"
          title={value}
        >
          {value || "未知"}
        </span>
        {copyable && value && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => {
              navigator.clipboard.writeText(value);
              toast.success("已复制");
            }}
          >
            <Copy className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
