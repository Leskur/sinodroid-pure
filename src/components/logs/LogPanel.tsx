import { useState, useEffect, useRef } from "react";
import {
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  Search,
  Filter,
  Bug,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LogPanelProps {
  operationLog: string[];
  clearLog: () => void;
}

type LogType = "all" | "success" | "error" | "warning" | "info";

export function LogPanel({ operationLog, clearLog }: LogPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [logFilter, setLogFilter] = useState<LogType>("all");
  const lastLogCountRef = useRef(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 解析日志 - 使用更稳健的切片方式而不是正则
  const parseLog = (log: string) => {
    // 假设时间戳总是前19个字符: "YYYY-MM-DD HH:mm:ss"
    // 为了容错，先检查一下格式
    let timestamp = "";
    let message = log;
    let type: LogType = "info";

    // 简单的格式检查：第10位是空格或T，第13位是冒号...
    // 或者直接判断长度足够且开头是数字
    if (log.length > 19 && /^\d{4}/.test(log)) {
      timestamp = log.slice(0, 19);
      message = log.slice(20); // 跳过时间戳后的空格
    }

    // 类型推断
    if (
      message.includes("✅") ||
      message.includes("🎉") ||
      message.includes("成功")
    )
      type = "success";
    else if (
      message.includes("❌") ||
      message.includes("失败") ||
      message.includes("错误")
    )
      type = "error";
    else if (
      message.includes("⚠️") ||
      message.includes("ℹ️") ||
      message.includes("警告")
    )
      type = "warning";

    return { timestamp, message, type };
  };

  // 自动滚动到最新日志
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );

    if (operationLog.length > lastLogCountRef.current && scrollContainer) {
      setTimeout(() => {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
    lastLogCountRef.current = operationLog.length;
  }, [operationLog, logFilter, searchTerm]);

  // 过滤日志
  const filteredLogs = operationLog
    .map((log) => parseLog(log))
    .filter((log) => {
      // 文本搜索
      if (
        searchTerm &&
        !log.message.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      // 类型过滤
      if (logFilter !== "all" && log.type !== logFilter) {
        return false;
      }
      return true;
    });

  // 复制日志
  const handleCopyLogs = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] ${l.message}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success("日志已复制到剪贴板");
  };

  // 获取类型对应的图标
  const getTypeIcon = (type: LogType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 opacity-0" />; // 普通信息不显示图标，减少视觉噪音
    }
  };

  // 统计信息
  const counts = {
    all: operationLog.length,
    error: operationLog.filter((l) => l.includes("❌") || l.includes("失败"))
      .length,
    warning: operationLog.filter((l) => l.includes("⚠️") || l.includes("警告"))
      .length,
  };

  return (
    <div className="h-full flex flex-col bg-background/50">
      {/* 顶部统一工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0 gap-4">
        {/* 左侧：标题与基础筛选 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 pr-4 border-r mr-1">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none">
                系统记录
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                {operationLog.length > 0
                  ? `${operationLog.length} 条记录`
                  : "暂无记录"}
              </span>
            </div>
          </div>

          <Tabs
            value={logFilter}
            onValueChange={(v) => setLogFilter(v as LogType)}
          >
            <TabsList className="h-8 bg-muted/50 p-0.5">
              <TabsTrigger value="all" className="h-7 text-xs px-2.5">
                全部
              </TabsTrigger>
              <TabsTrigger
                value="success"
                className="h-7 text-xs px-2.5 gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                成功
              </TabsTrigger>
              <TabsTrigger
                value="warning"
                className="h-7 text-xs px-2.5 gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                警告
                {counts.warning > 0 && (
                  <span className="ml-0.5 text-[10px] opacity-70">
                    ({counts.warning})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="error" className="h-7 text-xs px-2.5 gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                错误
                {counts.error > 0 && (
                  <span className="ml-0.5 text-[10px] opacity-70">
                    ({counts.error})
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 右侧：工具区 */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/70 group-hover:text-primary transition-colors" />
            <Input
              placeholder="筛选日志..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-52 pl-9 bg-muted/30 border-muted-foreground/10 focus:bg-background transition-all text-sm"
            />
          </div>

          <div className="flex items-center bg-muted/30 rounded-md p-0.5 ml-2 border border-muted-foreground/10">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyLogs}
              className="h-8 w-8 p-0 hover:bg-background hover:shadow-sm transition-all"
              disabled={filteredLogs.length === 0}
              title="复制全部"
            >
              <Copy className="w-4 h-4 text-muted-foreground" />
            </Button>
            <div className="w-[1px] h-4 bg-border/50 mx-0.5" />
            <Button
              size="sm"
              variant="ghost"
              onClick={clearLog}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-all"
              disabled={operationLog.length === 0}
              title="清空记录"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* 日志内容区域 */}
      <div className="flex-1 overflow-hidden relative bg-white/50 dark:bg-slate-950/20">
        <ScrollArea ref={scrollAreaRef} className="h-full w-full">
          <div className="min-w-[600px] text-xs font-mono pb-4">
            {filteredLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-32 text-muted-foreground/40">
                {operationLog.length === 0 ? (
                  <>
                    <div className="p-4 rounded-full bg-muted/30 mb-4">
                      <Bug className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="font-sans">暂无系统记录</p>
                  </>
                ) : (
                  <>
                    <Filter className="w-10 h-10 mb-3 opacity-20" />
                    <p className="font-sans">未找到匹配的日志</p>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border/20 border-t border-border/20">
                {filteredLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-start px-6 py-2.5 hover:bg-muted/40 transition-colors group",
                      log.type === "error" &&
                        "bg-red-50/50 hover:bg-red-50/80 dark:bg-red-950/20 dark:hover:bg-red-950/30",
                      log.type === "warning" &&
                        "bg-amber-50/50 hover:bg-amber-50/80 dark:bg-amber-950/20 dark:hover:bg-amber-950/30",
                      log.type === "success" &&
                        "bg-green-50/30 hover:bg-green-50/60 dark:bg-green-950/10 dark:hover:bg-green-950/20"
                    )}
                  >
                    {/* 时间戳 */}
                    <div className="w-[150px] shrink-0 text-muted-foreground/50 select-all tabular-nums text-[11px] pt-0.5 font-medium">
                      {log.timestamp || "--:--:--"}
                    </div>

                    {/* 图标状态 */}
                    <div className="w-[36px] shrink-0 flex items-start pt-0.5">
                      {getTypeIcon(log.type)}
                    </div>

                    {/* 消息体 */}
                    <div
                      className={cn(
                        "flex-1 whitespace-pre-wrap break-all leading-relaxed select-text tracking-wide",
                        log.type === "error" &&
                          "text-red-700 dark:text-red-400 font-medium",
                        log.type === "warning" &&
                          "text-amber-700 dark:text-amber-400 font-medium",
                        log.type === "success" &&
                          "text-green-700 dark:text-green-400",
                        log.type === "info" && "text-foreground/80"
                      )}
                    >
                      {log.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
