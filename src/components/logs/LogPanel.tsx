import { useState, useEffect, useRef } from "react";
import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface LogPanelProps {
  operationLog: string[];
  clearLog: () => void;
}

export function LogPanel({ operationLog, clearLog }: LogPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastLogCountRef = useRef(0);

  // 自动滚动到最新日志
  useEffect(() => {
    if (operationLog.length > lastLogCountRef.current && scrollRef.current) {
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
    if (searchTerm && !log.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  // 解析日志
  const parseLog = (log: string) => {
    const match = log.match(/^\[(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\]\s+(.*)$/);
    const timestamp = match ? match[1] : '';
    const message = match ? match[2] : log;

    let type: "success" | "error" | "warning" | "info" = "info";
    if (message.includes("✅") || message.includes("🎉")) type = "success";
    else if (message.includes("❌")) type = "error";
    else if (message.includes("⚠️") || message.includes("ℹ️")) type = "warning";

    return { timestamp, message, type };
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            系统记录
          </CardTitle>
          <div className="flex items-center gap-2">
            {operationLog.length > 0 && (
              <Button
                size="sm"
                variant="destructive"
                onClick={clearLog}
                className="h-7 px-2"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                清空
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* 搜索栏 */}
          {operationLog.length > 0 && (
            <div className="px-4 pb-3">
              <Input
                placeholder="搜索记录..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          )}

          {/* 日志内容 */}
          <ScrollArea
            ref={scrollRef}
            className="h-[calc(100vh-320px)] font-mono text-xs"
          >
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <FileText className="w-10 h-10 mb-2 opacity-30" />
                <div className="text-sm">
                  {operationLog.length === 0 ? "暂无记录" : "没有匹配的记录"}
                </div>
              </div>
            ) : (
              <div className="py-2">
                {filteredLogs.map((log, idx) => {
                  const { timestamp, message, type } = parseLog(log);
                  const typeStyles = {
                    success: "text-green-600 dark:text-green-400",
                    error: "text-red-600 dark:text-red-400",
                    warning: "text-yellow-600 dark:text-yellow-400",
                    info: "text-foreground",
                  };

                  return (
                    <div
                      key={idx}
                      className="px-4 py-1.5 hover:bg-muted/50 transition-colors flex gap-3"
                    >
                      <span className="text-muted-foreground/60 shrink-0 w-[120px]">
                        {timestamp}
                      </span>
                      <span className={`flex-1 whitespace-pre-wrap break-all ${typeStyles[type]}`}>
                        {message}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
