export function ErrorScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">初始化失败</h2>
          <p className="text-muted-foreground">请检查 ADB 环境配置</p>
        </div>
      </div>
    </div>
  );
}
