import { useState, useEffect, useMemo } from "react";
import { Package, Loader2, Ban, Check, Search, Cable, X } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { DeviceInfo } from "@/components/device/DeviceInfoCard";
import { getAppName, getAppDesc } from "@/data/bloatwarePackages";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";

import { DebloatAppItem } from "./DebloatAppItem";
import { ScannedApp } from "./types";

// 扫描到的应用信息

interface DebloatCardProps {
  selectedDevice: string;
  operating: boolean;
  addLog: (message: string) => void;
  setOperating: (value: boolean) => void;
  executeAdbCommand: (args: string[]) => Promise<string>;
  deviceInfo: DeviceInfo | null;
}

type SortType = "name-asc" | "name-desc" | "package-asc" | "package-desc";

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

  // 二次确认弹窗状态
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    () => Promise<void> | void
  >(() => {});
  const [confirmMessage, setConfirmMessage] = useState({
    title: "",
    description: "",
  });

  // 状态筛选类型
  type FilterStatus = "all" | "enabled" | "disabled";
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // 过滤和排序
  const filteredPackages = useMemo(() => {
    let result = [...scannedApps];

    // 1. 状态筛选
    if (filterStatus === "enabled") {
      result = result.filter((item) => installedMap[item.package] === true);
    } else if (filterStatus === "disabled") {
      result = result.filter((item) => installedMap[item.package] === false);
    }

    // 2. 搜索过滤
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

    // 3. 排序
    result.sort((a, b) => {
      switch (sortType) {
        case "name-asc":
          return a.name.localeCompare(b.name, "zh-CN");
        case "name-desc":
          return b.name.localeCompare(a.name, "zh-CN");
        case "package-asc":
          return a.package.localeCompare(b.package);
        case "package-desc":
          return b.package.localeCompare(a.package);
        default:
          return 0;
      }
    });
    return result;
  }, [scannedApps, searchQuery, sortType, installedMap, filterStatus]);

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

    // 弹出确认框
    setConfirmMessage({
      title: "确认禁用应用",
      description: `您即将禁用 ${packagesToProcess.length} 个应用。\n\n这些应用将被冻结并隐藏，但不会被彻底删除。如果遇到任何系统异常，您随时可以在列表中重新启用它们。\n\n是否继续执行？`,
    });
    setConfirmAction(() => async () => {
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
    });
    setConfirmOpen(true);
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

  return (
    <div className="h-full flex flex-col bg-background/50">
      {/* 顶部统一工具栏 */}
      <div className="flex flex-col border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shrink-0 z-10 shadow-sm">
        <div className="flex flex-col gap-4 px-6 py-4">
          {/* 第一行：标题 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold leading-none text-foreground/90">
                    应用管理
                  </span>
                  {detectedBrand && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-medium tracking-wide shadow-sm ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/20">
                      {detectedBrand}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground/60 mt-1 font-mono">
                  Manage system applications
                </span>
              </div>
            </div>
          </div>

          {/* 第二行：控制台 (Tabs + 搜索) */}
          <div className="flex items-center justify-between gap-4">
            {/* 左侧：筛选 Tabs */}
            <Tabs
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v as FilterStatus)}
              className="h-8"
            >
              <TabsList className="h-8 w-auto bg-muted/60 p-1 gap-1 shadow-sm border border-border/20">
                <TabsTrigger
                  value="all"
                  className="h-6 text-[10px] px-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                >
                  全部 {stats.total}
                </TabsTrigger>
                <TabsTrigger
                  value="enabled"
                  className="h-6 text-[10px] px-3 data-[state=active]:bg-background data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 data-[state=active]:shadow-sm transition-all"
                >
                  启用 {stats.enabled}
                </TabsTrigger>
                <TabsTrigger
                  value="disabled"
                  className="h-6 text-[10px] px-3 data-[state=active]:bg-background data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 data-[state=active]:shadow-sm transition-all"
                >
                  禁用 {stats.disabled}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 右侧：搜索与排序 */}
            <div className="flex items-center gap-2">
              <div className="relative w-48 lg:w-64 group">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                <Input
                  placeholder="搜索应用..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-8 text-xs bg-muted/40 border-muted-foreground/20 focus-visible:bg-background focus-visible:ring-1 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors p-0.5 rounded-full hover:bg-muted"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <Select
                value={sortType}
                onValueChange={(v) => setSortType(v as SortType)}
              >
                <SelectTrigger className="h-8 w-[100px] text-xs bg-muted/40 border-muted-foreground/20 px-2.5">
                  <SelectValue placeholder="排序" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="name-asc" className="text-xs">
                    名称 A-Z
                  </SelectItem>
                  <SelectItem value="name-desc" className="text-xs">
                    名称 Z-A
                  </SelectItem>
                  <SelectItem value="package-asc" className="text-xs">
                    包名 A-Z
                  </SelectItem>
                  <SelectItem value="package-desc" className="text-xs">
                    包名 Z-A
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 第二行：批量操作栏 */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-muted/30 border-t border-border/50 min-h-[48px]">
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
        {!selectedDevice ? (
          <div className="h-full flex flex-col items-center justify-center -mt-8 text-muted-foreground/50 animate-in fade-in zoom-in-95 duration-300">
            <div className="p-4 rounded-full bg-muted/40 mb-4 ring-1 ring-border/50">
              <Cable className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-sm font-medium">请先连接设备</p>
            <p className="text-xs text-muted-foreground/40 mt-1.5 max-w-[200px] text-center leading-relaxed">
              连接您的 Android 设备并开启 USB 调试以管理应用
            </p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center -mt-8 text-muted-foreground/50">
            <div className="p-4 rounded-full bg-muted/40 mb-4">
              <Search className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-sm font-medium">
              {checking ? "正在扫描应用..." : "没有找到符合条件的应用"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-12">
            {filteredPackages.map((item) => {
              const isInstalled = installedMap[item.package];
              const isSelected = selectedPackages.has(item.package);

              return (
                <DebloatAppItem
                  key={item.package}
                  item={item}
                  isInstalled={isInstalled}
                  isSelected={isSelected}
                  onToggle={() => handleSelect(item.package, !isSelected)}
                />
              );
            })}
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmMessage.title}
        description={
          <span className="whitespace-pre-wrap">
            {confirmMessage.description}
          </span>
        }
        onConfirm={confirmAction}
        confirmText="确定禁用"
        cancelText="取消"
        variant="destructive"
      />
    </div>
  );
}
