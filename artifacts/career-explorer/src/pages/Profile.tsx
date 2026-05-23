import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { useGetMyProfile, useUpdateMyProfile, useGetMyProgress } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Trophy, Map, Edit3, ShieldAlert, Zap, Star, Flame, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { Link } from "wouter";

export default function Profile() {
  const { data: profile, refetch: refetchProfile } = useGetMyProfile();
  const { data: progress } = useGetMyProgress();
  const updateMutation = useUpdateMyProfile();
  const { t } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [grade, setGrade] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setGrade(profile.grade);
    }
  }, [profile]);

  const handleSave = () => {
    updateMutation.mutate(
      { data: { displayName, grade } },
      {
        onSuccess: () => {
          setIsEditing(false);
          refetchProfile();
          toast({ title: t("profileUpdated") });
        }
      }
    );
  };

  const completedCareers = progress?.filter(p => p.completed) || [];
  const inProgressCareers = progress?.filter(p => !p.completed) || [];
  const totalStepsCompleted = progress?.reduce((acc, p) => acc + p.completedSteps, 0) || 0;

  const completedCount = useAnimatedCounter(completedCareers.length, 1000, 200);
  const inProgressCount = useAnimatedCounter(inProgressCareers.length, 1000, 350);
  const stepsCount = useAnimatedCounter(totalStepsCompleted, 1200, 500);

  if (!profile) return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-card rounded-3xl animate-pulse border border-border" />
        ))}
      </div>
    </AppLayout>
  );

  const getRoleBadge = (role: string) => {
    if (role.includes("Sigma")) return { cls: "border-secondary/60 text-secondary bg-secondary/10", icon: <Zap className="w-4 h-4 me-2" /> };
    if (role.includes("Legend")) return { cls: "border-accent/60 text-accent bg-accent/10", icon: <Star className="w-4 h-4 me-2" /> };
    if (role.includes("Admin")) return { cls: "border-destructive/60 text-destructive bg-destructive/10", icon: <ShieldAlert className="w-4 h-4 me-2" /> };
    return { cls: "border-primary/60 text-primary bg-primary/10", icon: <ShieldAlert className="w-4 h-4 me-2" /> };
  };

  const badge = getRoleBadge(profile.role);

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border border-border rounded-3xl p-8 relative overflow-hidden neon-border"
          >
            <div className="absolute top-0 end-0 w-64 h-64 pointer-events-none"
              style={{ background: "radial-gradient(circle at top right, hsl(var(--primary) / 0.08), transparent 70%)" }} />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
              <motion.div
                className="w-24 h-24 bg-primary/15 border-2 border-primary/40 rounded-full flex items-center justify-center shrink-0 neon-border"
                whileHover={{ scale: 1.08 }}
                animate={{ boxShadow: ["0 0 0 0 hsl(var(--primary) / 0.2)", "0 0 0 8px hsl(var(--primary) / 0)", "0 0 0 0 hsl(var(--primary) / 0)"] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <User className="w-12 h-12 text-primary" />
              </motion.div>

              <div className="flex-1">
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.div
                      key="editing"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="grid gap-4 bg-muted/40 p-4 rounded-2xl border border-border"
                    >
                      <div>
                        <Label className="font-bold text-muted-foreground">{t("displayNameLabel")}</Label>
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
                          className="rounded-xl border-2 border-border bg-card font-bold"
                          maxLength={50}
                        />
                      </div>
                      <div>
                        <Label className="font-bold text-muted-foreground">{t("gradeClassLabel")}</Label>
                        <Input
                          value={grade}
                          onChange={(e) => setGrade(e.target.value.slice(0, 30))}
                          className="rounded-xl border-2 border-border bg-card font-bold"
                          maxLength={30}
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button onClick={handleSave} disabled={updateMutation.isPending} className="rounded-xl font-bold px-6 neon-border">
                          {t("save")}
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl font-bold px-6">
                          {t("cancel")}
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="viewing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-between items-start"
                    >
                      <div>
                        <h1 className="font-display text-4xl font-black mb-1">{profile.displayName}</h1>
                        <p className="text-muted-foreground font-bold text-lg mb-3">{profile.grade}</p>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={`inline-flex items-center px-4 py-1.5 rounded-full border-2 font-black text-sm uppercase tracking-wider cursor-default ${badge.cls}`}
                        >
                          {badge.icon} {profile.role}
                        </motion.div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="rounded-full hover:bg-primary/10 hover:text-primary">
                        <Edit3 className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: <Trophy className="w-7 h-7 text-accent neon-text" />, value: completedCount, label: t("careersCompleted"), cls: "neon-border-accent", delay: 0.1 },
              { icon: <Map className="w-7 h-7 text-primary neon-text" />, value: inProgressCount, label: t("activeJourneys"), cls: "neon-border", delay: 0.2 },
              { icon: <Flame className="w-7 h-7 text-secondary neon-text" />, value: stepsCount, label: "Total Steps Done", cls: "neon-border-secondary", delay: 0.3 },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: stat.delay, type: "spring", stiffness: 200, damping: 20 }}
                whileHover={{ y: -4, scale: 1.03 }}
                className={`glass border border-border rounded-3xl p-6 ${stat.cls}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {stat.icon}
                </div>
                <motion.div
                  key={stat.value}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-5xl font-black text-foreground mb-2"
                >
                  {stat.value}
                </motion.div>
                <p className="text-muted-foreground font-bold uppercase tracking-wider text-xs">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {completedCareers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass border border-border rounded-3xl p-6 neon-border-accent"
            >
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
                <h2 className="font-display text-xl font-black">{t("achievements")}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {completedCareers.map((cp, i) => (
                  <motion.span
                    key={cp.careerId}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.05, type: "spring" }}
                    className="px-3 py-1.5 bg-accent/15 border border-accent/30 rounded-full text-xs font-black text-accent"
                  >
                    ✅ Career #{cp.careerId}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass border border-border rounded-3xl p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-accent" />
              <span className="font-bold text-muted-foreground">See how you rank against other explorers!</span>
            </div>
            <Link href="/leaderboard">
              <Button className="rounded-xl font-black neon-border">
                🏆 Leaderboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
