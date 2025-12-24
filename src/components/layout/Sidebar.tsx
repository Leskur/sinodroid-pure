import { Smartphone, Package, FileText, Info } from "lucide-react";

export type SidebarType = "device" | "debloat" | "log" | "about";

interface SidebarProps {
  activeSidebar: SidebarType;
  setActiveSidebar: (type: SidebarType) => void;
  disabled?: boolean;
}

export function Sidebar({
  activeSidebar,
  setActiveSidebar,
  disabled = false,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-card/30 backdrop-blur-xl border-r border-border/40 h-full flex flex-col justify-between transition-all duration-300">
      <div className="flex flex-col gap-6 p-4">
        {/* Logo Area */}
        <div
          className="flex items-center gap-3.5 px-2 py-2 select-none"
          data-tauri-drag-region
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-500 opacity-50" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-background via-muted/50 to-muted rounded-xl border border-white/10 shadow-lg flex items-center justify-center overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
              <svg
                className="w-5 h-5 drop-shadow-[0_0_10px_rgba(255,193,49,0.3)] transition-transform duration-500 group-hover:scale-110"
                fill="none"
                viewBox="0 0 24 24"
              >
                <defs>
                  <linearGradient
                    id="logo-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FFC131" />
                    <stop offset="100%" stopColor="#FB923C" />
                  </linearGradient>
                </defs>
                <path
                  stroke="url(#logo-gradient)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[17px] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground/70">
              Sinodroid
            </span>
            <span className="text-[10px] font-medium text-muted-foreground/60 tracking-[0.2em] uppercase ml-0.5">
              Ultimate Pure
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">
          <NavItem
            icon={Smartphone}
            label="设备管理"
            isActive={activeSidebar === "device"}
            onClick={() => setActiveSidebar("device")}
            disabled={disabled}
          />
          <NavItem
            icon={Package}
            label="内置应用"
            isActive={activeSidebar === "debloat"}
            onClick={() => setActiveSidebar("debloat")}
            disabled={disabled}
          />
          <NavItem
            icon={FileText}
            label="系统记录"
            isActive={activeSidebar === "log"}
            onClick={() => setActiveSidebar("log")}
          />
        </nav>
      </div>

      {/* Footer / About */}
      <div className="p-4 mb-2">
        <button
          onClick={() => setActiveSidebar("about")}
          className={`
            w-full group flex items-center justify-between p-3 rounded-xl transition-all duration-300 border border-transparent
            ${
              activeSidebar === "about"
                ? "bg-primary/5 border-primary/10"
                : "hover:bg-muted/50 hover:border-border/30"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div
              className={`
              p-2 rounded-lg transition-colors duration-300
              ${
                activeSidebar === "about"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground group-hover:text-foreground"
              }
            `}
            >
              <Info className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span
                className={`text-xs font-semibold transition-colors ${
                  activeSidebar === "about"
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                关于软件
              </span>
              <span className="text-[10px] text-muted-foreground/40 font-mono">
                v0.1.0 Beta
              </span>
            </div>
          </div>
          {activeSidebar === "about" && (
            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
          )}
        </button>
      </div>
    </aside>
  );
}

// ------------------------------------------------------------------
// Internal Components
// ------------------------------------------------------------------

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function NavItem({
  icon: Icon,
  label,
  isActive,
  onClick,
  disabled,
}: NavItemProps) {
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`
        relative group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 outline-none border
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${
          isActive
            ? "bg-primary/5 border-primary/10 text-primary shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            : "border-transparent text-muted-foreground/80 hover:text-foreground hover:bg-muted/50 hover:border-border/30"
        }
      `}
    >
      {/* Icon */}
      <Icon
        className={`
          w-5 h-5 transition-all duration-300 z-10
          ${
            isActive
              ? "drop-shadow-[0_0_6px_rgba(var(--primary),0.4)] scale-110"
              : "group-hover:scale-105"
          }
        `}
        strokeWidth={isActive ? 2.5 : 2}
      />

      {/* Label */}
      <span
        className={`text-sm font-medium tracking-wide z-10 ${
          isActive ? "font-semibold" : ""
        }`}
      >
        {label}
      </span>
    </button>
  );
}
