import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetMyProfile, useUpdateMyProfile, useGetMyProgress } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Trophy, Map, Edit3, ShieldAlert, Zap, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";

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

  if (!profile) return (
    <AppLayout>
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
        <div className="glass border border-border rounded-3xl p-8 relative overflow-hidden neon-border">
          <div className="absolute top-0 end-0 w-64 h-64 pointer-events-none"
            style={{ background: "radial-gradient(circle at top right, hsl(var(--primary) / 0.08), transparent 70%)" }} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
            <div className="w-24 h-24 bg-primary/15 border-2 border-primary/40 rounded-full flex items-center justify-center shrink-0 neon-border">
              <User className="w-12 h-12 text-primary" />
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="grid gap-4 bg-muted/40 p-4 rounded-2xl border border-border">
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
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-display text-4xl font-black mb-1">{profile.displayName}</h1>
                    <p className="text-muted-foreground font-bold text-lg mb-3">{profile.grade}</p>
                    <div className={`inline-flex items-center px-4 py-1.5 rounded-full border-2 font-black text-sm uppercase tracking-wider ${badge.cls}`}>
                      {badge.icon} {profile.role}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="rounded-full hover:bg-primary/10 hover:text-primary">
                    <Edit3 className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="glass border border-border rounded-3xl p-8 neon-border-accent">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-8 h-8 text-accent neon-text" />
              <h2 className="font-display text-2xl font-black">{t("achievements")}</h2>
            </div>
            <div className="text-5xl font-black text-accent mb-2">{completedCareers.length}</div>
            <p className="text-muted-foreground font-bold uppercase tracking-wider text-sm">{t("careersCompleted")}</p>
          </div>

          <div className="glass border border-border rounded-3xl p-8 neon-border">
            <div className="flex items-center gap-3 mb-6">
              <Map className="w-8 h-8 text-primary neon-text" />
              <h2 className="font-display text-2xl font-black">{t("inProgress")}</h2>
            </div>
            <div className="text-5xl font-black text-primary mb-2">{inProgressCareers.length}</div>
            <p className="text-muted-foreground font-bold uppercase tracking-wider text-sm">{t("activeJourneys")}</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
