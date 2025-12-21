import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import {
  initPlatformTools,
  isPlatformToolsReady,
  getAdbVersion,
  getDevices,
  executeAdbCommand,
  type Device,
} from "@/lib/adb";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { Sidebar, type SidebarType } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { DeviceListCard } from "@/components/device/DeviceListCard";
import { DeviceInfoCard, type DeviceInfo } from "@/components/device/DeviceInfoCard";
import { WiFiConnectCard } from "@/components/device/WiFiConnectCard";
import { DebloatCard, type BloatwarePackage } from "@/components/debloat/DebloatCard";
import { LogPanel } from "@/components/logs/LogPanel";

// 为中国安卓设备优化的预设命令
const BLOATWARE_PACKAGES: BloatwarePackage[] = [
  { name: "小米广告服务", package: "com.miui.systemAdSolution", desc: "小米系统广告服务" },
  { name: "华为彩信广告", package: "com.huawei.android.hwouc", desc: "华为系统更新广告" },
  { name: "OPPO 推送服务", package: "com.oppo.pushservice", desc: "OPPO 推送广告" },
  { name: "VIVO 推送服务", package: "com.vivo.push", desc: "VIVO 推送广告" },
  { name: "小米系统广告", package: "com.miui.systemAdService", desc: "小米系统广告" },
  { name: "华为智能推荐", package: "com.huawei.android.hwSmartAds", desc: "华为智能广告" },
  { name: "OPPO 桌面广告", package: "com.oppo.launcher.res", desc: "OPPO 桌面广告" },
  { name: "VIVO 桌面广告", package: "com.bbk.launcher2", desc: "VIVO 桌面广告" },
];

