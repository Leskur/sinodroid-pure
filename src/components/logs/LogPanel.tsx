import { useState, useEffect, useRef } from "react";
import { FileText, Trash2, Search, Download, Terminal, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface LogPanelProps {
  operationLog: string[];
  clearLog: () => void;
}

export function LogPanel({ operationLog, clearLog }: LogPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "success" | "error" | "warning">("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastLogCountRef = useRef(0);

  // 自动滚动到最新日志
  useEffect(() => {
    if (operationLog.length > lastLogCountRef.current && scrollRef.current) {
      // 短延迟确保 DOM 已更新
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
    }
    lastLogCountRef.current = operationLog.length;
  }, [operationLog]);

  // 过滤日志
  const filteredLogs = operationLog.filter((log) => {
    // 搜索过滤
    if (searchTerm && !log.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // 类型过滤
    if (filterType === "success") return log.includes("✅") || log.includes("🎉");
    if (filterType === "error") return log.includes("❌");
    if (filterType === "warning") return log.includes("⚠️") || log.includes("ℹ️");

    return true;
  });

  // 导出日志
  const exportLog = () => {
    if (operationLog.length === 0) {
      toast.warning("没有日志可导出");
      return;
    }

    const content = operationLog.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sinodroid-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("日志已导出");
  };

  // 解析日志并获取类型
  const parseLog = (log: string) => {
    const match = log.match(/^\[(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\]\s+(.*)$/);
    const timestamp = match ? match[1] : '';
    const message = match ? match[2] : log;

    // 确定日志类型
    let type: "success" | "error" | "warning" | "info" = "info";
    if (message.includes("✅") || message.includes("🎉")) type = "success";
    else if (message.includes("❌")) type = "error";
    else if (message.includes("⚠️") || message.includes("ℹ️")) type = "warning";

    return { timestamp, message, type };
  };

  // 获取状态统计
  const stats = {
    total: operationLog.length,
    success: operationLog.filter(l => l.includes("✅") || l.includes("🎉")).length,
    error: operationLog.filter(l => l.includes("❌")).length,
    warning: operationLog.filter(l => l.includes("⚠️")).length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Card className="border-0 shadow-none bg-transparent">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold">日志</span>
              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                {operationLog.length} 条
              </span>
            </div>

            {/* 统计信息 */}
            {operationLog.length > 0 && (
              <div className="flex items-center gap-2 text-xs ml-4">
                <span className="text-green-600 dark:text-green-400">✓ {stats.success}</span>
                <span className="text-red-600 dark:text-red-400">✗ {stats.error}</span>
                <span className="text-yellow-600 dark:text-yellow-400">! {stats.warning}</span>
              </div>
            )}
          </div>

          {/* 工具按钮 */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={exportLog}
              disabled={operationLog.length === 0}
              className="cursor-pointer"
            >
              <Download className="w-4 h-4 mr-1" />
              导出
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={clearLog}
              disabled={operationLog.length === 0}
              className="cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              清空
            </Button>
          </div>
        </div>

        {/* 搜索和过滤 */}
        {operationLog.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索日志..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <div className="flex gap-1">
              {[
                { value: "all", label: "全部", icon: Filter },
                { value: "success", label: "成功", color: "text-green-600" },
                { value: "error", label: "错误", color: "text-red-600" },
                { value: "warning", label: "警告", color: "text-yellow-600" },
              ].map((item) => (
                <Button
                  key={item.value}
                  size="sm"
                  variant={filterType === item.value ? "default" : "ghost"}
                  onClick={() => setFilterType(item.value as any)}
                  className={`h-8 px-3 text-xs ${filterType === item.value ? "" : item.color || ""}`}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 日志内容 */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <ScrollArea
            ref={scrollRef}
            className="h-[calc(100vh-380px)] font-mono text-xs"
          >
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Terminal className="w-12 h-12 mb-3 opacity-30" />
                <div className="text-sm">
                  {operationLog.length === 0
                    ? "暂无日志"
                    : searchTerm || filterType !== "all"
                      ? "没有匹配的日志"
                      : "暂无日志"}
                </div>
              </div>
            ) : (
              <div className="py-2">
                {filteredLogs.map((log, idx) => {
                  const { timestamp, message, type } = parseLog(log);

                  // 根据类型设置样式
                  const typeStyles = {
                    success: "text-green-600 dark:text-green-400",
                    error: "text-red-600 dark:text-red-400",
                    warning: "text-yellow-600 dark:text-yellow-400",
                    info: "text-blue-600 dark:text-blue-400",
                  };

                  return (
                    <div
                      key={idx}
                      className="px-4 py-1.5 hover:bg-muted/30 transition-colors flex gap-3 items-start group"
                    >
                      {/* 时间戳 */}
                      <span className="text-muted-foreground/60 shrink-0 w-[140px]">
                        {timestamp}
                      </span>

                      {/* 消息内容 */}
                      <span className={`flex-1 whitespace-pre-wrap break-all ${typeStyles[type]}`}>
                        {message}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* 底部提示 */}
        {operationLog.length > 0 && (
          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              成功
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              失败
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              警告
            </span>
            <span className="ml-auto">自动滚动已启用</span>
          </div>
        )}
      </Card>
    </div>
  );
}
