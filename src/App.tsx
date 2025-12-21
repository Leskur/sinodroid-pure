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

// 为中国安卓设备优化的预设命令（按品牌分类）
const BLOATWARE_PACKAGES: BloatwarePackage[] = [
  // 小米/Redmi
  { name: "小米广告服务", package: "com.miui.systemAdSolution", desc: "小米系统广告服务", brand: "Xiaomi" },
  { name: "小米系统广告", package: "com.miui.systemAdService", desc: "小米系统广告", brand: "Xiaomi" },
  { name: "小米应用推荐", package: "com.miui.personalassistant", desc: "小米智能推荐", brand: "Xiaomi" },
  // 华为
  { name: "华为彩信广告", package: "com.huawei.android.hwouc", desc: "华为系统更新广告", brand: "Huawei" },
  { name: "华为智能推荐", package: "com.huawei.android.hwSmartAds", desc: "华为智能广告", brand: "Huawei" },
  // OPPO
  { name: "OPPO 推送服务", package: "com.oppo.pushservice", desc: "OPPO 推送广告", brand: "OPPO" },
  { name: "OPPO 桌面广告", package: "com.oppo.launcher.res", desc: "OPPO 桌面广告", brand: "OPPO" },
  // VIVO
  { name: "VIVO 推送服务", package: "com.vivo.push", desc: "VIVO 推送广告", brand: "VIVO" },
  { name: "VIVO 桌面广告", package: "com.bbk.launcher2", desc: "VIVO 桌面广告", brand: "VIVO" },
];

