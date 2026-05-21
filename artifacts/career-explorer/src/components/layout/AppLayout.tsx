import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Compass, Trophy, User as UserIcon, Settings, LogOut, Map, X, Zap } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ThemeLangSwitcher } from "@/components/ThemeLangSwitcher";

const ADMIN_EMAIL = "002159@walesschool.com";

function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<{ id: number; message: string } | null>(null);
  const [dismissed, setDismissed] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/announcements/active")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.id) setAnnouncement(data); })
      .catch(() => {});
  }, []);

  if (!announcement || dismissed === announcement.id) return null;

  return (
    <div className="relative z-50 flex items-center gap-3 px-4 py-3 bg-primary/10 border-b border-primary/40 text-sm font-bold text-primary">
      <Zap className="w-4 h-4 shrink-0 neon-text" />
      <span className="flex-1 text-center">{announcement.message}</span>
      <button
        onClick={() => setDismissed(announcement.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function Navbar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [location] = useLocation();
  const { t } = useApp();

  const isAdmin = user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-border/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/explore" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
          <div className="w-10 h-10 bg-primary/20 border border-primary/40 rounded-xl flex items-center justify-center neon-border">
            <Compass className="w-6 h-6 text-primary" />
          </div>
          <span className="font-display font-bold text-xl hidden sm:inline-block text-foreground">
            Career <span className="text-primary">Explorer</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/explore">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-xl font-bold transition-all ${location === "/explore" ? "text-primary bg-primary/10 border border-primary/30" : "text-muted-foreground hover:text-primary hover:bg-primary/5"}`}
            >
              <Map className="w-4 h-4 me-1.5" />
              <span className="hidden sm:inline-block">{t("navExplore")}</span>
            </Button>
          </Link>
          <Link href="/challenge">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-xl font-bold transition-all ${location === "/challenge" ? "text-accent bg-accent/10 border border-accent/30" : "text-muted-foreground hover:text-accent hover:bg-accent/5"}`}
            >
              <Trophy className="w-4 h-4 me-1.5" />
              <span className="hidden sm:inline-block">{t("navChallenges")}</span>
            </Button>
          </Link>

          <div className="w-px h-5 bg-border mx-1" />

          {isAdmin && (
            <Link href="/admin">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-xl font-bold transition-all ${location === "/admin" ? "text-secondary bg-secondary/10 border border-secondary/30" : "text-muted-foreground hover:text-secondary hover:bg-secondary/5"}`}
              >
                <Settings className="w-4 h-4 me-1.5" />
                <span className="hidden sm:inline-block">{t("navAdmin")}</span>
              </Button>
            </Link>
          )}

          <Link href="/profile">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-xl font-bold transition-all ${location === "/profile" ? "text-primary bg-primary/10 border border-primary/30" : "text-muted-foreground hover:text-primary hover:bg-primary/5"}`}
            >
              <UserIcon className="w-4 h-4 me-1.5" />
              <span className="hidden sm:inline-block">{t("navProfile")}</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ redirectUrl: "/" })}
            className="rounded-xl ms-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title={t("navSignOut")}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  const { t } = useApp();
  return (
    <footer className="border-t border-border/40 mt-auto">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center gap-3">
        <div className="flex items-center gap-2 opacity-60">
          <Compass className="w-4 h-4 text-primary" />
          <span className="font-display font-bold text-sm text-foreground">Career Explorer</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium">{t("copyright")}</p>
        <Link href="/tos">
          <span className="text-xs text-primary/60 hover:text-primary transition-colors font-bold cursor-pointer underline underline-offset-2">
            {t("tos")}
          </span>
        </Link>
      </div>
    </footer>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <AnnouncementBanner />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>
      <Footer />
      <ThemeLangSwitcher />
    </div>
  );
}
