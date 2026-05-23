import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Compass, Trophy, User as UserIcon, Settings, LogOut, Map, X, Zap, School, Crown } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ThemeLangSwitcher } from "@/components/ThemeLangSwitcher";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_EMAIL = "002159@walesschool.com";
const TEACHER_EMAIL = "saeedparker@walesschool.com";

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
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      className="relative z-50 flex items-center gap-3 px-4 py-3 bg-primary/10 border-b border-primary/40 text-sm font-bold text-primary"
    >
      <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
        <Zap className="w-4 h-4 shrink-0 neon-text" />
      </motion.div>
      <span className="flex-1 text-center">{announcement.message}</span>
      <button
        onClick={() => setDismissed(announcement.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function NavLink({
  href,
  icon,
  label,
  activeColor,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  activeColor: string;
}) {
  const [location] = useLocation();
  const isActive = location === href || (href !== "/" && location.startsWith(href));
  return (
    <Link href={href}>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-xl font-bold transition-all ${isActive ? activeColor : "text-muted-foreground hover:text-primary hover:bg-primary/5"}`}
        >
          {icon}
          <span className="hidden sm:inline-block">{label}</span>
        </Button>
      </motion.div>
    </Link>
  );
}

export function Navbar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { t } = useApp();

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const isAdmin = email === ADMIN_EMAIL;
  const isTeacher = email === TEACHER_EMAIL;

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-border/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/explore">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <div className="w-10 h-10 bg-primary/20 border border-primary/40 rounded-xl flex items-center justify-center neon-border">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 5 }}
              >
                <Compass className="w-6 h-6 text-primary" />
              </motion.div>
            </div>
            <span className="font-display font-bold text-xl hidden sm:inline-block text-foreground">
              Career <span className="text-primary">Explorer</span>
            </span>
          </motion.div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink href="/explore" icon={<Map className="w-4 h-4 me-1.5" />} label={t("navExplore")} activeColor="text-primary bg-primary/10 border border-primary/30" />
          <NavLink href="/challenge" icon={<Trophy className="w-4 h-4 me-1.5" />} label={t("navChallenges")} activeColor="text-accent bg-accent/10 border border-accent/30" />
          <NavLink href="/leaderboard" icon={<Crown className="w-4 h-4 me-1.5" />} label="Top" activeColor="text-accent bg-accent/10 border border-accent/30" />

          <div className="w-px h-5 bg-border mx-1" />

          {isAdmin && (
            <NavLink href="/admin" icon={<Settings className="w-4 h-4 me-1.5" />} label={t("navAdmin")} activeColor="text-secondary bg-secondary/10 border border-secondary/30" />
          )}
          {isTeacher && (
            <NavLink href="/teacher" icon={<School className="w-4 h-4 me-1.5" />} label="Teacher" activeColor="text-accent bg-accent/10 border border-accent/30" />
          )}

          <NavLink href="/profile" icon={<UserIcon className="w-4 h-4 me-1.5" />} label={t("navProfile")} activeColor="text-primary bg-primary/10 border border-primary/30" />

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ redirectUrl: "/" })}
              className="rounded-xl ms-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title={t("navSignOut")}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </motion.div>
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