function App() {
  const [initializing, setInitializing] = useState(true);
  const [ready, setReady] = useState(false);
  const [adbVersion, setAdbVersion] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [activeSidebar, setActiveSidebar] = useState<SidebarType>("device");
  const [autoDetect, setAutoDetect] = useState(false); // 自动检测开关
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // 操作记录
  const [operationLog, setOperationLog] = useState<string[]>([]);
  const [operating, setOperating] = useState(false);

  // 生成时间戳 (YYYY-MM-DD HH:mm:ss)
  const getTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 添加日志记录（自动添加时间戳）
  const addLog = (message: string) => {
    setOperationLog(prev => [...prev, `[${getTimestamp()}] ${message}`]);
  };

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

  // 断开设备连接
  const disconnectDevice = async (deviceId: string) => {
    try {
      await executeAdbCommand(["disconnect", deviceId]);
      toast.success("设备已断开", { description: deviceId });

      // 刷新设备列表
      setTimeout(() => refreshDevices(), 300);

      // 如果断开的是当前选中的设备，清空选择
      if (selectedDevice === deviceId) {
        setSelectedDevice("");
        setDeviceInfo(null);
      }

      // 记录日志
      addLog(`✅ 已断开设备: ${deviceId}`);
    } catch (err) {
      toast.error("断开设备失败", { description: String(err) });
      addLog(`❌ 断开设备失败 ${deviceId}: ${String(err)}`);
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

  // 批量系统精简
  const batchDebloat = async () => {
    if (!selectedDevice) {
      toast.error("请先选择设备");
      return;
    }
    setOperating(true);
    toast.info("开始批量系统精简", { description: "正在处理..." });
    try {
      for (const item of BLOATWARE_PACKAGES) {
        addLog(`正在检查: ${item.name} (${item.package})`);
        try {
          // 先检查是否安装
          const checkOutput = await executeAdbCommand([ "-s", selectedDevice, "shell", "pm", "path", item.package ]);
          if (checkOutput.includes(item.package)) {
            await executeAdbCommand([ "-s", selectedDevice, "shell", "pm", "uninstall", "--user", "0", item.package ]);
            addLog(`✅ 已卸载: ${item.name}`);
          } else {
            addLog(`ℹ️ 未安装: ${item.name}`);
          }
        } catch (err) {
          addLog(`⚠️ 跳过 ${item.name}: ${String(err)}`);
        }
      }
      addLog(`🎉 批量系统精简完成！`);
      toast.success("批量系统精简完成");
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
      // 获取品牌（用于过滤广告包）
      const brand = await executeAdbCommand([ "-s", deviceId, "shell", "getprop", "ro.product.brand" ]);
      // 获取 Android 版本
      const androidVersion = await executeAdbCommand([ "-s", deviceId, "shell", "getprop", "ro.build.version.release" ]);
      // 获取 SDK 版本
      const sdkVersion = await executeAdbCommand([ "-s", deviceId, "shell", "getprop", "ro.build.version.sdk" ]);
      // 获取序列号
      const serialNumber = await executeAdbCommand([ "-s", deviceId, "shell", "getprop", "ro.serialno" ]);
      // 获取安全补丁级别
      const securityPatch = await executeAdbCommand([ "-s", deviceId, "shell", "getprop", "ro.build.version.security_patch" ]).catch(() => "N/A");
      // 获取构建版本号
      const buildNumber = await executeAdbCommand([ "-s", deviceId, "shell", "getprop", "ro.build.version.incremental" ]).catch(() => "N/A");
      // 获取主板型号
      const board = await executeAdbCommand([ "-s", deviceId, "shell", "getprop", "ro.product.board" ]).catch(() => "N/A");
      // 获取内核版本
      const kernelVersion = await executeAdbCommand([ "-s", deviceId, "shell", "uname", "-r" ]).catch(() => "N/A");

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

      // 获取 WiFi 信息 - 优化版本
      let wifi = "N/A";
      let wifiSsid = "N/A";
      try {
        // 方法1: 使用 dumpsys connectivity 检查 WiFi 连接状态（最可靠）
        const connectivityOutput = await executeAdbCommand([ "-s", deviceId, "shell", "dumpsys", "connectivity" ]);

        // 检查 WiFi 是否已连接
        if (connectivityOutput.includes("WIFI CONNECTED") || connectivityOutput.includes("state=CONNECTED")) {
          wifi = "已连接";
        } else if (connectivityOutput.includes("WIFI CONNECTING") || connectivityOutput.includes("state=CONNECTING")) {
          wifi = "正在连接";
        } else if (connectivityOutput.includes("WIFI") || connectivityOutput.includes("type=WIFI")) {
          // WiFi 已启用但未连接
          wifi = "已启用";
        } else {
          // WiFi 关闭或不可用
          wifi = "关闭";
        }
      } catch (e) {
        // 备用方法: 使用 dumpsys wifi 解析状态
        try {
          const wifiOutput = await executeAdbCommand([ "-s", deviceId, "shell", "dumpsys", "wifi" ]);

          // 检查 mWifiState 字段
          const stateMatch = wifiOutput.match(/mWifiState:\s*(\d+)/);
          if (stateMatch) {
            const state = parseInt(stateMatch[1]);
            // Android WiFi 状态: 0=关闭, 1=开启中, 2=已启用, 3=已连接
            const stateText = state === 3 ? "已连接" : state === 2 ? "已启用" : state === 1 ? "开启中" : "关闭";
            wifi = stateText;
          } else {
            // 检查是否包含连接信息
            if (wifiOutput.includes("CONNECTED")) {
              wifi = "已连接";
            } else if (wifiOutput.includes("enabled")) {
              wifi = "已启用";
            } else {
              wifi = "未知";
            }
          }
        } catch (e2) {
          wifi = "获取失败";
        }
      }

      // 获取 WiFi 名称 (SSID)
      try {
        // 方法1: 使用 dumpsys wifi 获取 SSID
        const wifiOutput = await executeAdbCommand([ "-s", deviceId, "shell", "dumpsys", "wifi" ]);
        const ssidMatch = wifiOutput.match(/mWifiInfo.*?SSID:\s*"([^"]+)"/)
                         || wifiOutput.match(/SSID:\s*"([^"]+)"/)
                         || wifiOutput.match(/connected to\s+([^\s]+)/);
        if (ssidMatch) {
          wifiSsid = ssidMatch[1];
        } else {
          // 方法2: 使用 ip addr show wlan0 获取 SSID
          const ipOutput = await executeAdbCommand([ "-s", deviceId, "shell", "ip", "addr", "show", "wlan0" ]);
          const ipSsidMatch = ipOutput.match(/wlan0.*?ssid\s+"([^"]+)"/);
          if (ipSsidMatch) {
            wifiSsid = ipSsidMatch[1];
          } else {
            wifiSsid = "N/A";
          }
        }
      } catch (e) {
        wifiSsid = "获取失败";
      }

      // 获取 IP 地址
      let ipAddress = "N/A";
      try {
        const ipOutput = await executeAdbCommand([ "-s", deviceId, "shell", "ip", "addr", "show", "wlan0" ]);
        const ipMatch = ipOutput.match(/inet\s+(\d+\.\d+\.\d+\.\d+)/);
        if (ipMatch) {
          ipAddress = ipMatch[1];
        }
      } catch (e) {
        ipAddress = "获取失败";
      }

      setDeviceInfo({
        model: model.trim(),
        manufacturer: manufacturer.trim(),
        brand: brand.trim(),
        androidVersion: androidVersion.trim(),
        sdkVersion: sdkVersion.trim(),
        serialNumber: serialNumber.trim(),
        battery,
        storage,
        ram,
        cpu,
        resolution,
        wifi,
        wifiSsid,
        ipAddress,
        securityPatch: securityPatch.trim(),
        kernelVersion: kernelVersion.trim(),
        buildNumber: buildNumber.trim(),
        board: board.trim()
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
    debloat: "卸载预装应用",
    log: "操作记录"
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
                    disconnectDevice={disconnectDevice}
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

            {/* 系统精简内容 */}
            {activeSidebar === "debloat" && (
              <DebloatCard
                selectedDevice={selectedDevice}
                operating={operating}
                bloatwarePackages={BLOATWARE_PACKAGES}
                operationLog={operationLog}
                addLog={addLog}
                setOperating={setOperating}
                executeAdbCommand={executeAdbCommand}
                deviceInfo={deviceInfo}
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
