import { Ban, Check } from "lucide-react";
import AppIcon from "@/components/AppIcon";
import { ScannedApp } from "./types";

interface DebloatAppItemProps {
  item: ScannedApp;
  isInstalled: boolean;
  isSelected: boolean;
  onToggle: () => void;
}

export function DebloatAppItem({
  item,
  isInstalled,
  isSelected,
  onToggle,
}: DebloatAppItemProps) {
  return (
    <div
      onClick={onToggle}
      className={`
          group relative flex items-center gap-4 p-3.5 rounded-xl border cursor-pointer select-none
          transition-all duration-300 ease-out
          hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]
          ${
            isSelected
              ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/50 shadow-[0_0_0_1px_rgba(var(--primary),0.2)]"
              : "bg-card/50 hover:bg-card border-border/40 hover:border-primary/20"
          }
      `}
    >
      {/* 图标容器 + 选中状态角标 */}
      <div className="relative shrink-0">
        <div
          className={`
            rounded-xl overflow-hidden transition-all duration-300 w-12 h-12 flex items-center justify-center
            ring-1 ring-inset ring-black/5 dark:ring-white/10
            ${
              !isInstalled
                ? "grayscale contrast-75 opacity-50 bg-muted/50"
                : "bg-background shadow-sm group-hover:shadow-md"
            }
          `}
        >
          <AppIcon package={item.package} size={48} />
        </div>

        {/* 选中时的角标 (Animated) */}
        <div
          className={`
            absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full 
            bg-primary text-primary-foreground 
            flex items-center justify-center 
            shadow-[0_2px_8px_rgba(0,0,0,0.2)] ring-2 ring-background 
            transition-all duration-300 z-10 
            ${
              isSelected
                ? "scale-100 opacity-100 rotate-0"
                : "scale-50 opacity-0 -rotate-45"
            }
          `}
        >
          <Check className="w-3 h-3 drop-shadow-sm" strokeWidth={3.5} />
        </div>
      </div>

      {/* 信息列 */}
      <div
        className={`flex flex-col min-w-0 flex-1 gap-0.5 transition-opacity duration-300 ${
          !isInstalled ? "opacity-50" : ""
        }`}
      >
        {/* 标题 */}
        <span className="text-[15px] font-semibold text-foreground/90 group-hover:text-foreground transition-colors truncate leading-tight tracking-tight">
          {item.name}
        </span>

        {/* 包名 - 极客风 */}
        <span className="text-[11px] text-muted-foreground/70 font-mono truncate tracking-tight group-hover:text-primary/80 transition-colors">
          {item.package}
        </span>

        {/* 描述 */}
        {item.desc && (
          <p className="text-[11px] text-muted-foreground/50 line-clamp-1 leading-relaxed">
            {item.desc}
          </p>
        )}
      </div>

      {/* 已禁用状态指示 (更优雅的水印) */}
      {!isInstalled && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none grayscale transition-opacity group-hover:opacity-10">
          <Ban className="w-12 h-12" />
        </div>
      )}
    </div>
  );
}
