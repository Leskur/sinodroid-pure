import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import {
  initPlatformTools,
  isPlatformToolsReady,
  getAdbVersion,
  getDevices,
  executeAdbCommand,
  type Device,
} from "./lib/adb";
import AppIcon from "./components/AppIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  RefreshCw,
  Smartphone,
  Eraser,
  Copy,
  Play,
  Loader2,
  MessageSquare,
  Trash2,
  ChevronsUpDown,
  ChevronsDownUp,
  Info,
  Cpu,
  MemoryStick,
  HardDrive,
  Battery,
  Wifi,
  MonitorSmartphone
} from "lucide-react";

// 为中国安卓设备优化的预设命令
const BLOATWARE_PACKAGES = [
  { name: "小米广告服务", package: "com.miui.systemAdSolution", desc: "小米系统广告服务" },
  { name: "华为彩信广告", package: "com.huawei.android.hwouc", desc: "华为系统更新广告" },
  { name: "OPPO 推送服务", package: "com.oppo.pushservice", desc: "OPPO 推送广告" },
  { name: "VIVO 推送服务", package: "com.vivo.push", desc: "VIVO 推送广告" },
  { name: "小米系统广告", package: "com.miui.systemAdService", desc: "小米系统广告" },
  { name: "华为智能推荐", package: "com.huawei.android.hwSmartAds", desc: "华为智能广告" },
  { name: "OPPO 桌面广告", package: "com.oppo.launcher.res", desc: "OPPO 桌面广告" },
  { name: "VIVO 桌面广告", package: "com.bbk.launcher2", desc: "VIVO 桌面广告" },
];

type TabType = "device" | "debloat";

interface DeviceInfo {
  model: string;
  manufacturer: string;
  androidVersion: string;
  sdkVersion: string;
  serialNumber: string;
  battery: string;
  storage: string;
  ram: string;
  cpu: string;
  resolution: string;
  wifi: string;
}

