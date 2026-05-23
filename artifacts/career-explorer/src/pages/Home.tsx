import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Compass, Sparkles, Zap, Users, Map, Trophy } from "lucide-react";
import { useGetStats } from "@workspace/api-client-react";
import { useApp } from "@/context/AppContext";
import { FloatingParticles } from "@/components/FloatingParticles";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

function StatCard({
  icon,
  value,
  label,
  cls,
  delay,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  cls: string;
  delay: number;
}) {
  const numericValue = typeof value === "number" ? value : 0;
  const animated = useAnimatedCounter(numericValue, 1400, delay);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: delay / 1000, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ y: -6, scale: 1.04 }}
      className={`glass border rounded-2xl p-6 flex flex-col items-center cursor-default ${cls}`}
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
      >
        {icon}
      </motion.div>
      <span className="text-3xl font-black text-foreground mt-2">
        {typeof value === "number" ? animated : value}
      </span>
      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1 text-center">{label}</span>
    </motion.div>
  );
}

const FUN_FACTS = [
  "🌍 There are 1,000+ different career paths you can choose!",
  "🚀 Most astronauts study engineering or science first.",
  "🎮 Game designers can earn up to $120k/year!",
  "🏥 Doctors study for 10+ years — but save lives every day!",
  "🤖 AI engineers are the most wanted job in 2025!",
  "⚽ Pro footballers train 6 days a week, 4 hours a day!",
  "🎨 Graphic designers work on apps, movies, and games!",
  "✈️ Pilots need 1,500 flight hours before flying passengers.",
];

export default function Home() {
  const { data: stats } = useGetStats();
  const { t } = useApp();
  const factIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % FUN_FACTS.length;
  const fact = FUN_FACTS[factIndex];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background grid-bg overflow-hidden relative">
      <FloatingParticles />

      <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-primary/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] bg-secondary/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-accent/4 rounded-full blur-[100px] pointer-events-none" />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="container mx-auto px-4 py-6 flex items-center justify-between relative z-10"
      >
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="w-12 h-12 bg-primary/20 border border-primary/40 rounded-2xl flex items-center justify-center neon-border shadow-lg">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
            >
              <Compass className="w-7 h-7 text-primary" />
            </motion.div>
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">
            Career <span className="text-primary">{t("navExplore") === "استكشف" ? "مستكشف" : "Explorer"}</span>
          </span>
        </motion.div>
        <div className="flex gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" className="rounded-xl font-bold hidden sm:flex text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/30">
              {t("navSignIn")}
            </Button>
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/sign-up">
              <Button className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all hover:shadow-primary/50 neon-border">
                {t("startingUp")}
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent font-bold text-sm mb-8 neon-border-accent"
        >
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Zap className="w-4 h-4" />
          </motion.div>
          <span>{t("madeForWales")}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="font-display text-5xl sm:text-7xl font-black text-foreground max-w-4xl leading-tight tracking-tight mb-6"
        >
          {t("tagline").split("YOU").length > 1 ? (
            <>
              {t("tagline").split("YOU")[0]}
              <motion.span
                className="inline-block -rotate-1 neon-text-primary"
                animate={{ rotate: [-1, 2, -1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                YOU
              </motion.span>
              {t("tagline").split("YOU")[1]}
            </>
          ) : (
            <span className="neon-text-primary">{t("tagline")}</span>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl sm:text-2xl text-muted-foreground max-w-2xl font-medium mb-8"
        >
          {t("discoverCareers")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-card/60 border border-border text-sm font-bold text-muted-foreground mb-10 max-w-xl text-center backdrop-blur-sm"
        >
          <span className="text-lg">💡</span>
          <span>{fact}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-20"
        >
          <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="h-14 px-8 text-lg rounded-2xl font-black bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all neon-border"
              >
                {t("startAdventure")}
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Sparkles className="w-5 h-5 ms-2" />
                </motion.div>
              </Button>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link href="/sign-in">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg rounded-2xl font-bold border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all"
              >
                {t("alreadyHaveAccount")}
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl w-full">
            <StatCard
              icon={<Users className="w-8 h-8 text-secondary neon-text" />}
              value={stats.totalUsers}
              label={t("totalExplorers")}
              cls="neon-border-secondary"
              delay={400}
            />
            <StatCard
              icon={<Map className="w-8 h-8 text-primary neon-text" />}
              value={stats.totalCareers}
              label={t("totalCareers")}
              cls="neon-border"
              delay={550}
            />
            <StatCard
              icon={<Trophy className="w-8 h-8 text-accent neon-text" />}
              value={100}
              label={t("totalChallenges")}
              cls="neon-border-accent col-span-2 md:col-span-1"
              delay={700}
            />
          </div>
        )}
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="border-t border-border/40 py-6 relative z-10"
      >
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{t("copyright")}</p>
          <Link href="/tos">
            <span className="text-xs text-primary/60 hover:text-primary transition-colors font-bold cursor-pointer underline underline-offset-2">
              {t("tos")}
            </span>
          </Link>
        </div>
      </motion.footer>
    </div>
  );
}