function App() {
  const [initializing, setInitializing] = useState(true);
  const [ready, setReady] = useState(false);
  const [adbVersion, setAdbVersion] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [activeSidebar, setActiveSidebar] = useState<SidebarType>("device");
  const [autoDetect, setAutoDetect] = useState(true); // 自动检测开关
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // 去广告/操作日志
  const [operationLog, setOperationLog] = useState<string[]>([]);
  const [operating, setOperating] = useState(false);

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
      const model = await executeAdbCommand([ "-s", deviceId, "shell", "getprop", "ro.product.model" ]);
      // 获取制造商
      const manufacturer = await executeAdbCommand([ "-s", deviceId, "shell", "getprop", "ro.product.manufacturer" ]);
      // 获取 Android 版本
      const androidVersion = await executeAdbCommand([ "-s", deviceId, "shell", "getprop", "ro.build.version.release" ]);
      // 获取 SDK 版本
      const sdkVersion = await executeAdbCommand([ "-s", deviceId, "shell", "getprop", "ro.build.version.sdk" ]);
      // 获取序列号
      const serialNumber = await executeAdbCommand([ "-s", deviceId, "shell", "getprop", "ro.serialno" ]);

      // 获取电池信息
      let battery = "N/A";
      try {
        const batteryOutput = await executeAdbCommand([ "-s", deviceId, "shell", "dumpsys", "battery" ]);
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
        const storageOutput = await executeAdbCommand([ "-s", deviceId, "shell", "df", "/data" ]);
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
        // 方法1: 从 /proc/meminfo 获取
        const memOutput = await executeAdbCommand([ "-s", deviceId, "shell", "cat", "/proc/meminfo" ]);
        const totalMatch = memOutput.match(/MemTotal:\s*(\d+)/);
        if (totalMatch) {
          const totalKb = parseInt(totalMatch[1]);
          const totalGb = (totalKb / 1024 / 1024).toFixed(1);
          ram = `${totalGb} GB`;
        } else {
          // 方法2: 使用 getprop 获取
          const memProp = await executeAdbCommand([ "-s", deviceId, "shell", "getprop", "ro.product.mem.max" ]);
          if (memProp.trim()) {
            const memMb = parseInt(memProp.trim());
            const memGb = (memMb / 1024).toFixed(1);
            ram = `${memGb} GB`;
          } else {
            ram = "未知";
          }
        }
      } catch (e) {
        ram = "获取失败";
      }

      // 获取 CPU 信息
      let cpu = "N/A";
      try {
        // 方法1: 从 /proc/cpuinfo 获取
        const cpuOutput = await executeAdbCommand([ "-s", deviceId, "shell", "cat", "/proc/cpuinfo" ]);

        // 尝试多种可能的 CPU 型号字段
        const modelMatch = cpuOutput.match(/Hardware\s*:\s*(.+)/)
                          || cpuOutput.match(/processor\s*:\s*0\s*\n.*?model name\s*:\s*(.+)/s)
                          || cpuOutput.match(/model name\s*:\s*(.+)/);

        // 统计核心数
        const coresMatch = cpuOutput.match(/processor\s*:\s*(\d+)/g);
        const coreCount = coresMatch ? coresMatch.length : 1;

        if (modelMatch) {
          cpu = modelMatch[1].trim();
          cpu += ` (${coreCount} 核)`;
        } else {
          // 方法2: 使用 getprop 获取 CPU 信息
          const cpuProp = await executeAdbCommand([ "-s", deviceId, "shell", "getprop", "ro.hardware" ]);
          if (cpuProp.trim()) {
            cpu = cpuProp.trim();
            cpu += ` (${coreCount} 核)`;
          } else {
            cpu = `${coreCount} 核处理器`;
          }
        }
      } catch (e) {
        cpu = "获取失败";
      }

      // 获取分辨率
      let resolution = "N/A";
      try {
        const resolutionOutput = await executeAdbCommand([ "-s", deviceId, "shell", "wm", "size" ]);
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
        const wifiEnabled = await executeAdbCommand([ "-s", deviceId, "shell", "svc", "wifi", "state" ]);
        const isEnabled = wifiEnabled.trim() === "enabled";

        if (isEnabled) {
          // 方法2: 检查 WiFi 是否已连接
          const wifiState = await executeAdbCommand([ "-s", deviceId, "shell", "dumpsys", "wifi", "|", "grep", "mNetworkInfo" ]);
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
          const wifiOutput = await executeAdbCommand([ "-s", deviceId, "shell", "dumpsys", "wifi" ]);
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
    return <LoadingScreen />;
  }

  // 初始化失败
  if (!ready) {
    return <ErrorScreen />;
  }

  // 菜单名称映射
  const menuNames: Record<SidebarType, string> = {
    device: "设备管理",
    debloat: "批量去广告",
    log: "操作日志"
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 侧边栏 */}
        <Sidebar
          activeSidebar={activeSidebar}
          setActiveSidebar={setActiveSidebar}
          operationLogCount={operationLog.length}
        />

        {/* 右侧内容区域 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* 顶部栏 - 固定 */}
          <div className="border-b bg-card/50 backdrop-blur-sm shrink-0">
            <div className="px-6 py-4">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                {menuNames[activeSidebar]}
              </h1>
            </div>
          </div>

          {/* 内容区域 - 可滚动 */}
          <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [&::-moz-scrollbar]:hidden">
            {/* 设备管理内容 */}
            {activeSidebar === "device" && (
              <div className="space-y-4 max-w-6xl mx-auto">
                {/* 第一行：设备列表 + WiFi 连接 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <DeviceListCard
                    devices={devices}
                    selectedDevice={selectedDevice}
                    setSelectedDevice={setSelectedDevice}
                    refreshDevices={refreshDevices}
                    autoDetect={autoDetect}
                    setAutoDetect={setAutoDetect}
                  />
                  <WiFiConnectCard
                    executeAdbCommand={executeAdbCommand}
                    refreshDevices={refreshDevices}
                  />
                </div>
                {/* 第二行：当前设备信息 */}
                <DeviceInfoCard
                  selectedDevice={selectedDevice}
                  loadingInfo={loadingInfo}
                  deviceInfo={deviceInfo}
                  fetchDeviceInfo={fetchDeviceInfo}
                />
              </div>
            )}

            {/* 去广告内容 */}
            {activeSidebar === "debloat" && (
              <DebloatCard
                selectedDevice={selectedDevice}
                operating={operating}
                bloatwarePackages={BLOATWARE_PACKAGES}
                operationLog={operationLog}
                setOperationLog={setOperationLog}
                setOperating={setOperating}
                executeAdbCommand={executeAdbCommand}
              />
            )}

            {/* 日志内容 */}
            {activeSidebar === "log" && (
              <LogPanel
                operationLog={operationLog}
                clearLog={clearLog}
              />
            )}
          </div>
        </div>
      </div>

      {/* 底部状态栏 - 固定在窗口底部 */}
      <StatusBar adbVersion={adbVersion} devicesCount={devices.length} />

      {/* Toast 提示 */}
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
