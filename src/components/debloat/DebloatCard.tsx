import { Eraser, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppIcon from "@/components/AppIcon";

export interface BloatwarePackage {
  name: string;
  package: string;
  desc: string;
}

interface DebloatCardProps {
  selectedDevice: string;
  operating: boolean;
  bloatwarePackages: BloatwarePackage[];
  operationLog: string[];
  setOperationLog: (log: string[]) => void;
  setOperating: (value: boolean) => void;
  executeAdbCommand: (args: string[]) => Promise<string>;
}

export function DebloatCard({
  selectedDevice,
  operating,
  bloatwarePackages,
  operationLog,
  setOperationLog,
  setOperating,
  executeAdbCommand,
}: DebloatCardProps) {
  const batchDebloat = async () => {
    if (!selectedDevice) {
      toast.error("请先选择设备");
      return;
    }
    setOperating(true);
    toast.info("开始批量去广告", { description: "正在处理..." });
    try {
      for (const item of bloatwarePackages) {
        setOperationLog([...operationLog, `正在检查: ${item.name} (${item.package})`]);
        try {
          // 先检查是否安装
          const checkOutput = await executeAdbCommand([ "-s", selectedDevice, "shell", "pm", "path", item.package ]);
          if (checkOutput.includes(item.package)) {
            await executeAdbCommand([ "-s", selectedDevice, "shell", "pm", "uninstall", "--user", "0", item.package ]);
            setOperationLog([...operationLog, `✅ 已卸载: ${item.name}`]);
          } else {
            setOperationLog([...operationLog, `ℹ️ 未安装: ${item.name}`]);
          }
        } catch (err) {
          setOperationLog([...operationLog, `⚠️ 跳过 ${item.name}: ${String(err)}`]);
        }
      }
      setOperationLog([...operationLog, `🎉 批量去广告完成！`]);
      toast.success("批量去广告完成");
    } finally {
      setOperating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
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
            {bloatwarePackages.map((item) => (
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
                  className="cursor-pointer"
                >
                  卸载
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
