import { Github, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AboutCard() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto h-full justify-center items-center -mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 duration-300">
          <Info className="w-10 h-10 text-white" />
        </div>

        {/* Title & Version */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
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
          <a
            href="https://github.com/Leskur/sinodroid-pure"
            target="_blank"
            rel="noreferrer"
          >
            <Button className="gap-2 rounded-full px-6" variant="outline">
              <Github className="w-4 h-4" />
              GitHub
            </Button>
          </a>
          <Button
            variant="ghost"
            className="gap-2 rounded-full px-6"
            onClick={() =>
              window.open(
                "https://github.com/Leskur/sinodroid-pure/issues",
                "_blank"
              )
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
