import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// 读取 package.json (npm 刚刚更新过的版本)
const packagePath = resolve(process.cwd(), "package.json");
const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
const newVersion = packageJson.version;

// 读取 tauri.conf.json
const tauriConfigPath = resolve(process.cwd(), "src-tauri", "tauri.conf.json");
const tauriConfig = JSON.parse(readFileSync(tauriConfigPath, "utf-8"));

// 只有当版本号不同才更新，避免不必要的 IO
if (tauriConfig.version !== newVersion) {
  console.log(`🚀 Syncing Tauri version to ${newVersion}...`);
  tauriConfig.version = newVersion;
  writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2) + "\n");
  console.log("✅ Tauri version updated.");
} else {
  console.log("✨ Versions already match.");
}
