import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Trophy, Crown, Zap, Map, Medal, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/context/AppContext";
import { useGetMyProfile } from "@workspace/api-client-react";

interface LeaderRow {
  id: number;
  displayName: string;
  grade: string;
  role: string;
  completedCareers: number;
  totalChallenges: number;
}

const RANK_COLORS = [
  "from-yellow-400/20 to-amber-500/10 border-yellow-400/40 text-yellow-400",
  "from-slate-300/20 to-slate-400/10 border-slate-300/40 text-slate-300",
  "from-amber-700/20 to-amber-800/10 border-amber-700/40 text-amber-600",
];

const RANK_ICONS = [
  <Crown className="w-6 h-6" key="crown" />,
  <Medal className="w-5 h-5" key="medal" />,
  <Star className="w-5 h-5" key="star" />,
];

function RoleChip({ role }: { role: string }) {
  let cls = "bg-primary/15 text-primary border-primary/30";
  if (role.includes("Sigma")) cls = "bg-secondary/15 text-secondary border-secondary/30";
  if (role.includes("Legend")) cls = "bg-accent/15 text-accent border-accent/30";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-black border ${cls}`}>
      {role}
    </span>
  );
}

export default function Leaderboard() {
  const { t } = useApp();
  const { data: myProfile } = useGetMyProfile();
  const { data: rows = [], isLoading } = useQuery<LeaderRow[]>({
    queryKey: ["leaderboard"],
    queryFn: () => fetch("/api/leaderboard", { credentials: "include" }).then(r => r.json()),
    staleTime: 30_000,
  });

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200, damping: 24 } },
  };

  return (
    <AppLayout>
      <PageTransition>
        <div className="flex flex-col gap-8 pb-12 max-w-3xl mx-auto">
          <div
            className="relative overflow-hidden rounded-3xl p-8 border border-accent/30 neon-border-accent"
            style={{ background: "linear-gradient(135deg, hsl(var(--accent) / 0.10) 0%, hsl(var(--primary) / 0.06) 100%)" }}
          >
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none rounded-3xl" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/6 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, -8, 8, -8, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="w-16 h-16 bg-accent/20 border-2 border-accent/40 rounded-2xl flex items-center justify-center neon-border-accent"
              >
                <Trophy className="w-9 h-9 text-accent neon-text" />
              </motion.div>
              <div>
                <h1 className="font-display text-4xl sm:text-5xl font-black text-foreground">
                  🏆 <span className="neon-text-primary">{t("leaderboard") ?? "Leaderboard"}</span>
                </h1>
                <p className="text-muted-foreground font-bold text-lg mt-1">
                  {t("leaderboardSubtitle") ?? "Top explorers at Wales International British School"}
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-card rounded-2xl animate-pulse border border-border" />
              ))}
            </div>
          ) : (
            <motion.div
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {rows.map((row, i) => {
                const isMe = myProfile?.displayName === row.displayName;
                const rankCls = i < 3 ? RANK_COLORS[i] : "";
                return (
                  <motion.div
                    key={row.id}
                    variants={rowVariants}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                      isMe
                        ? "border-primary/60 bg-primary/8 neon-border"
                        : i < 3
                        ? `bg-gradient-to-r ${rankCls.split(" ").slice(0, 2).join(" ")} border ${rankCls.split(" ").slice(2).join(" ")}`
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                      i === 0 ? "bg-yellow-400/20 text-yellow-400" :
                      i === 1 ? "bg-slate-300/20 text-slate-300" :
                      i === 2 ? "bg-amber-700/20 text-amber-600" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {i < 3 ? RANK_ICONS[i] : <span>#{i + 1}</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-black text-lg truncate">{row.displayName}</span>
                        {isMe && <span className="text-xs font-black text-primary bg-primary/15 px-2 py-0.5 rounded-full border border-primary/30">YOU</span>}
                        <RoleChip role={row.role} />
                      </div>
                      {row.grade && (
                        <span className="text-sm text-muted-foreground font-bold">{row.grade}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1">
                          <Map className="w-4 h-4 text-primary" />
                          <span className="font-black text-xl text-foreground">{row.completedCareers}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Careers</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-accent" />
                          <span className="font-black text-xl text-foreground">{row.totalChallenges}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Challenges</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {rows.length === 0 && (
                <div className="text-center py-16 text-muted-foreground font-bold">
                  <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>No explorers yet! Be the first! 🚀</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
}
