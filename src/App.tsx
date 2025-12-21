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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  RefreshCw,
  Smartphone,
  Box,
  Eraser,
  Zap,
  Home,
  RotateCcw,
  RotateCw,
  Camera,
  Copy,
  Trash2,
  Play,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2
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

const OPTIMIZE_SETTINGS = [
  { name: "关闭动画", desc: "提升流畅度", commands: ["shell settings put global window_animation_scale 0", "shell settings put global transition_animation_scale 0", "shell settings put global animator_duration_scale 0"] },
  { name: "开启USB调试", desc: "启用开发者选项", commands: ["shell settings put global adb_enabled 1"] },
  { name: "关闭自动更新", desc: "阻止系统自动更新", commands: ["shell settings put global system_auto_update 0"] },
];

type TabType = "device" | "apps" | "debloat" | "optimize";

function App() {
  const [initializing, setInitializing] = useState(true);
  const [ready, setReady] = useState(false);
  const [adbVersion, setAdbVersion] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("device");

  // 应用管理
  const [appList, setAppList] = useState<string[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appSearch, setAppSearch] = useState("");

  // 去广告/优化
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

  // 获取应用列表
  const fetchApps = async () => {
    if (!selectedDevice) {
      toast.error("请先选择设备");
      return;
    }
    setLoadingApps(true);
    try {
      const output = await executeAdbCommand([ "-s", selectedDevice, "shell", "pm", "list", "packages", "-3" ]);
      const packages = output.split("\n")
        .filter(line => line.startsWith("package:"))
        .map(line => line.replace("package:", "").trim());
      setAppList(packages);
      toast.success("应用列表加载完成", { description: `共 ${packages.length} 个应用` });
    } catch (err) {
      toast.error("获取应用列表失败", { description: String(err) });
    } finally {
      setLoadingApps(false);
    }
  };

  // 卸载应用
  const uninstallApp = async (pkg: string) => {
    if (!selectedDevice) return;
    try {
      await executeAdbCommand([ "-s", selectedDevice, "shell", "pm", "uninstall", "--user", "0", pkg ]);
      setOperationLog(prev => [...prev, `✅ 已卸载: ${pkg}`]);
      toast.success("卸载成功", { description: pkg });
      fetchApps(); // 刷新列表
    } catch (err) {
      setOperationLog(prev => [...prev, `❌ 卸载失败 ${pkg}: ${String(err)}`]);
      toast.error("卸载失败", { description: `${pkg}: ${String(err)}` });
    }
  };

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

  // 执行优化命令
  const executeOptimize = async (item: (typeof OPTIMIZE_SETTINGS)[0]) => {
    if (!selectedDevice) {
      toast.error("请先选择设备");
      return;
    }
    setOperating(true);
    try {
      setOperationLog(prev => [...prev, `🔧 执行: ${item.name}`]);
      for (const cmd of item.commands) {
        const fullCmd = cmd.split(" ");
        await executeAdbCommand([ "-s", selectedDevice, ...fullCmd ]);
      }
      setOperationLog(prev => [...prev, `✅ 完成: ${item.name}`]);
      toast.success("优化完成", { description: item.name });
    } catch (err) {
      setOperationLog(prev => [...prev, `❌ 失败 ${item.name}: ${String(err)}`]);
      toast.error("优化失败", { description: `${item.name}: ${String(err)}` });
    } finally {
      setOperating(false);
    }
  };

  // 清空日志
  const clearLog = () => {
    setOperationLog([]);
    toast.info("日志已清空");
  };

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
          <TabsList className="grid w-full grid-cols-4 h-14">
            <TabsTrigger value="device" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              设备管理
            </TabsTrigger>
            <TabsTrigger value="apps" className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              应用管理
            </TabsTrigger>
            <TabsTrigger value="debloat" className="flex items-center gap-2">
              <Eraser className="w-4 h-4" />
              去广告
            </TabsTrigger>
            <TabsTrigger value="optimize" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              系统优化
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
                  <Button
                    onClick={refreshDevices}
                    className="w-full"
                    variant="secondary"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    刷新设备
                  </Button>
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
                  <CardTitle className="text-lg">当前设备</CardTitle>
                  <CardDescription>快速操作和设备信息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedDevice ? (
                    <>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <code className="text-sm font-mono">{selectedDevice}</code>
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

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => executeAdbCommand([ "-s", selectedDevice, "shell", "reboot" ])}
                          disabled={operating}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          重启设备
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => executeAdbCommand([ "-s", selectedDevice, "shell", "reboot", "recovery" ])}
                          disabled={operating}
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Recovery
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => executeAdbCommand([ "-s", selectedDevice, "shell", "input", "keyevent", "KEYCODE_HOME" ])}
                          disabled={operating}
                        >
                          <Home className="w-4 h-4 mr-2" />
                          回到主页
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={async () => {
                            if (!selectedDevice) return;
                            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                            try {
                              await executeAdbCommand([ "-s", selectedDevice, "exec-out", "screencap", "-p", `> /sdcard/screenshot-${timestamp}.png` ]);
                              setOperationLog([...operationLog, `📸 截图已保存: screenshot-${timestamp}.png`]);
                              toast.success("截图成功", { description: `screenshot-${timestamp}.png` });
                            } catch (err) {
                              setOperationLog([...operationLog, `❌ 截图失败: ${String(err)}`]);
                              toast.error("截图失败");
                            }
                          }}
                          disabled={operating}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          截图
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <label className="text-sm font-medium">任意 ADB 命令</label>
                        <Input
                          placeholder="输入命令 (如: shell ls /sdcard)"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              if (input.value.trim()) {
                                executeAdbCommand(input.value.trim().split(/\s+/))
                                  .then(output => {
                                    setOperationLog([...operationLog, `> ${input.value}`, output]);
                                    toast.success("命令执行成功");
                                    input.value = "";
                                  })
                                  .catch(err => {
                                    setOperationLog([...operationLog, `❌ 错误: ${String(err)}`]);
                                    toast.error("命令执行失败");
                                  });
                              }
                            }
                          }}
                          disabled={operating}
                        />
                        <p className="text-xs text-muted-foreground">按 Enter 执行，Shift+Enter 换行</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      请先选择设备
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 应用管理 */}
          <TabsContent value="apps">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Box className="w-5 h-5" />
                      已安装应用
                    </CardTitle>
                    <CardDescription>查看和管理设备上的应用</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="搜索应用..."
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      disabled={appList.length === 0}
                      className="w-48"
                    />
                    <Button onClick={fetchApps} disabled={!selectedDevice || loadingApps}>
                      {loadingApps ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span className="ml-2">{loadingApps ? "加载中..." : "刷新"}</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {appList.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {selectedDevice ? "点击刷新按钮加载应用列表" : "请先选择设备"}
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] rounded-md border">
                    <div className="p-2 space-y-2">
                      {appList
                        .filter(pkg => pkg.toLowerCase().includes(appSearch.toLowerCase()))
                        .map((pkg) => (
                          <div key={pkg} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <AppIcon package={pkg} size={32} />
                              <code className="text-xs font-mono truncate">{pkg}</code>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => uninstallApp(pkg)}
                              disabled={operating}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
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

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">操作日志</h3>
                    <Button size="sm" variant="ghost" onClick={clearLog}>
                      清空
                    </Button>
                  </div>
                  <ScrollArea className="h-48 rounded-md border bg-muted/30 p-3">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* 系统优化 */}
          <TabsContent value="optimize">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  系统优化设置
                </CardTitle>
                <CardDescription>一键优化系统设置，提升流畅度</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {OPTIMIZE_SETTINGS.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.desc}</div>
                      </div>
                      <Button
                        onClick={() => executeOptimize(item)}
                        disabled={!selectedDevice || operating}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        执行
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">操作日志</h3>
                    <Button size="sm" variant="ghost" onClick={clearLog}>
                      清空
                    </Button>
                  </div>
                  <ScrollArea className="h-48 rounded-md border bg-muted/30 p-3">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Toast 提示 */}
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