function App() {
  const [initializing, setInitializing] = useState(true);
  const [ready, setReady] = useState(false);
  const [adbVersion, setAdbVersion] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("device");
  const [autoDetect, setAutoDetect] = useState(true); // 自动检测开关
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // 去广告/操作日志
  const [operationLog, setOperationLog] = useState<string[]>([]);
  const [operating, setOperating] = useState(false);
  const [logExpanded, setLogExpanded] = useState(false); // 日志面板展开状态

  // 初始化 platform-tools
  useEffect(() => {
    async function init() {
      try {
        const isReady = await isPlatformToolsReady();
        if (!isReady) {
          await initPlatformTools();
        }
        const version = await getAdbVersion();
        setAdbVersion(version);
        setReady(true);
        toast.success("ADB 工具初始化成功", { description: version.split("\n")[0] });
      } catch (err) {
        toast.error("初始化失败", { description: String(err) });
      } finally {
        setInitializing(false);
      }
    }
    init();
  }, []);

  // 刷新设备列表
  const refreshDevices = async () => {
    try {
      const deviceList = await getDevices();
      setDevices(deviceList);
      if (deviceList.length > 0 && !selectedDevice) {
        setSelectedDevice(deviceList[0].id);
      }
      toast.success("设备列表已刷新", { description: `发现 ${deviceList.length} 台设备` });
    } catch (err) {
      toast.error("获取设备列表失败", { description: String(err) });
    }
  };

  // 自动检测设备插拔
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let previousDeviceCount = 0;

    const checkDeviceChanges = async () => {
      if (!autoDetect) return; // 如果关闭了自动检测，直接返回

      try {
        const deviceList = await getDevices();
        const currentCount = deviceList.length;

        // 检测设备数量变化
        if (currentCount !== previousDeviceCount) {
          if (currentCount > previousDeviceCount) {
            // 新设备连接
            toast.success("检测到新设备连接", {
              description: `当前 ${currentCount} 台设备`
            });
          } else {
            // 设备断开
            toast.info("设备已断开", {
              description: `剩余 ${currentCount} 台设备`
            });
          }

          // 更新设备列表
          setDevices(deviceList);

          // 自动选择设备
          if (deviceList.length > 0) {
            // 如果之前选中的设备还在，保持选择；否则选择第一个
            const currentDeviceStillConnected = deviceList.some(d => d.id === selectedDevice);
            if (!currentDeviceStillConnected || !selectedDevice) {
              setSelectedDevice(deviceList[0].id);
            }
          } else {
            setSelectedDevice("");
          }

          previousDeviceCount = currentCount;
        }
      } catch (err) {
        // 静默处理错误，避免频繁弹窗
        console.error("设备检测错误:", err);
      }
    };

    // 只在 ready 且开启了自动检测时才启动检测
    if (ready && autoDetect) {
      intervalId = setInterval(checkDeviceChanges, 2000); // 每2秒检查一次
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [ready, selectedDevice, autoDetect]);

  // 批量去广告
  const batchDebloat = async () => {
    if (!selectedDevice) {
      toast.error("请先选择设备");
      return;
    }
    setOperating(true);
    toast.info("开始批量去广告", { description: "正在处理..." });
    try {
      for (const item of BLOATWARE_PACKAGES) {
        setOperationLog(prev => [...prev, `正在检查: ${item.name} (${item.package})`]);
        try {
          // 先检查是否安装
          const checkOutput = await executeAdbCommand([ "-s", selectedDevice, "shell", "pm", "path", item.package ]);
          if (checkOutput.includes(item.package)) {
            await executeAdbCommand([ "-s", selectedDevice, "shell", "pm", "uninstall", "--user", "0", item.package ]);
            setOperationLog(prev => [...prev, `✅ 已卸载: ${item.name}`]);
          } else {
            setOperationLog(prev => [...prev, `ℹ️ 未安装: ${item.name}`]);
          }
        } catch (err) {
          setOperationLog(prev => [...prev, `⚠️ 跳过 ${item.name}: ${String(err)}`]);
        }
      }
      setOperationLog(prev => [...prev, `🎉 批量去广告完成！`]);
      toast.success("批量去广告完成");
    } finally {
      setOperating(false);
    }
  };

  // 清空日志
  const clearLog = () => {
    setOperationLog([]);
    toast.info("日志已清空");
  };

  // 获取设备详细信息
  const fetchDeviceInfo = async (deviceId: string) => {
    if (!deviceId) return;

    setLoadingInfo(true);
    setDeviceInfo(null);

    try {
      // 获取设备型号
      const model = await executeAdbCommand(["-s", deviceId, "shell", "getprop", "ro.product.model"]);
      // 获取制造商
      const manufacturer = await executeAdbCommand(["-s", deviceId, "shell", "getprop", "ro.product.manufacturer"]);
      // 获取 Android 版本
      const androidVersion = await executeAdbCommand(["-s", deviceId, "shell", "getprop", "ro.build.version.release"]);
      // 获取 SDK 版本
      const sdkVersion = await executeAdbCommand(["-s", deviceId, "shell", "getprop", "ro.build.version.sdk"]);
      // 获取序列号
      const serialNumber = await executeAdbCommand(["-s", deviceId, "shell", "getprop", "ro.serialno"]);

      // 获取电池信息
      let battery = "N/A";
      try {
        const batteryOutput = await executeAdbCommand(["-s", deviceId, "shell", "dumpsys", "battery"]);
        const levelMatch = batteryOutput.match(/level:\s*(\d+)/);
        const statusMatch = batteryOutput.match(/status:\s*(\d+)/);
        if (levelMatch) {
          const level = levelMatch[1];
          const status = statusMatch ? parseInt(statusMatch[1]) : 1;
          const statusText = status === 2 ? "充电中" : status === 3 ? "充满" : "使用中";
          battery = `${level}% (${statusText})`;
        }
      } catch (e) {
        battery = "获取失败";
      }

      // 获取存储信息
      let storage = "N/A";
      try {
        const storageOutput = await executeAdbCommand(["-s", deviceId, "shell", "df", "/data"]);
        const lines = storageOutput.split("\n").filter(l => l.trim());
        if (lines.length > 1) {
          const parts = lines[1].trim().split(/\s+/);
          const totalKb = parseInt(parts[1]);
          const usedKb = parseInt(parts[2]);
          const availKb = parseInt(parts[3]);

          // 转换为 GB
          const totalGb = (totalKb / 1024 / 1024).toFixed(1);
          const usedGb = (usedKb / 1024 / 1024).toFixed(1);
          const availGb = (availKb / 1024 / 1024).toFixed(1);

          storage = `总: ${totalGb} GB, 已用: ${usedGb} GB, 可用: ${availGb} GB`;
        }
      } catch (e) {
        storage = "获取失败";
      }

      // 获取内存信息
      let ram = "N/A";
      try {
        const memOutput = await executeAdbCommand(["-s", deviceId, "shell", "cat", "/proc/meminfo"]);
        const totalMatch = memOutput.match(/MemTotal:\s*(\d+)/);
        if (totalMatch) {
          const totalKb = parseInt(totalMatch[1]);
          const totalGb = (totalKb / 1024 / 1024).toFixed(1);
          ram = `${totalGb} GB`;
        }
      } catch (e) {
        ram = "获取失败";
      }

      // 获取 CPU 信息
      let cpu = "N/A";
      try {
        const cpuOutput = await executeAdbCommand(["-s", deviceId, "shell", "cat", "/proc/cpuinfo"]);
        const modelMatch = cpuOutput.match(/Hardware\s*:\s*(.+)/);
        const coresMatch = cpuOutput.match(/processor\s*:\s*(\d+)/g);
        if (modelMatch) {
          cpu = modelMatch[1].trim();
          if (coresMatch) {
            cpu += ` (${coresMatch.length} 核)`;
          }
        }
      } catch (e) {
        cpu = "获取失败";
      }

      // 获取分辨率
      let resolution = "N/A";
      try {
        const resolutionOutput = await executeAdbCommand(["-s", deviceId, "shell", "wm", "size"]);
        const match = resolutionOutput.match(/Physical size:\s*(\d+x\d+)/);
        if (match) {
          resolution = match[1];
        }
      } catch (e) {
        resolution = "获取失败";
      }

      // 获取 WiFi 信息
      let wifi = "N/A";
      try {
        // 方法1: 检查 WiFi 是否启用
        const wifiEnabled = await executeAdbCommand(["-s", deviceId, "shell", "svc", "wifi", "state"]);
        const isEnabled = wifiEnabled.trim() === "enabled";

        if (isEnabled) {
          // 方法2: 检查 WiFi 是否已连接
          const wifiState = await executeAdbCommand(["-s", deviceId, "shell", "dumpsys", "wifi", "|", "grep", "mNetworkInfo"]);
          if (wifiState.includes("CONNECTED")) {
            wifi = "已连接";
          } else if (wifiState.includes("CONNECTING")) {
            wifi = "正在连接";
          } else {
            wifi = "已启用";
          }
        } else {
          wifi = "关闭";
        }
      } catch (e) {
        // 如果上面的方法失败，尝试备用方法
        try {
          const wifiOutput = await executeAdbCommand(["-s", deviceId, "shell", "dumpsys", "wifi"]);
          const stateMatch = wifiOutput.match(/mWifiState:\s*(\d+)/);
          if (stateMatch) {
            const state = parseInt(stateMatch[1]);
            const stateText = state === 3 ? "已连接" : state === 2 ? "正在连接" : "关闭";
            wifi = stateText;
          } else {
            wifi = "未知";
          }
        } catch (e2) {
          wifi = "获取失败";
        }
      }

      setDeviceInfo({
        model: model.trim(),
        manufacturer: manufacturer.trim(),
        androidVersion: androidVersion.trim(),
        sdkVersion: sdkVersion.trim(),
        serialNumber: serialNumber.trim(),
        battery,
        storage,
        ram,
        cpu,
        resolution,
        wifi
      });

    } catch (err) {
      toast.error("获取设备信息失败", { description: String(err) });
      setDeviceInfo(null);
    } finally {
      setLoadingInfo(false);
    }
  };

  // 当选择的设备变化时，自动获取设备信息
  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceInfo(selectedDevice);
    } else {
      setDeviceInfo(null);
    }
  }, [selectedDevice]);

  // 初始化中
  if (initializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-2xl font-bold text-foreground">🚀 正在初始化 ADB 工具</h2>
          <p className="text-muted-foreground">首次启动需要解压 platform-tools，请稍候...</p>
        </div>
      </div>
    );
  }

  // 初始化失败
  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="text-4xl text-center mb-2">❌</div>
            <CardTitle className="text-center">初始化失败</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">请检查 ADB 环境配置</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部栏 */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Sinodroid Pure
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">已连接: {devices.length}</Badge>
            <Badge variant="outline">{adbVersion.split("\n")[0]}</Badge>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="space-y-6">
          {/* 标签导航 */}
          <TabsList className="grid w-full grid-cols-2 h-14">
            <TabsTrigger value="device" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              设备管理
            </TabsTrigger>
            <TabsTrigger value="debloat" className="flex items-center gap-2">
              <Eraser className="w-4 h-4" />
              去广告
            </TabsTrigger>
          </TabsList>

          {/* 设备管理 */}
          <TabsContent value="device" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* 设备列表 */}
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
                  <ScrollArea className="h-60 rounded-md border">
                    <div className="p-2 space-y-2">
                      {devices.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          未发现设备
                        </div>
                      ) : (
                        devices.map((device) => (
                          <Button
                            key={device.id}
                            variant={selectedDevice === device.id ? "default" : "ghost"}
                            className={cn(
                              "w-full justify-start text-left font-mono text-xs",
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
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* 当前设备信息 */}
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
                      {/* 基本信息 */}
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

                        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border md:col-span-2">
                          <Cpu className="w-5 h-5 text-primary mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-muted-foreground mb-1">处理器 (CPU)</div>
                            <div className="font-medium text-sm break-words">{deviceInfo.cpu}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border md:col-span-2">
                          <MonitorSmartphone className="w-5 h-5 text-primary mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-muted-foreground mb-1">屏幕分辨率</div>
                            <div className="font-medium text-sm">{deviceInfo.resolution}</div>
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
            </div>
          </TabsContent>

          {/* 去广告 */}
          <TabsContent value="debloat">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eraser className="w-5 h-5" />
                      批量去广告
                    </CardTitle>
                    <CardDescription>自动识别并卸载常见国产手机广告组件</CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={batchDebloat}
                    disabled={!selectedDevice || operating}
                    size="lg"
                  >
                    {operating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span className="ml-2">{operating ? "执行中..." : "一键去广告"}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  {BLOATWARE_PACKAGES.map((item) => (
                    <div key={item.package} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <AppIcon package={item.package} size={28} />
                        <div className="min-w-0">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{item.package}</div>
                          <div className="text-xs text-muted-foreground">{item.desc}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (!selectedDevice) return;
                          setOperating(true);
                          executeAdbCommand([ "-s", selectedDevice, "shell", "pm", "uninstall", "--user", "0", item.package ])
                            .then(() => {
                              setOperationLog([...operationLog, `✅ 已卸载: ${item.name}`]);
                              toast.success("卸载成功", { description: item.name });
                            })
                            .catch(err => {
                              setOperationLog([...operationLog, `❌ 失败 ${item.name}: ${String(err)}`]);
                              toast.error("卸载失败", { description: item.name });
                            })
                            .finally(() => setOperating(false));
                        }}
                        disabled={!selectedDevice || operating}
                      >
                        卸载
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* VSCode 风格的底部状态栏和日志面板 */}
      {logExpanded && (
        <div className="fixed bottom-12 left-4 right-4 bg-card border rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">操作日志</span>
              <span className="text-xs text-muted-foreground">({operationLog.length} 条记录)</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={clearLog} disabled={operationLog.length === 0}>
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setLogExpanded(false)}>
                <ChevronsDownUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="h-64 p-3">
            <div className="space-y-1 font-mono text-xs">
              {operationLog.length === 0 ? (
                <div className="text-muted-foreground">暂无操作记录</div>
              ) : (
                operationLog.map((log, idx) => (
                  <div key={idx} className="whitespace-pre-wrap">{log}</div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* 底部状态栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-muted border-t z-40">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3"
              onClick={() => setLogExpanded(!logExpanded)}
            >
              {logExpanded ? (
                <ChevronsDownUp className="w-4 h-4 mr-2" />
              ) : (
                <MessageSquare className="w-4 h-4 mr-2" />
              )}
              <span className="text-sm">操作日志</span>
              {operationLog.length > 0 && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground px-1.5 rounded-full">
                  {operationLog.length}
                </span>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>ADB: {adbVersion.split("\n")[0]}</span>
            <span>•</span>
            <span>设备: {devices.length}</span>
          </div>
        </div>
      </div>

      {/* Toast 提示 */}
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
