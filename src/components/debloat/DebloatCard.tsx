import { useState, useEffect, useMemo } from "react";
import {
  Package,
  Loader2,
  Ban,
  Check,
  Search,
  ArrowUpDown,
  Sparkles,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppIcon from "@/components/AppIcon";
import type { DeviceInfo } from "@/components/device/DeviceInfoCard";
import { getAppName, getAppDesc } from "@/data/bloatwarePackages";

// 扫描到的应用信息
interface ScannedApp {
  package: string;
  name: string;
  desc: string;
  path: string;
}

interface DebloatCardProps {
  selectedDevice: string;
  operating: boolean;
  addLog: (message: string) => void;
  setOperating: (value: boolean) => void;
  executeAdbCommand: (args: string[]) => Promise<string>;
  deviceInfo: DeviceInfo | null;
}

type SortType = "name-asc" | "name-desc" | "status-enabled" | "status-disabled";

export function DebloatCard({
  selectedDevice,
  operating,
  addLog,
  setOperating,
  executeAdbCommand,
  deviceInfo,
}: DebloatCardProps) {
  const detectedBrand = deviceInfo?.brand || null;

  // 从设备扫描到的应用列表
  const [scannedApps, setScannedApps] = useState<ScannedApp[]>([]);
  const [installedMap, setInstalledMap] = useState<Record<string, boolean>>({});
  const [checking, setChecking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<SortType>("name-asc");
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(
    new Set()
  );

  // 过滤和排序
  const filteredPackages = useMemo(() => {
    let result = [...scannedApps];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.package.toLowerCase().includes(query) ||
          item.desc.toLowerCase().includes(query) ||
          item.path.toLowerCase().includes(query)
      );
    }
    result.sort((a, b) => {
      switch (sortType) {
        case "name-asc":
          return a.name.localeCompare(b.name, "zh-CN");
        case "name-desc":
          return b.name.localeCompare(a.name, "zh-CN");
        case "status-enabled":
          const aEnabled = installedMap[a.package] ? 1 : 0;
          const bEnabled = installedMap[b.package] ? 1 : 0;
          return bEnabled - aEnabled || a.name.localeCompare(b.name, "zh-CN");
        case "status-disabled":
          const aDisabled = installedMap[a.package] ? 0 : 1;
          const bDisabled = installedMap[b.package] ? 0 : 1;
          return bDisabled - aDisabled || a.name.localeCompare(b.name, "zh-CN");
        default:
          return 0;
      }
    });
    return result;
  }, [scannedApps, searchQuery, sortType, installedMap]);

  const stats = useMemo(() => {
    const total = scannedApps.length;
    const enabled = scannedApps.filter(
      (p) => installedMap[p.package] === true
    ).length;
    const disabled = scannedApps.filter(
      (p) => installedMap[p.package] === false
    ).length;
    const unknown = total - enabled - disabled;
    return { total, enabled, disabled, unknown };
  }, [scannedApps, installedMap]);

  const allSelected =
    filteredPackages.length > 0 &&
    filteredPackages.every((p) => selectedPackages.has(p.package));
  const someSelected = filteredPackages.some((p) =>
    selectedPackages.has(p.package)
  );

  // 扫描设备上的小米/MIUI应用
  useEffect(() => {
    if (!selectedDevice) {
      setScannedApps([]);
      setInstalledMap({});
      return;
    }
    setChecking(true);
    setSelectedPackages(new Set());

    const scanApps = async () => {
      const apps: ScannedApp[] = [];
      const newMap: Record<string, boolean> = {};

      try {
        // 获取所有包及其路径（包括已卸载用户版本的，用 -u 参数）
        const allPackagesOutput = await executeAdbCommand([
          "-s",
          selectedDevice,
          "shell",
          "pm",
          "list",
          "packages",
          "-f",
          "-u", // 包括已卸载用户版本的包
        ]);

        // 获取已启用的包
        const enabledOutput = await executeAdbCommand([
          "-s",
          selectedDevice,
          "shell",
          "pm",
          "list",
          "packages",
          "-e",
        ]);
        const enabledPackages = new Set(
          enabledOutput
            .split("\n")
            .map((line) => line.replace("package:", "").trim())
            .filter(Boolean)
        );

        // 解析并过滤
        for (const line of allPackagesOutput.split("\n")) {
          // 格式: package:/system/app/xxx/base.apk=com.xxx.xxx
          const prefixRemoved = line.replace(/^package:/, "").trim();
          const lastEqualIndex = prefixRemoved.lastIndexOf("=");

          if (lastEqualIndex > 0) {
            const path = prefixRemoved.substring(0, lastEqualIndex);
            const pkg = prefixRemoved.substring(lastEqualIndex + 1);

            if (!path || !pkg) continue;

            // 只保留 /system/app/ 或 /product/app/ 下的 xiaomi/miui 应用
            const isTargetPath =
              path.startsWith("/system/app/") ||
              path.startsWith("/product/app/");
            const isXiaomiPackage =
              pkg.toLowerCase().includes("xiaomi") ||
              pkg.toLowerCase().includes("miui");

            if (isTargetPath && isXiaomiPackage) {
              // 使用映射表获取中文名，找不到则从包名生成
              const name = getAppName(pkg);
              const desc = getAppDesc(pkg);

              apps.push({ package: pkg, name, desc, path });
              newMap[pkg] = enabledPackages.has(pkg);
            }
          }
        }

        setScannedApps(apps);
        setInstalledMap(newMap);
      } catch (err) {
        console.error("扫描失败:", err);
        setScannedApps([]);
        setInstalledMap({});
      }

      setChecking(false);
    };

    scanApps();
  }, [selectedDevice]);

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedPackages(new Set());
    } else {
      setSelectedPackages(new Set(filteredPackages.map((p) => p.package)));
    }
  };

  const handleSelect = (packageName: string, checked: boolean) => {
    const newSet = new Set(selectedPackages);
    if (checked) {
      newSet.add(packageName);
    } else {
      newSet.delete(packageName);
    }
    setSelectedPackages(newSet);
  };

  const batchDisableSelected = async () => {
    if (!selectedDevice || selectedPackages.size === 0) {
      toast.error("请先选择要禁用的应用");
      return;
    }
    const packagesToProcess = scannedApps.filter(
      (p: ScannedApp) =>
        selectedPackages.has(p.package) && installedMap[p.package] === true
    );
    if (packagesToProcess.length === 0) {
      toast.info("选中的应用都已禁用");
      return;
    }
    setOperating(true);
    toast.info("开始批量禁用", {
      description: `共 ${packagesToProcess.length} 个应用`,
    });
    let failedCount = 0;
    try {
      for (const item of packagesToProcess) {
        addLog(`正在禁用: ${item.name} (${item.package})`);
        try {
          await executeAdbCommand([
            "-s",
            selectedDevice,
            "shell",
            "pm",
            "disable-user",
            "--user",
            "0",
            item.package,
          ]);
          addLog(`✅ 已禁用: ${item.name}`);
          setInstalledMap((prev) => ({ ...prev, [item.package]: false }));
        } catch (err) {
          const errMsg = String(err);
          // 如果是受保护的系统包，尝试卸载用户版本
          if (errMsg.includes("Cannot disable system packages")) {
            try {
              addLog(`ℹ️ ${item.name} 尝试卸载用户版本...`);
              await executeAdbCommand([
                "-s",
                selectedDevice,
                "shell",
                "pm",
                "uninstall",
                "--user",
                "0",
                item.package,
              ]);
              addLog(`✅ 已卸载用户版本: ${item.name}`);
              setInstalledMap((prev) => ({ ...prev, [item.package]: false }));
            } catch {
              failedCount++;
              addLog(`⚠️ ${item.name}: 无法禁用或卸载`);
            }
          } else if (errMsg.includes("Unknown package")) {
            failedCount++;
            addLog(`⚠️ 跳过 ${item.name}: 设备上不存在此应用`);
          } else {
            failedCount++;
            addLog(`❌ 失败 ${item.name}: ${errMsg}`);
          }
        }
      }
      if (failedCount > 0) {
        toast.warning("批量禁用完成", {
          description: `${failedCount} 个应用跳过或失败`,
        });
      } else {
        toast.success("批量禁用完成");
      }
      setSelectedPackages(new Set());
    } finally {
      setOperating(false);
    }
  };

  const batchEnableSelected = async () => {
    if (!selectedDevice || selectedPackages.size === 0) {
      toast.error("请先选择要启用的应用");
      return;
    }
    const packagesToProcess = scannedApps.filter(
      (p: ScannedApp) =>
        selectedPackages.has(p.package) && installedMap[p.package] === false
    );
    if (packagesToProcess.length === 0) {
      toast.info("选中的应用都已启用");
      return;
    }
    setOperating(true);
    toast.info("开始批量启用", {
      description: `共 ${packagesToProcess.length} 个应用`,
    });
    let failedCount = 0;
    try {
      for (const item of packagesToProcess) {
        addLog(`正在启用: ${item.name} (${item.package})`);
        try {
          await executeAdbCommand([
            "-s",
            selectedDevice,
            "shell",
            "pm",
            "install-existing",
            "--user",
            "0",
            item.package,
          ]);
          addLog(`✅ 已恢复/启用: ${item.name}`);
          setInstalledMap((prev) => ({ ...prev, [item.package]: true }));
        } catch {
          // install-existing 失败，尝试 enable
          try {
            await executeAdbCommand([
              "-s",
              selectedDevice,
              "shell",
              "pm",
              "enable",
              item.package,
            ]);
            addLog(`✅ 已启用: ${item.name}`);
            setInstalledMap((prev) => ({ ...prev, [item.package]: true }));
          } catch (installErr) {
            failedCount++;
            addLog(`⚠️ ${item.name}: 无法恢复（可能需要刷机）`);
          }
        }
      }
      if (failedCount > 0) {
        toast.warning("批量启用完成", {
          description: `${failedCount} 个应用跳过或失败`,
        });
      } else {
        toast.success("批量启用完成");
      }
      setSelectedPackages(new Set());
    } finally {
      setOperating(false);
    }
  };

  const handleAppAction = async (item: ScannedApp, isInstalled: boolean) => {
    if (!selectedDevice) return;
    setOperating(true);
    try {
      if (isInstalled) {
        // 先尝试禁用
        try {
          await executeAdbCommand([
            "-s",
            selectedDevice,
            "shell",
            "pm",
            "disable-user",
            "--user",
            "0",
            item.package,
          ]);
          addLog(`✅ 已禁用: ${item.name}`);
          toast.success("禁用成功", { description: item.name });
          setInstalledMap((prev) => ({ ...prev, [item.package]: false }));
        } catch (disableErr) {
          const errMsg = String(disableErr);
          // 如果是受保护的系统包，尝试卸载用户版本
          if (errMsg.includes("Cannot disable system packages")) {
            addLog(`ℹ️ ${item.name} 是受保护的系统包，尝试卸载用户版本...`);
            await executeAdbCommand([
              "-s",
              selectedDevice,
              "shell",
              "pm",
              "uninstall",
              "--user",
              "0",
              item.package,
            ]);
            addLog(`✅ 已卸载用户版本: ${item.name}`);
            toast.success("已卸载用户版本", { description: item.name });
            setInstalledMap((prev) => ({ ...prev, [item.package]: false }));
          } else {
            throw disableErr;
          }
        }
      } else {
        // 启用/恢复应用 - 总是使用 install-existing，因为它更可靠且涵盖了 enable 的功能
        try {
          await executeAdbCommand([
            "-s",
            selectedDevice,
            "shell",
            "pm",
            "install-existing",
            "--user",
            "0",
            item.package,
          ]);
          addLog(`✅ 已恢复/启用: ${item.name}`);
          toast.success("已恢复/启用", { description: item.name });
          setInstalledMap((prev) => ({ ...prev, [item.package]: true }));
        } catch (err) {
          // 如果 install-existing 失败（极其罕见），尝试 enable 作为最后的手段
          try {
            await executeAdbCommand([
              "-s",
              selectedDevice,
              "shell",
              "pm",
              "enable",
              item.package,
            ]);
            addLog(`✅ 已启用: ${item.name}`);
            toast.success("启用成功", { description: item.name });
            setInstalledMap((prev) => ({ ...prev, [item.package]: true }));
          } catch (enableErr) {
            const errMsg = String(err);
            addLog(`❌ 恢复失败: ${item.name} - ${errMsg}`);
            toast.error("恢复失败", {
              description: `${item.name} 可能需要恢复出厂设置或刷机`,
            });
          }
        }
      }
    } catch (err) {
      const errorMsg = String(err);
      const action = isInstalled ? "禁用" : "启用";
      if (errorMsg.includes("Unknown package")) {
        addLog(`⚠️ ${item.name}: 设备上不存在此应用`);
        toast.error("应用不存在", {
          description: `${item.name} 在此设备上未安装`,
        });
      } else if (errorMsg.includes("Cannot disable system packages")) {
        addLog(`⚠️ ${item.name}: 此应用无法被禁用或卸载`);
        toast.error("无法操作", {
          description: `${item.name} 是核心系统应用`,
        });
      } else {
        addLog(`❌ ${action}失败 ${item.name}: ${errorMsg}`);
        toast.error(`${action}失败`, {
          description: `${item.name}`,
        });
      }
    } finally {
      setOperating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 顶部区域 - 液态玻璃风格 */}
      <div className="relative overflow-hidden rounded-2xl
        bg-white/70 dark:bg-gray-900/40
        backdrop-blur-xl backdrop-saturate-150
        border border-white/20 dark:border-white/10
        shadow-[0_8px_32px_rgba(0,0,0,0.1)]
        hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)]
        transition-all duration-300
      ">
        {/* 背景装饰 - 动态渐变光效 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-pink-400/5" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />

        <div className="relative p-6">
          {/* 标题行 */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl
                bg-gradient-to-br from-blue-500 to-purple-500
                flex items-center justify-center
                shadow-[0_4px_16px_rgba(99,102,241,0.4)]
                ring-2 ring-white/20
              ">
                <Package className="w-6 h-6 text-white drop-shadow-sm" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white drop-shadow-sm">
                  内置应用管理
                </h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 font-medium">
                  {detectedBrand ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-500 drop-shadow-sm" />
                      <span>检测到</span>
                      <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                        {detectedBrand}
                      </span>
                      {checking && (
                        <span className="ml-2 text-blue-600 dark:text-blue-400 animate-pulse font-semibold">
                          • 正在扫描...
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Info className="w-3.5 h-3.5" />
                      请先连接设备
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* 批量操作 - 玻璃拟态浮动按钮 */}
            {selectedPackages.size > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                <button
                  onClick={batchEnableSelected}
                  disabled={!selectedDevice || operating}
                  className={`
                    group relative overflow-hidden
                    px-4 py-2 rounded-lg
                    bg-white/80 dark:bg-gray-800/80
                    backdrop-blur-md
                    border border-blue-200/50 dark:border-blue-700/50
                    text-blue-700 dark:text-blue-300 font-medium
                    hover:bg-blue-50/90 dark:hover:bg-blue-900/40
                    hover:border-blue-300 dark:hover:border-blue-600
                    transition-all duration-300
                    shadow-sm hover:shadow-lg
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 group-hover:via-blue-500/20 transition-opacity" />
                  <span className="relative flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    启用 {selectedPackages.size}
                  </span>
                </button>

                <button
                  onClick={batchDisableSelected}
                  disabled={!selectedDevice || operating}
                  className={`
                    group relative overflow-hidden
                    px-4 py-2 rounded-lg
                    bg-gradient-to-r from-red-500 to-pink-500
                    text-white font-medium
                    hover:from-red-600 hover:to-pink-600
                    transition-all duration-300
                    shadow-[0_4px_16px_rgba(239,68,68,0.3)]
                    hover:shadow-[0_6px_24px_rgba(239,68,68,0.4)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <span className="relative flex items-center gap-1.5">
                    {operating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Ban className="w-4 h-4" />
                    )}
                    禁用 {selectedPackages.size}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* 统计卡片 - 玻璃拟态仪表盘 */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: '总应用', value: stats.total, color: 'gray', icon: '📊' },
              { label: '已启用', value: stats.enabled, color: 'green', icon: '✅' },
              { label: '已禁用', value: stats.disabled, color: 'red', icon: '❌' },
              { label: '未知', value: stats.unknown, color: 'amber', icon: '❓' }
            ].map((stat, idx) => {
              const colors = {
                gray: 'from-gray-50/80 to-gray-100/60 dark:from-gray-800/60 dark:to-gray-900/40 border-gray-300/50 text-gray-900 dark:text-white',
                green: 'from-green-50/80 to-emerald-100/60 dark:from-emerald-900/30 dark:to-emerald-950/20 border-emerald-300/50 text-emerald-700 dark:text-emerald-300',
                red: 'from-red-50/80 to-rose-100/60 dark:from-rose-900/30 dark:to-rose-950/20 border-rose-300/50 text-rose-700 dark:text-rose-300',
                amber: 'from-amber-50/80 to-orange-100/60 dark:from-orange-900/30 dark:to-orange-950/20 border-orange-300/50 text-orange-700 dark:text-orange-300'
              };

              return (
                <div key={idx} className={`
                  relative overflow-hidden rounded-xl
                  bg-gradient-to-br ${colors[stat.color]}
                  backdrop-blur-md
                  border
                  shadow-[0_4px_16px_rgba(0,0,0,0.08)]
                  p-4
                `}>
                  <div className="relative z-10">
                    <div className="text-3xl font-bold tracking-tight mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-80 flex items-center gap-1">
                      <span>{stat.icon}</span>
                      <span>{stat.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 搜索和排序 - 玻璃拟态控制栏 */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/20 dark:border-white/10">
            <div className="relative flex-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-lg blur-xl" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <input
                type="text"
                placeholder="搜索应用名称、包名或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative w-full pl-10 pr-4 py-2.5 rounded-lg
                  bg-white/80 dark:bg-gray-900/60
                  backdrop-blur-xl
                  border border-white/30 dark:border-white/10
                  text-gray-900 dark:text-gray-100
                  placeholder:text-gray-400
                  focus:outline-none
                  focus:ring-2 focus:ring-blue-500/30
                  focus:border-blue-400/50
                  transition-all duration-300
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]
                "
              />
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg blur-lg" />
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                className="relative px-3 py-2.5 rounded-lg
                  bg-white/80 dark:bg-gray-900/60
                  backdrop-blur-xl
                  border border-white/30 dark:border-white/10
                  text-gray-900 dark:text-gray-100 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500/30
                  cursor-pointer
                  font-medium
                "
              >
                <option value="name-asc">名称 A-Z</option>
                <option value="name-desc">名称 Z-A</option>
                <option value="status-enabled">已启用优先</option>
                <option value="status-disabled">已禁用优先</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="space-y-4">
        {/* 顶部控制栏 - 玻璃拟态 */}
        <div className="flex items-center justify-between px-1">
          <label className="relative flex items-center gap-3 cursor-pointer select-none group px-3 py-2 rounded-xl
            bg-white/60 dark:bg-gray-900/40
            backdrop-blur-md
            border border-white/20 dark:border-white/10
            hover:bg-white/80 dark:hover:bg-gray-900/60
            transition-all duration-300
            shadow-sm
          ">
            <div className="relative">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                disabled={filteredPackages.length === 0}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              {someSelected && !allSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                </div>
              )}
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              {allSelected ? "取消全选" : someSelected ? "部分选中" : "全选"}
            </span>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800/60 backdrop-blur px-2 py-0.5 rounded-md border border-gray-200/50 dark:border-gray-700/50">
              {selectedPackages.size} / {filteredPackages.length}
            </span>
          </label>

          <div className="flex items-center gap-3">
            {searchQuery && filteredPackages.length !== scannedApps.length && (
              <span className="relative px-3 py-1.5 rounded-full text-xs font-bold
                bg-gradient-to-r from-blue-500/20 to-purple-500/20
                backdrop-blur-md
                border border-blue-300/30 dark:border-blue-700/30
                text-blue-700 dark:text-blue-300
                shadow-sm
              ">
                🔍 {filteredPackages.length} 个结果
              </span>
            )}
            {checking && (
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur border border-white/20">
                <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                扫描中...
              </span>
            )}
          </div>
        </div>

        {/* 卡片网格 - 液态玻璃卡片 */}
        <div className="flex-1 overflow-y-auto min-h-[400px] pr-1">
          {filteredPackages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 px-4
              rounded-2xl border-2 border-dashed border-white/20 dark:border-white/10
              bg-white/40 dark:bg-gray-900/30 backdrop-blur-xl
            ">
              <div className="w-16 h-16 rounded-full
                bg-white/60 dark:bg-gray-800/60 backdrop-blur-md
                flex items-center justify-center mb-4
                border border-white/30 dark:border-gray-700/50
                shadow-[0_4px_16px_rgba(0,0,0,0.1)]
              ">
                <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white mb-1 drop-shadow-sm">
                {searchQuery ? "未找到匹配的应用" : "暂无数据"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {searchQuery ? "尝试调整搜索关键词" : "请连接设备并扫描内置应用"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPackages.map((item, index) => {
                const isInstalled = installedMap[item.package];
                const isSelected = selectedPackages.has(item.package);

                return (
                  <div
                    key={item.package}
                    className={`
                      relative overflow-hidden rounded-xl
                      transition-all duration-500 ease-out
                      ${isSelected
                        ? `
                          bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-pink-50/60
                          dark:from-blue-900/30 dark:via-purple-900/20 dark:to-pink-900/20
                          backdrop-blur-2xl
                          border-2 border-blue-400/50 dark:border-blue-500/50
                          shadow-[0_8px_32px_rgba(99,102,241,0.25)]
                          scale-[1.02]
                        `
                        : `
                          bg-white/70 dark:bg-gray-900/40
                          backdrop-blur-xl
                          border border-white/20 dark:border-white/10
                          shadow-[0_4px_16px_rgba(0,0,0,0.08)]
                          hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)]
                          hover:scale-[1.01]
                          hover:border-blue-200/50 dark:hover:border-blue-700/50
                        `
                      }
                    `}
                  >
                    {/* 背景光效 - 仅在选中时显示 */}
                    {isSelected && (
                      <div className="absolute inset-0">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl animate-pulse" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
                      </div>
                    )}

                    {/* 选中指示器 - 霓虹风格 */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-7 h-7
                        bg-gradient-to-br from-blue-500 to-purple-500
                        rounded-full flex items-center justify-center
                        shadow-[0_4px_12px_rgba(99,102,241,0.6)]
                        ring-2 ring-white/50
                        animate-in zoom-in duration-300
                      ">
                        <Check className="w-4 h-4 text-white drop-shadow-sm" />
                      </div>
                    )}

                    {/* 悬停光晕边框 */}
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-300
                      group-hover:border-blue-200/30 dark:group-hover:border-blue-700/30
                      pointer-events-none
                    " />

                    <div className="relative p-4 flex flex-col gap-3">
                      {/* 头部：图标 + 名称 + 状态 */}
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 relative">
                          {/* 图标容器 - 玻璃拟态 */}
                          <div className="relative">
                            <AppIcon package={item.package} size={52} />
                            {/* 发光效果 */}
                            <div className="absolute inset-0 rounded-full blur-md opacity-30 bg-gradient-to-br from-blue-400 to-purple-400" />
                          </div>

                          {/* 状态覆盖图标 - 霓虹风格 */}
                          {isInstalled !== undefined && (
                            <div className={`
                              absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full
                              flex items-center justify-center
                              shadow-[0_2px_8px_rgba(0,0,0,0.3)]
                              ring-2 ring-white dark:ring-gray-900
                              ${isInstalled
                                ? "bg-gradient-to-br from-green-500 to-emerald-500"
                                : "bg-gradient-to-br from-red-500 to-rose-500"
                              }
                            `}>
                              {isInstalled ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-white drop-shadow-sm" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-white drop-shadow-sm" />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate drop-shadow-sm">
                              {item.name}
                            </span>
                          </div>
                          <div className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed font-medium opacity-90">
                            {item.desc || "暂无描述信息"}
                          </div>
                        </div>
                      </div>

                      {/* 包名信息 - 玻璃拟态 */}
                      <div className="relative flex items-center justify-between text-xs font-mono
                        bg-white/50 dark:bg-gray-800/50
                        backdrop-blur-md
                        border border-white/30 dark:border-white/10
                        rounded-lg px-2.5 py-1.5
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]
                      ">
                        <span
                          className="truncate text-gray-800 dark:text-gray-200 font-semibold"
                          title={item.package}
                        >
                          {item.package}
                        </span>
                        <span className={`
                          px-1.5 py-0.5 rounded text-[10px] font-bold
                          ${isInstalled
                            ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300/30"
                            : "bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-700 dark:text-red-300 border border-red-300/30"
                          }
                        `}>
                          {isInstalled ? "启用" : "禁用"}
                        </span>
                      </div>

                      {/* 操作区域 - 分隔式设计 */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/20 dark:border-white/10">
                        {/* 选择框 - 玻璃拟态 */}
                        <label className="relative flex items-center gap-2 cursor-pointer
                          px-2 py-1.5 rounded-lg
                          hover:bg-white/60 dark:hover:bg-gray-800/60
                          transition-all duration-200
                          overflow-hidden
                        ">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 hover:opacity-100 transition-opacity" />
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelect(item.package, checked as boolean)
                            }
                            className="relative z-10 size-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <span className="relative z-10 text-xs font-bold text-gray-700 dark:text-gray-300">
                            选择
                          </span>
                        </label>

                        <div className="flex-1" />

                        {/* 主要操作按钮 - 液态玻璃风格 */}
                        <button
                          onClick={() => handleAppAction(item, isInstalled)}
                          disabled={!selectedDevice || operating || isInstalled === undefined}
                          className={`
                            relative overflow-hidden
                            px-3 py-1.5 rounded-lg
                            text-xs font-bold
                            transition-all duration-300
                            flex items-center gap-1.5
                            ${isInstalled
                              ? `
                                bg-white/80 dark:bg-gray-800/80
                                backdrop-blur-md
                                border border-red-200/50 dark:border-red-700/50
                                text-red-700 dark:text-red-300
                                hover:bg-red-50/90 dark:hover:bg-red-900/40
                                hover:border-red-300 dark:hover:border-red-600
                                hover:shadow-[0_4px_16px_rgba(239,68,68,0.2)]
                              `
                              : `
                                bg-gradient-to-r from-blue-600 to-purple-600
                                text-white
                                hover:from-blue-700 hover:to-purple-700
                                shadow-[0_4px_16px_rgba(99,102,241,0.4)]
                                hover:shadow-[0_6px_24px_rgba(99,102,241,0.5)]
                              `
                            }
                            ${operating ? "opacity-60 cursor-not-allowed" : "active:scale-95"}
                          `}
                        >
                          {operating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isInstalled ? (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              禁用
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              启用
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 浮动选择指示器 - 霓虹点 */}
                    <div className={`
                      absolute top-3 right-3 w-2.5 h-2.5 rounded-full shadow-sm transition-all duration-300
                      ${isSelected
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 scale-125 opacity-100 ring-2 ring-white/50"
                        : "bg-gray-300 dark:bg-gray-600 opacity-0 group-hover:opacity-100 group-hover:scale-110"
                      }
                    `} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
