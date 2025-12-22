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
    <div className="h-full flex flex-col bg-background/50">
      {/* 顶部统一工具栏 */}
      <div className="flex flex-col border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        {/* 第一行：标题与搜索 */}
        <div className="flex items-center justify-between px-6 py-3 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold leading-none">
                  内置应用管理
                </span>
                {detectedBrand && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium tracking-wide">
                    {detectedBrand}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 font-mono truncate">
                {stats.total} 个应用 · {stats.disabled} 已禁用
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end max-w-xl">
            {/* 搜索框 */}
            <div className="relative w-full max-w-xs group">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/70 group-hover:text-primary transition-colors" />
              <Input
                placeholder="搜索应用名称或包名..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-muted/40 border-muted-foreground/20 focus-visible:bg-background transition-all"
              />
            </div>

            {/* 排序 */}
            <Select
              value={sortType}
              onValueChange={(v) => setSortType(v as SortType)}
            >
              <SelectTrigger className="h-8 w-[110px] text-xs bg-muted/40 border-muted-foreground/20">
                <SelectValue placeholder="排序" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="name-asc" className="text-xs">
                  名称 A-Z
                </SelectItem>
                <SelectItem value="name-desc" className="text-xs">
                  名称 Z-A
                </SelectItem>
                <SelectItem value="status-enabled" className="text-xs">
                  已启用优先
                </SelectItem>
                <SelectItem value="status-disabled" className="text-xs">
                  已禁用优先
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 第二行：批量操作栏 */}
        <div className="flex items-center justify-between px-6 py-2 bg-muted/20 border-t border-border/40 min-h-[44px]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                disabled={filteredPackages.length === 0}
                className="w-4 h-4 translate-y-[1px]"
              />
              <span className="text-xs text-muted-foreground font-medium select-none">
                全选
                {selectedPackages.size > 0 && (
                  <span className="ml-1 text-primary">
                    ({selectedPackages.size})
                  </span>
                )}
              </span>
            </div>

            {checking && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                扫描中...
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedPackages.size > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={batchEnableSelected}
                  disabled={!selectedDevice || operating}
                  className="h-7 text-xs px-3 gap-1.5 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:border-green-900 dark:text-green-400"
                >
                  <Check className="w-3.5 h-3.5" />
                  启用所选
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={batchDisableSelected}
                  disabled={!selectedDevice || operating}
                  className="h-7 text-xs px-3 gap-1.5 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400"
                >
                  {operating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Ban className="w-3.5 h-3.5" />
                  )}
                  禁用所选
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主内容区域 - 滚动容器 */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        {filteredPackages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center -mt-8 text-muted-foreground/50">
            <div className="p-4 rounded-full bg-muted/40 mb-4">
              <Search className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-sm font-medium">
              {checking ? "正在扫描应用..." : "没有找到符合条件的应用"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-8">
            {filteredPackages.map((item) => {
              const isInstalled = installedMap[item.package];
              const isSelected = selectedPackages.has(item.package);

              return (
                <div
                  key={item.package}
                  onClick={() => handleSelect(item.package, !isSelected)}
                  className={`
                      group relative flex flex-col gap-2 p-3 rounded-md border cursor-pointer transition-all duration-200
                      ${
                        isSelected
                          ? "bg-primary/5 border-primary/40 shadow-sm ring-1 ring-primary/10"
                          : "bg-card border-border/50 hover:bg-accent/40 hover:border-accent"
                      }
                      ${!isInstalled ? "opacity-70 grayscale-[0.3]" : ""}
                    `}
                >
                  {/* 选中勾选框 (绝对定位) */}
                  <div className="absolute top-3 right-3 z-10">
                    <Checkbox
                      checked={isSelected}
                      // 点击事件已经在父级处理，这里只需要显示状态
                      className={`transition-opacity duration-200 pointer-events-none ${
                        isSelected
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </div>

                  <div className="flex items-start gap-3 pr-6">
                    <div className="shrink-0 rounded-md overflow-hidden w-10 h-10">
                      <AppIcon package={item.package} size={40} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-sm font-medium text-foreground truncate max-w-[180px]"
                          title={item.name}
                        >
                          {item.name}
                        </span>
                        {!isInstalled && (
                          <span className="px-1 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 leading-none">
                            已禁用
                          </span>
                        )}
                      </div>
                      <span
                        className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px] hover:text-clip"
                        title={item.package}
                      >
                        {item.package}
                      </span>
                    </div>
                  </div>

                  {/* 描述与路径 */}
                  <div className="text-xs text-muted-foreground/80 line-clamp-2 h-8 leading-4 mt-1">
                    {item.desc || "暂无描述"}
                  </div>

                  {/* 单个操作按钮 (Hover显示) */}
                  <div className="pt-2 mt-auto border-t border-border/30 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation(); // 阻止触发卡片选中
                        handleAppAction(item, isInstalled);
                      }}
                      className={`h-6 text-[10px] px-2 ${
                        isInstalled
                          ? "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                      }`}
                    >
                      {isInstalled ? (
                        <Ban className="w-3 h-3 mr-1" />
                      ) : (
                        <Check className="w-3 h-3 mr-1" />
                      )}
                      {isInstalled ? "禁用" : "启用"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
