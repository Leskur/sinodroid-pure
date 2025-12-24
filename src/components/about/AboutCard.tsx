import { useEffect, useState } from "react";
import { Github, Zap, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openUrl } from "@tauri-apps/plugin-opener";
import { getVersion } from "@tauri-apps/api/app";

export function AboutCard() {
  const [appVersion, setAppVersion] = useState("");

  useEffect(() => {
    getVersion().then((v) => setAppVersion(v));
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-background/50 relative overflow-hidden">
      {/* 背景装饰光 (Glacial Ice) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center -mt-10 z-10 animate-in fade-in zoom-in-95 duration-700">
        {/* Logo 区域 */}
        <div className="relative group">
          <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full group-hover:bg-cyan-500/30 transition-all duration-1000 opacity-60" />
          <div className="relative w-32 h-32 bg-gradient-to-br from-background via-cyan-500/5 to-muted/80 rounded-[2.5rem] border border-cyan-500/20 shadow-2xl flex items-center justify-center transform transition-transform duration-500 hover:scale-[1.02] hover:-rotate-1">
            <svg
              className="w-16 h-16 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <defs>
                <linearGradient
                  id="about-logo-glacial"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
              <path
                stroke="url(#about-logo-glacial)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
              />
            </svg>
          </div>
        </div>

        {/* 标题 & 版本 */}
        <div className="mt-8 text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="text-foreground">SinoDroid</span>{" "}
            <span className="font-light text-sky-500">Pure</span>
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
            <span className="text-xs font-mono font-medium text-muted-foreground">
              v{appVersion || "0.0.0"}
            </span>
          </div>
        </div>

        {/* 特性展示 */}
        <div className="grid grid-cols-3 gap-6 mt-12 w-full max-w-lg px-4">
          <FeatureItem icon={Zap} title="极致精简" desc="Remove Bloatware" />
          <FeatureItem icon={Shield} title="隐私保护" desc="Enhanced Privacy" />
          <FeatureItem icon={Smartphone} title="设备掌控" desc="Full Control" />
        </div>

        {/* 按钮组 */}
        <div className="flex items-center gap-4 mt-12">
          <Button
            className="gap-2 rounded-full px-8 h-10 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-95"
            onClick={() => openUrl("https://github.com/Leskur/sinodroid-pure")}
          >
            <Github className="w-4 h-4" />
            GitHub
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-full px-8 h-10 border-foreground/10 hover:bg-muted/50 transition-all active:scale-95"
            onClick={() =>
              openUrl("https://github.com/Leskur/sinodroid-pure/issues")
            }
          >
            反馈问题
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center space-y-1.5">
        <p className="text-[10px] text-muted-foreground/30 font-medium tracking-widest uppercase">
          Designed for Perfectionists
        </p>
        <p className="text-[10px] text-muted-foreground/20 font-mono">
          © {new Date().getFullYear()} Leskur · Open Source
        </p>
      </div>
    </div>
  );
}

function FeatureItem({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-2 group cursor-default">
      <div className="p-3 rounded-2xl bg-muted/30 border border-transparent group-hover:border-primary/10 group-hover:bg-primary/5 transition-all duration-300">
        <Icon className="w-5 h-5 text-muted-foreground/70 group-hover:text-primary transition-colors" />
      </div>
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
          {title}
        </h3>
        <p className="text-[10px] text-muted-foreground/50">{desc}</p>
      </div>
    </div>
  );
}
