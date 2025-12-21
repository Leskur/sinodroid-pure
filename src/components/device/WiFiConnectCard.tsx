import { Wifi, Plus, Trash2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export function WiFiConnectCard({ executeAdbCommand, refreshDevices }: WiFiConnectCardProps) {
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("5555");
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

    setConnecting(true);
    try {
      // 执行 ADB WiFi 连接命令
      const address = `${ip}:${port}`;
      const result = await executeAdbCommand(["connect", address]);

      // 检查连接是否真正成功
      // ADB connect 成功通常返回 "connected to <address>"
      // 失败则返回 "unable to connect" 或 "cannot connect"
      const isSuccess = result.toLowerCase().includes("connected") && !result.toLowerCase().includes("unable") && !result.toLowerCase().includes("cannot");

      if (isSuccess) {
        // 连接成功后才添加到历史记录（保持最近 5 条）
        const newHistory: WiFiHistory[] = [
          { ip, port, timestamp: Date.now() },
          ...history.filter(h => !(h.ip === ip && h.port === port))
        ].slice(0, 5);

        saveHistory(newHistory);

        toast.success("WiFi 连接成功", { description: address });

        // 刷新设备列表
        setTimeout(() => refreshDevices(), 500);

        // 清空输入
        setIp("");
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              WiFi 设备连接
            </CardTitle>
            <CardDescription>通过 IP 地址连接 WiFi 调试设备</CardDescription>
          </div>
          {history.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearHistory}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              清空历史
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 连接表单 */}
        <div className="flex gap-2">
          <Input
            placeholder="IP 地址 (如: 192.168.1.100)"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            disabled={connecting}
            className="flex-1"
          />
          <Input
            placeholder="端口"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            disabled={connecting}
            className="w-24"
          />
          <Button
            onClick={connectWiFi}
            disabled={connecting || !ip}
            className="min-w-[80px]"
          >
            {connecting ? "连接中..." : "连接"}
          </Button>
        </div>

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <History className="w-4 h-4" />
              最近连接 ({history.length}/5)
            </div>
            <div className="space-y-1">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => fillFromHistory(item)}
                    className="flex-1 justify-start font-mono text-xs h-8 cursor-pointer"
                  >
                    {item.ip}:{item.port}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeHistoryItem(index)}
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
