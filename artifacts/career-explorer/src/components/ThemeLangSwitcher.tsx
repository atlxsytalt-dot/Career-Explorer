import { useState } from "react";
import { useApp, type Theme } from "@/context/AppContext";
import { Palette, X } from "lucide-react";

const themes: { id: Theme; label: string; color: string; glow: string }[] = [
  { id: "red",   label: "Red",   color: "#ff2244", glow: "0 0 12px #ff224480" },
  { id: "green", label: "Green", color: "#00ff88", glow: "0 0 12px #00ff8880" },
  { id: "blue",  label: "Blue",  color: "#4488ff", glow: "0 0 12px #4488ff80" },
  { id: "cyan",  label: "Cyan",  color: "#00eeff", glow: "0 0 12px #00eeff80" },
];

export function ThemeLangSwitcher() {
  const { theme, setTheme, lang, setLang, t } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2">
      {open && (
        <div
          className="glass border border-border rounded-2xl p-4 shadow-2xl flex flex-col gap-4 w-52"
          style={{ animation: "fadeInUp 0.15s ease" }}
        >
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">{t("themePicker")}</p>
            <div className="flex gap-2">
              {themes.map(th => (
                <button
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  title={th.label}
                  className="w-9 h-9 rounded-full transition-transform hover:scale-110 active:scale-95 border-2"
                  style={{
                    background: th.color,
                    boxShadow: theme === th.id ? th.glow : "none",
                    borderColor: theme === th.id ? th.color : "transparent",
                    outline: theme === th.id ? `2px solid ${th.color}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">{t("langPicker")}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setLang("en")}
                className={`flex-1 h-9 rounded-xl text-sm font-black border-2 transition-all ${lang === "en" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("ar")}
                className={`flex-1 h-9 rounded-xl text-sm font-black border-2 transition-all ${lang === "ar" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
              >
                عربي
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 border-2 border-primary/60"
        style={{
          background: "hsl(var(--background))",
          boxShadow: "0 0 16px hsl(var(--primary) / 0.4)",
        }}
        aria-label="Theme & Language"
      >
        {open
          ? <X className="w-5 h-5 text-primary" />
          : <Palette className="w-5 h-5 text-primary" />
        }
      </button>
    </div>
  );
}
