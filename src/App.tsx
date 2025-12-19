import { useState, useEffect } from "react";
import "./App.css";
import {
  initPlatformTools,
  isPlatformToolsReady,
  getAdbVersion,
  getDevices,
  executeAdbCommand,
  type Device,
} from "./lib/adb";

function App() {
  const [initializing, setInitializing] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [adbVersion, setAdbVersion] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [commandInput, setCommandInput] = useState("");
  const [commandOutput, setCommandOutput] = useState("");

  // 初始化 platform-tools
  useEffect(() => {
    async function init() {
      try {
        // 检查是否已安装
        const isReady = await isPlatformToolsReady();

        if (!isReady) {
          console.log("Platform-tools not found, initializing...");
          await initPlatformTools();
        }

        // 获取 ADB 版本
        const version = await getAdbVersion();
        setAdbVersion(version);
        setReady(true);
      } catch (err) {
        setError(`初始化失败: ${err}`);
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
      setError("");
    } catch (err) {
      setError(`获取设备列表失败: ${err}`);
    }
  };

  // 执行自定义命令
  const executeCommand = async () => {
    if (!commandInput.trim()) return;

    try {
      const args = commandInput.trim().split(/\s+/);
      const output = await executeAdbCommand(args);
      setCommandOutput(output);
      setError("");
    } catch (err) {
      setError(`命令执行失败: ${err}`);
    }
  };

  // 初始化中
  if (initializing) {
    return (
      <main className="container">
        <h1>🚀 正在初始化 ADB 工具...</h1>
        <p>首次启动需要解压 platform-tools，请稍候...</p>
      </main>
    );
  }

  // 初始化失败
  if (!ready) {
    return (
      <main className="container">
        <h1>❌ 初始化失败</h1>
        <p style={{ color: "red" }}>{error}</p>
      </main>
    );
  }

  // 主界面
  return (
    <main className="container">
      <h1>📱 Sinodroid Pure - ADB 工具</h1>

      {/* ADB 版本信息 */}
      <section>
        <h2>ADB 版本</h2>
        <pre style={{ background: "#f5f5f5", padding: "10px", borderRadius: "5px" }}>
          {adbVersion}
        </pre>
      </section>

      {/* 设备列表 */}
      <section>
        <h2>已连接设备</h2>
        <button onClick={refreshDevices}>🔄 刷新设备列表</button>
        {devices.length === 0 ? (
          <p>未发现设备</p>
        ) : (
          <ul style={{ textAlign: "left" }}>
            {devices.map((device) => (
              <li key={device.id}>
                <strong>{device.id}</strong> - {device.status}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 自定义命令 */}
      <section>
        <h2>执行 ADB 命令</h2>
        <div className="row">
          <input
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="例如: devices 或 shell ls"
            style={{ flex: 1 }}
          />
          <button onClick={executeCommand}>执行</button>
        </div>
        {commandOutput && (
          <pre style={{ background: "#f5f5f5", padding: "10px", borderRadius: "5px", textAlign: "left" }}>
            {commandOutput}
          </pre>
        )}
      </section>

      {/* 错误提示 */}
      {error && (
        <p style={{ color: "red", marginTop: "20px" }}>{error}</p>
      )}
    </main>
  );
}

export default App;

