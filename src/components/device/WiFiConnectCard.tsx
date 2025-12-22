import { Wifi, Trash2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface WiFiConnectCardProps {
  executeAdbCommand: (args: string[]) => Promise<string>;
  refreshDevices: () => Promise<void>;
}

interface WiFiHistory {
  ip: string;
  port: string;
  timestamp: number;
}

export function WiFiConnectCard({
  executeAdbCommand,
  refreshDevices,
}: WiFiConnectCardProps) {
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [history, setHistory] = useState<WiFiHistory[]>([]);

  // 加载历史记录
  useEffect(() => {
    const saved = localStorage.getItem("wifiConnectionHistory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
      } catch (e) {
        console.error("Failed to parse WiFi history:", e);
      }
    }
  }, []);

  // 保存历史记录
  const saveHistory = (newHistory: WiFiHistory[]) => {
    setHistory(newHistory);
    localStorage.setItem("wifiConnectionHistory", JSON.stringify(newHistory));
  };

  // 连接 WiFi 设备
  const connectWiFi = async () => {
    if (!ip) {
      toast.error("请输入 IP 地址");
      return;
    }

    // 如果端口为空，使用默认端口 5555
    const portToUse = port || "5555";

    setConnecting(true);
    try {
      // 执行 ADB WiFi 连接命令
      const address = `${ip}:${portToUse}`;
      const result = await executeAdbCommand(["connect", address]);

      // 检查连接是否真正成功
      // ADB connect 成功通常返回 "connected to <address>"
      // 失败则返回 "unable to connect" 或 "cannot connect"
      const isSuccess =
        result.toLowerCase().includes("connected") &&
        !result.toLowerCase().includes("unable") &&
        !result.toLowerCase().includes("cannot");

      if (isSuccess) {
        // 连接成功后才添加到历史记录（保持最近 5 条）
        // 保存实际使用的端口（如果为空则保存 5555）
        const newHistory: WiFiHistory[] = [
          { ip, port: portToUse, timestamp: Date.now() },
          ...history.filter((h) => !(h.ip === ip && h.port === portToUse)),
        ].slice(0, 5);

        saveHistory(newHistory);

        toast.success("WiFi 连接成功", { description: address });

        // 刷新设备列表
        setTimeout(() => refreshDevices(), 500);

        // 清空输入
        setIp("");
        setPort("");
      } else {
        // 连接失败
        toast.error("WiFi 连接失败", { description: result || "连接失败" });
      }
    } catch (err) {
      toast.error("WiFi 连接失败", { description: String(err) });
    } finally {
      setConnecting(false);
    }
  };

  // 使用历史记录填充输入框
  const fillFromHistory = (item: WiFiHistory) => {
    setIp(item.ip);
    setPort(item.port);
  };

  // 清除历史记录
  const clearHistory = () => {
    saveHistory([]);
    toast.info("已清除连接历史");
  };

  // 删除单条历史记录
  const removeHistoryItem = (index: number) => {
    const newHistory = history.filter((_, i) => i !== index);
    saveHistory(newHistory);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 标题 */}
      <div className="flex items-center justify-between min-h-[42px]">
        <div className="flex items-center gap-2">
          <div className="bg-purple-500/10 p-2 rounded-lg text-purple-600 dark:text-purple-400">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-none">WiFi 连接</h3>
            <p className="text-xs text-muted-foreground mt-1">无线调试连接</p>
          </div>
        </div>

        {history.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearHistory}
            className="h-8 text-[10px] text-muted-foreground hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            清空历史
          </Button>
        )}
      </div>

      {/* 内容区域容器 */}
      <div className="rounded-xl border border-border/40 bg-card/30 p-4 space-y-4 h-full">
        {/* 连接表单 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="IP 地址 (如: 192.168.1.5)"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              disabled={connecting}
              className="bg-muted/50 focus-visible:bg-background border-muted-foreground/20 h-9"
            />
          </div>
          <div className="relative w-24">
            <Input
              placeholder="5555"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              disabled={connecting}
              className="bg-muted/50 focus-visible:bg-background border-muted-foreground/20 text-center h-9"
              title="端口号 (默认 5555)"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none opacity-50">
              PORT
            </div>
          </div>
          <Button
            onClick={connectWiFi}
            disabled={connecting || !ip}
            className={
              connecting ? "w-20" : "w-20 bg-purple-600 hover:bg-purple-700 h-9"
            }
          >
            {connecting ? "..." : "连接"}
          </Button>
        </div>

        {/* 历史记录 - 仅当有记录时显示，否则显示空状态占位保持高度一致性（可选，这里先只显示记录） */}
        {history.length > 0 ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                最近连接
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="group flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-background/50 hover:bg-muted/40 hover:border-border/60 transition-all cursor-pointer"
                  onClick={() => fillFromHistory(item)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/5 text-purple-600 group-hover:bg-purple-500/20 transition-colors">
                      <History className="w-3 pb-[1px]" />
                    </div>
                    <span className="text-xs font-mono truncate text-muted-foreground group-hover:text-foreground">
                      {item.ip}:{item.port || "5555"}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHistoryItem(index);
                    }}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/40 gap-2">
            <Wifi className="w-8 h-8 opacity-20" />
            <span className="text-xs">暂无历史记录</span>
          </div>
        )}
      </div>
    </div>
  );
}
