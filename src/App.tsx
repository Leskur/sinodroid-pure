import { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";

// 扩展 Window 接口以支持自定义属性
declare global {
  interface Window {
    __lastDeviceChangeTime?: number;
  }
}
import {
  initPlatformTools,
  isPlatformToolsReady,
  getAdbVersion,
  getDevices,
  executeAdbCommand,
  type Device,
} from "@/lib/adb";
import {
  LoadingScreen,
  type LoadingStepKey,
} from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { Sidebar, type SidebarType } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { DeviceListCard } from "@/components/device/DeviceListCard";
import {
  DeviceInfoCard,
  type DeviceInfo,
} from "@/components/device/DeviceInfoCard";
import { WiFiConnectCard } from "@/components/device/WiFiConnectCard";
import { DebloatCard } from "@/components/debloat/DebloatCard";
import { LogPanel } from "@/components/logs/LogPanel";
import { AboutCard } from "@/components/about/AboutCard";

function App() {
  const [initializing, setInitializing] = useState(true);
  const [loadingStage, setLoadingStage] = useState<LoadingStepKey>("check");
  const [ready, setReady] = useState(false);
  const [preheating, setPreheating] = useState(true); // ADB 预热状态

  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [activeSidebar, setActiveSidebar] = useState<SidebarType>("device");
  const [autoDetect, setAutoDetect] = useState(false); // 自动检测开关
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // 系统记录
  const [operationLog, setOperationLog] = useState<string[]>([]);
  const [operating, setOperating] = useState(false);

  // 设备信息缓存（单次生命周期内）
  const deviceInfoCacheRef = useRef<Map<string, DeviceInfo>>(new Map());

  // 生成时间戳 (YYYY-MM-DD HH:mm:ss)
  const getTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 添加日志记录（自动添加时间戳）
  const addLog = (message: string) => {
    setOperationLog((prev) => [...prev, `${getTimestamp()} ${message}`]);
  };

  // 初始化 platform-tools
  const adbInitializedRef = useRef(false);

  useEffect(() => {
    // 防止 StrictMode 导致重复初始化
    if (adbInitializedRef.current) return;
    adbInitializedRef.current = true;

    async function init() {
      try {
        setLoadingStage("check");
        const isReady = await isPlatformToolsReady();

        if (!isReady) {
          setLoadingStage("setup");
          await initPlatformTools();
        }

        const version = await getAdbVersion();

        setReady(true);
        toast.success("ADB 工具初始化成功", {
          description: version.split("\n")[0],
        });
        addLog(`✅ ADB 工具初始化完成: ${version.split("\n")[0]}`);

        // 预热 ADB 服务器：在后台预启动 ADB 服务器，避免首次调用延迟
        setLoadingStage("server");
        addLog("🔄 正在预热 ADB 服务器 (后台进行)...");

        // 预热 ADB 服务器：等待预热完成再进入主界面
        setLoadingStage("server");
        addLog("🔄 正在预热 ADB 服务器...");

        try {
          // 这里必须 await，确保“Loading”界面一直显示到 ADB 第一次响应为止（涵盖那7秒的冷启动）
          await getDevices();
          addLog("✅ ADB 服务器预热完成");
        } catch (e) {
          // 即使没有设备或报错，也视为预热完成（只要 ADB 进程响应了就行）
          addLog(`⚠️ ADB 预热完成（无设备连接）: ${String(e)}`);
        } finally {
          setPreheating(false);
        }

        setLoadingStage("ready");
        // 稍微停顿一下展示完成状态 (800ms)
        await new Promise((resolve) => setTimeout(resolve, 800));
        setInitializing(false);
      } catch (err) {
        console.error("[INIT] 初始化失败:", err);
        toast.error("初始化失败", { description: String(err) });
        addLog(`❌ 初始化失败: ${String(err)}`);
        setInitializing(false);
      }
    }

    // 延迟 100ms 执行初始化，确保 LoadingScreen 先渲染出来，避免白屏
    setTimeout(() => {
      init();
    }, 100);
  }, []);

  // 刷新设备列表
  const refreshDevices = async () => {
    addLog("🔄 刷新设备列表...");
    const startTime = performance.now();

    try {
      const deviceList = await getDevices();
      const duration = performance.now() - startTime;

      // 性能警告：如果超过2秒，提示用户
      if (duration > 2000) {
        addLog(`⚠️  刷新较慢: ${duration.toFixed(0)}ms，建议检查 ADB 连接`);
      }

      setDevices(deviceList);

      if (deviceList.length > 0 && !selectedDevice) {
        setSelectedDevice(deviceList[0].id);
      }

      toast.success("设备列表已刷新", {
        description: `发现 ${deviceList.length} 台设备`,
      });
      addLog(
        `✅ 刷新完成: ${deviceList.length} 台设备 (${duration.toFixed(0)}ms)`
      );
    } catch (err) {
      const duration = performance.now() - startTime;
      addLog(`❌ 获取设备列表失败: ${String(err)} (${duration.toFixed(0)}ms)`);
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

      // 从缓存中移除该设备
      deviceInfoCacheRef.current.delete(deviceId);

      // 记录日志
      addLog(`✅ 已断开设备: ${deviceId}`);
    } catch (err) {
      toast.error("断开设备失败", { description: String(err) });
      addLog(`❌ 断开设备失败 ${deviceId}: ${String(err)}`);
    }
  };

  // 自动检测设备插拔（带智能节流和缓存）
  const autoDetectRunningRef = useRef(false);

  useEffect(() => {
    // 防止 StrictMode 创建多个定时器
    if (autoDetectRunningRef.current) return;
    autoDetectRunningRef.current = true;

    let intervalId: NodeJS.Timeout;
    let previousDeviceCount = 0;
    let lastCheckTime = 0;
    const CHECK_INTERVAL = 3000; // 3秒
    const MIN_INTERVAL = 5000; // 最小5秒才记录一次变化（避免抖动）

    const checkDeviceChanges = async () => {
      if (!autoDetect) return;

      const now = Date.now();
      // 节流：如果距离上次检查太短，跳过
      if (now - lastCheckTime < CHECK_INTERVAL) return;
      lastCheckTime = now;

      try {
        const deviceList = await getDevices();
        const currentCount = deviceList.length;

        // 检测设备数量变化（带防抖）
        if (currentCount !== previousDeviceCount) {
          const timeSinceLastChange =
            now - (window.__lastDeviceChangeTime || 0);

          if (timeSinceLastChange > MIN_INTERVAL || previousDeviceCount === 0) {
            if (currentCount > previousDeviceCount && previousDeviceCount > 0) {
              // 新设备连接
              toast.success("检测到新设备连接", {
                description: `当前 ${currentCount} 台设备`,
              });
            } else if (currentCount < previousDeviceCount && currentCount > 0) {
              // 设备断开
              toast.info("设备已断开", {
                description: `剩余 ${currentCount} 台设备`,
              });
            }

            window.__lastDeviceChangeTime = now;
            previousDeviceCount = currentCount;

            // 更新设备列表
            setDevices(deviceList);

            // 自动选择设备
            if (deviceList.length > 0) {
              const currentDeviceStillConnected = deviceList.some(
                (d) => d.id === selectedDevice
              );
              if (!currentDeviceStillConnected || !selectedDevice) {
                setSelectedDevice(deviceList[0].id);
              }
            } else {
              setSelectedDevice("");
            }
          }
        }
      } catch (err) {
        // 静默处理错误，避免频繁弹窗
        console.error("设备检测错误:", err);
      }
    };

    // 只在 ready、预热完成且开启了自动检测时才启动检测
    if (ready && !preheating && autoDetect) {
      intervalId = setInterval(checkDeviceChanges, CHECK_INTERVAL);
    }

    return () => {
      autoDetectRunningRef.current = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [ready, preheating, selectedDevice, autoDetect]);

  // 清空日志
  const clearLog = () => {
    setOperationLog([]);
    toast.info("日志已清空");
  };

  // 获取设备详细信息（带缓存）
  const fetchDeviceInfo = async (
    deviceId: string,
    forceRefresh: boolean = false
  ) => {
    if (!deviceId) return;

    // 检查缓存
    if (!forceRefresh && deviceInfoCacheRef.current.has(deviceId)) {
      addLog(`ℹ️ 使用缓存设备信息: ${deviceId}`);
      setDeviceInfo(deviceInfoCacheRef.current.get(deviceId) || null);
      return;
    }

    addLog(
      `🔄 开始获取设备信息: ${deviceId} ${forceRefresh ? "(强制刷新)" : ""}`
    );
    const startTime = performance.now();
    setLoadingInfo(true);
    setDeviceInfo(null);

    try {
      // 获取设备型号
      const model = await executeAdbCommand([
        "-s",
        deviceId,
        "shell",
        "getprop",
        "ro.product.model",
      ]);

      // 获取制造商
      const manufacturer = await executeAdbCommand([
        "-s",
        deviceId,
        "shell",
        "getprop",
        "ro.product.manufacturer",
      ]);

      // 获取品牌（用于过滤广告包）
      const brand = await executeAdbCommand([
        "-s",
        deviceId,
        "shell",
        "getprop",
        "ro.product.brand",
      ]);

      // 获取 Android 版本
      const androidVersion = await executeAdbCommand([
        "-s",
        deviceId,
        "shell",
        "getprop",
        "ro.build.version.release",
      ]);

      // 获取 SDK 版本
      const sdkVersion = await executeAdbCommand([
        "-s",
        deviceId,
        "shell",
        "getprop",
        "ro.build.version.sdk",
      ]);

      // 获取序列号
      const serialNumber = await executeAdbCommand([
        "-s",
        deviceId,
        "shell",
        "getprop",
        "ro.serialno",
      ]);

      // 获取安全补丁级别
      const securityPatch = await executeAdbCommand([
        "-s",
        deviceId,
        "shell",
        "getprop",
        "ro.build.version.security_patch",
      ]).catch(() => "N/A");

      // 获取构建版本号
      const buildNumber = await executeAdbCommand([
        "-s",
        deviceId,
        "shell",
        "getprop",
        "ro.build.version.incremental",
      ]).catch(() => "N/A");

      // 获取主板型号
      const board = await executeAdbCommand([
        "-s",
        deviceId,
        "shell",
        "getprop",
        "ro.product.board",
      ]).catch(() => "N/A");

      // 获取内核版本
      const kernelVersion = await executeAdbCommand([
        "-s",
        deviceId,
        "shell",
        "uname",
        "-r",
      ]).catch(() => "N/A");

      // 获取存储信息
      let storage = "N/A";
      try {
        const storageOutput = await executeAdbCommand([
          "-s",
          deviceId,
          "shell",
          "df",
          "/data",
        ]);
        const lines = storageOutput.split("\n").filter((l) => l.trim());
        if (lines.length > 1) {
          const parts = lines[1].trim().split(/\s+/);
          const totalKb = parseInt(parts[1]);
          const usedKb = parseInt(parts[2]);
          const availKb = parseInt(parts[3]);

          const totalGb = (totalKb / 1024 / 1024).toFixed(1);
          const usedGb = (usedKb / 1024 / 1024).toFixed(1);
          const availGb = (availKb / 1024 / 1024).toFixed(1);

          storage = `总: ${totalGb} GB, 已用: ${usedGb} GB, 可用: ${availGb} GB`;
        }
      } catch (e) {
        addLog(`  ⚠️  获取存储信息失败: ${String(e)}`);
      }

      // 获取内存信息
      let ram = "N/A";
      try {
        // 方法1: 从 /proc/meminfo 获取
        const memOutput = await executeAdbCommand([
          "-s",
          deviceId,
          "shell",
          "cat",
          "/proc/meminfo",
        ]);
        const totalMatch = memOutput.match(/MemTotal:\s*(\d+)/);
        if (totalMatch) {
          const totalKb = parseInt(totalMatch[1]);
          const totalGb = (totalKb / 1024 / 1024).toFixed(1);
          ram = `${totalGb} GB`;
        } else {
          // 方法2: 使用 getprop 获取
          const memProp = await executeAdbCommand([
            "-s",
            deviceId,
            "shell",
            "getprop",
            "ro.product.mem.max",
          ]);
          if (memProp.trim()) {
            const memMb = parseInt(memProp.trim());
            const memGb = (memMb / 1024).toFixed(1);
            ram = `${memGb} GB`;
          } else {
            ram = "未知";
          }
        }
      } catch (e) {
        addLog(`  ⚠️  获取内存信息失败: ${String(e)}`);
      }

      // 获取 CPU 信息
      let cpu = "N/A";
      try {
        // 方法1: 从 /proc/cpuinfo 获取
        const cpuOutput = await executeAdbCommand([
          "-s",
          deviceId,
          "shell",
          "cat",
          "/proc/cpuinfo",
        ]);

        // 尝试多种可能的 CPU 型号字段
        const modelMatch =
          cpuOutput.match(/Hardware\s*:\s*(.+)/) ||
          cpuOutput.match(/processor\s*:\s*0\s*\n.*?model name\s*:\s*(.+)/s) ||
          cpuOutput.match(/model name\s*:\s*(.+)/);

        // 统计核心数
        const coresMatch = cpuOutput.match(/processor\s*:\s*(\d+)/g);
        const coreCount = coresMatch ? coresMatch.length : 1;

        if (modelMatch) {
          cpu = modelMatch[1].trim();
          cpu += ` (${coreCount} 核)`;
        } else {
          // 方法2: 使用 getprop 获取 CPU 信息
          const cpuProp = await executeAdbCommand([
            "-s",
            deviceId,
            "shell",
            "getprop",
            "ro.hardware",
          ]);
          if (cpuProp.trim()) {
            cpu = cpuProp.trim();
            cpu += ` (${coreCount} 核)`;
          } else {
            cpu = `${coreCount} 核处理器`;
          }
        }
      } catch (e) {
        addLog(`  ⚠️  获取CPU信息失败: ${String(e)}`);
      }

      // 获取分辨率
      let resolution = "N/A";
      try {
        const resolutionOutput = await executeAdbCommand([
          "-s",
          deviceId,
          "shell",
          "wm",
          "size",
        ]);
        const match = resolutionOutput.match(/Physical size:\s*(\d+x\d+)/);
        if (match) {
          resolution = match[1];
        }
      } catch (e) {
        addLog(`  ⚠️  获取分辨率失败: ${String(e)}`);
      }

      const deviceInfoData: DeviceInfo = {
        model: model.trim(),
        manufacturer: manufacturer.trim(),
        brand: brand.trim(),
        androidVersion: androidVersion.trim(),
        sdkVersion: sdkVersion.trim(),
        serialNumber: serialNumber.trim(),
        storage,
        ram,
        cpu,
        resolution,
        securityPatch: securityPatch.trim(),
        kernelVersion: kernelVersion.trim(),
        buildNumber: buildNumber.trim(),
        board: board.trim(),
      };

      // 存入缓存
      deviceInfoCacheRef.current.set(deviceId, deviceInfoData);
      setDeviceInfo(deviceInfoData);

      const totalTime = performance.now() - startTime;
      addLog(`✅ 设备信息获取完成: ${totalTime.toFixed(0)}ms`);
    } catch (err) {
      const totalTime = performance.now() - startTime;
      addLog(`❌ 设备信息获取失败: ${String(err)} (${totalTime.toFixed(0)}ms)`);
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
    return <LoadingScreen currentStage={loadingStage} />;
  }

  // 初始化失败
  if (!ready) {
    return <ErrorScreen />;
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 侧边栏 */}
        <Sidebar
          activeSidebar={activeSidebar}
          setActiveSidebar={setActiveSidebar}
          disabled={preheating}
        />

        {/* 右侧内容区域 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* 自定义标题栏区域 - 拖拽区与窗口控制 */}

          {/* 内容区域 - 全屏容器 */}
          <div className="flex-1 overflow-hidden relative bg-background/50">
            {/* 关于页面 */}
            {activeSidebar === "about" && (
              <div className="h-full relative overflow-hidden">
                <AboutCard />
              </div>
            )}

            {/* 设备管理 - 全屏布局 */}
            {activeSidebar === "device" && (
              <div className="h-full flex flex-col">
                {/* 统一头部 */}

                {/* 可滚动内容区 */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div
                    className={`space-y-4 max-w-6xl mx-auto ${
                      preheating ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
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
                </div>
              </div>
            )}

            {/* 系统精简内容 */}
            {activeSidebar === "debloat" && (
              <div
                className={`h-full ${
                  preheating ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <DebloatCard
                  selectedDevice={selectedDevice}
                  operating={operating}
                  addLog={addLog}
                  setOperating={setOperating}
                  executeAdbCommand={executeAdbCommand}
                  deviceInfo={deviceInfo}
                />
              </div>
            )}

            {/* 日志内容 - 始终可查看 */}
            {activeSidebar === "log" && (
              <LogPanel operationLog={operationLog} clearLog={clearLog} />
            )}
          </div>

          {/* 底部状态栏 - 跟随右侧内容区域 */}
          <StatusBar
            connectedCount={devices.length}
            selectedDevice={selectedDevice}
            deviceName={
              deviceInfo ? `${deviceInfo.brand} ${deviceInfo.model}` : undefined
            }
            loading={preheating || operating}
            loadingText={
              preheating
                ? "正在读取应用列表..."
                : operating
                ? "正在执行操作..."
                : undefined
            }
          />
        </div>
      </div>

      {/* Toast 提示 */}
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
