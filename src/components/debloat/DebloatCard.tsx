import { useState, useEffect } from "react";
import { Trash2, Play, Loader2, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AppIcon from "@/components/AppIcon";
import type { DeviceInfo } from "@/components/device/DeviceInfoCard";

export interface BloatwarePackage {
  name: string;
  package: string;
  desc: string;
  brand: string;
}

interface DebloatCardProps {
  selectedDevice: string;
  operating: boolean;
  bloatwarePackages: BloatwarePackage[];
  addLog: (message: string) => void;
  setOperating: (value: boolean) => void;
  executeAdbCommand: (args: string[]) => Promise<string>;
  deviceInfo: DeviceInfo | null;
}

export function DebloatCard({
  selectedDevice,
  operating,
  bloatwarePackages,
  addLog,
  setOperating,
  executeAdbCommand,
  deviceInfo,
}: DebloatCardProps) {
  // 根据品牌过滤包（Redmi 归类为 Xiaomi）
  const normalizedBrand = deviceInfo?.brand?.toLowerCase() === 'redmi'
    ? 'xiaomi'
    : deviceInfo?.brand?.toLowerCase();

  const filteredPackages = normalizedBrand
    ? bloatwarePackages.filter(item =>
        item.brand.toLowerCase().includes(normalizedBrand)
      )
    : bloatwarePackages;

  // 获取检测到的品牌（显示原始品牌名称）
  const detectedBrand = deviceInfo?.brand || null;

  // 应用安装状态映射
  const [installedMap, setInstalledMap] = useState<Record<string, boolean>>({});
  const [checking, setChecking] = useState(false);

  // 检测所有应用的安装状态
  useEffect(() => {
    if (!selectedDevice || filteredPackages.length === 0) {
      setInstalledMap({});
      return;
    }

    setChecking(true);
    const checkAllApps = async () => {
      const newMap: Record<string, boolean> = {};
      for (const item of filteredPackages) {
        try {
          const output = await executeAdbCommand([ "-s", selectedDevice, "shell", "pm", "path", item.package ]);
          newMap[item.package] = output.includes(item.package);
        } catch {
          newMap[item.package] = false;
        }
      }
      setInstalledMap(newMap);
      setChecking(false);
    };

    checkAllApps();
  }, [selectedDevice, filteredPackages.length]);

  const batchDebloat = async () => {
    if (!selectedDevice) {
      toast.error("请先选择设备");
      return;
    }
    setOperating(true);

    // 使用过滤后的包列表
    const packagesToProcess = filteredPackages;

    if (packagesToProcess.length === 0) {
      toast.info("没有匹配的广告包", { description: detectedBrand ? `未找到 ${detectedBrand} 相关的广告包` : "请先连接设备" });
      setOperating(false);
      return;
    }

    toast.info("开始批量卸载", { description: `共 ${packagesToProcess.length} 个应用` });
    let failedCount = 0;
    try {
      for (const item of packagesToProcess) {
        addLog(`正在检查: ${item.name} (${item.package})`);
        try {
          // 先检查是否安装
          const checkOutput = await executeAdbCommand([ "-s", selectedDevice, "shell", "pm", "path", item.package ]);
          if (checkOutput.includes(item.package)) {
            await executeAdbCommand([ "-s", selectedDevice, "shell", "pm", "uninstall", "--user", "0", item.package ]);
            addLog(`✅ 已卸载: ${item.name}`);
            // 更新状态为已卸载
            setInstalledMap(prev => ({ ...prev, [item.package]: false }));
          } else {
            addLog(`ℹ️ 未安装: ${item.name}`);
          }
        } catch (err) {
          failedCount++;
          addLog(`❌ 失败 ${item.name}: ${String(err)}`);
        }
      }
      if (failedCount > 0) {
        addLog(`⚠️ 批量卸载完成，${failedCount} 个应用卸载失败`);
        toast.warning("批量卸载完成", { description: `${failedCount} 个应用卸载失败` });
      } else {
        addLog(`🎉 批量卸载完成！`);
        toast.success("批量卸载完成");
      }
    } finally {
      setOperating(false);
    }
  };

  // 单个应用卸载/恢复
  const handleAppAction = async (item: BloatwarePackage, isInstalled: boolean) => {
    if (!selectedDevice) return;

    setOperating(true);
    try {
      if (isInstalled) {
        // 卸载
        await executeAdbCommand([ "-s", selectedDevice, "shell", "pm", "uninstall", "--user", "0", item.package ]);
        addLog(`✅ 已卸载: ${item.name}`);
        toast.success("卸载成功", { description: item.name });
        setInstalledMap(prev => ({ ...prev, [item.package]: false }));
      } else {
        // 恢复
        await executeAdbCommand([ "-s", selectedDevice, "shell", "pm", "install-existing", "--user", "0", item.package ]);
        addLog(`✅ 已恢复: ${item.name}`);
        toast.success("恢复成功", { description: item.name });
        setInstalledMap(prev => ({ ...prev, [item.package]: true }));
      }
    } catch (err) {
      const errorMsg = String(err);
      const action = isInstalled ? "卸载" : "恢复";
      addLog(`❌ ${action}失败 ${item.name}: ${errorMsg}`);
      toast.error(`${action}失败`, { description: `${item.name}: ${errorMsg}` });
    } finally {
      setOperating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold">卸载预装</span>
              {detectedBrand && (
                <span className="text-xs text-muted-foreground">
                  检测到 {detectedBrand}，共 {filteredPackages.length} 个应用
                  {checking && <span className="ml-2 text-primary">检测中...</span>}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={batchDebloat}
            disabled={!selectedDevice || operating}
            size="sm"
            className="h-7 px-3"
          >
            {operating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span className="ml-1.5 text-xs">{operating ? "执行中" : "一键卸载"}</span>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredPackages.map((item) => {
              const isInstalled = installedMap[item.package];
              return (
                <div key={item.package} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <AppIcon package={item.package} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {item.name}
                        {isInstalled !== undefined && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            isInstalled
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {isInstalled ? '已安装' : '已卸载'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{item.package}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isInstalled ? "destructive" : "default"}
                    onClick={() => handleAppAction(item, isInstalled)}
                    disabled={!selectedDevice || operating || isInstalled === undefined}
                    className="h-7 px-2"
                  >
                    {isInstalled ? (
                      <>
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        卸载
                      </>
                    ) : (
                      <>
                        <RotateCw className="w-3.5 h-3.5 mr-1" />
                        恢复
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
