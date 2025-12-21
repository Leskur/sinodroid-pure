export function LoadingScreen() {
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
