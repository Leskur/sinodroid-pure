import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openUrl } from "@tauri-apps/plugin-opener";

export function AboutCard() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto h-full justify-center items-center -mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Logo */}
        <div className="w-24 h-24 bg-gradient-to-br from-background to-muted rounded-[2rem] border border-border/40 shadow-2xl flex items-center justify-center transform transition-transform hover:scale-105 duration-500">
          <svg
            className="w-10 h-10 drop-shadow-[0_0_15px_rgba(36,200,219,0.3)]"
            fill="none"
            stroke="url(#tauri-about-gradient)"
            viewBox="0 0 24 24"
          >
            <defs>
              <linearGradient
                id="tauri-about-gradient"
                x1="100%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FFC131" />
                <stop offset="100%" stopColor="#24C8DB" />
              </linearGradient>
            </defs>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>

        {/* Title & Version */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-b from-foreground to-muted-foreground/70 bg-clip-text text-transparent">
            Sinodroid Pure
          </h1>
          <p className="text-sm font-medium text-muted-foreground/80">
            v0.0.1 Beta
          </p>
        </div>

        {/* Description */}
        <p className="text-muted-foreground max-w-sm leading-relaxed">
          一个简洁、高效的 Android 设备管理工具。
          <br />
          旨在提供纯净的去臃肿与系统管理体验。
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            className="gap-2 rounded-full px-6"
            variant="outline"
            onClick={() => openUrl("https://github.com/Leskur/sinodroid-pure")}
          >
            <Github className="w-4 h-4" />
            GitHub
          </Button>
          <Button
            variant="ghost"
            className="gap-2 rounded-full px-6"
            onClick={() =>
              openUrl("https://github.com/Leskur/sinodroid-pure/issues")
            }
          >
            反馈问题
          </Button>
        </div>
      </div>

      {/* Footer info */}
      <div className="absolute bottom-8 text-center space-y-2">
        <p className="text-xs text-muted-foreground/40">
          Built with Tauri + React + Shadcn UI
        </p>
        <p className="text-[10px] text-muted-foreground/30">
          © {new Date().getFullYear()} Leskur. All rights reserved.
        </p>
      </div>
    </div>
  );
}
