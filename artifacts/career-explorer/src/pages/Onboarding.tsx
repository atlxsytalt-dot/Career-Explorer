import { useState } from "react";
import { useLocation } from "wouter";
import { useUpdateMyProfile, useGetMyProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Compass, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";
import { ThemeLangSwitcher } from "@/components/ThemeLangSwitcher";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { data: profile, isLoading } = useGetMyProfile();
  const updateMutation = useUpdateMyProfile();
  const { t } = useApp();

  const [displayName, setDisplayName] = useState("");
  const [grade, setGrade] = useState("");

  const grades = [
    "Grade 1A", "Grade 1B", "Grade 2A", "Grade 2B", "Grade 3A", "Grade 3B",
    "Grade 4A", "Grade 4B", "5A", "5B", "5C", "6A", "6B", "6C",
    "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
  ];

  if (!isLoading && profile?.displayName && profile?.grade) {
    setLocation("/explore");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !grade) {
      toast({ variant: "destructive", title: t("waitLabel"), description: t("pleaseFillAll") });
      return;
    }

    updateMutation.mutate(
      { data: { displayName: displayName.trim().slice(0, 50), grade } },
      {
        onSuccess: () => {
          toast({ title: t("welcomeAboardTitle"), description: t("adventureBegins") });
          setLocation("/explore");
        }
      }
    );
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background grid-bg px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-secondary/8 rounded-full blur-3xl pointer-events-none" />

      <div className="glass border border-border p-8 sm:p-12 rounded-3xl shadow-2xl w-full max-w-md relative z-10 neon-border">
        <div className="w-20 h-20 bg-primary/20 border-2 border-primary/40 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6 rotate-3 neon-border">
          <Compass className="w-10 h-10 text-primary" />
        </div>

        <h1 className="font-display text-3xl font-black text-center mb-2">{t("welcomeExplorer")}</h1>
        <p className="text-center text-muted-foreground font-medium mb-8">{t("tellUsAboutYou")}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="font-bold text-foreground block">{t("whatToCall")}</label>
            <Input
              placeholder={t("namePlaceholder")}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-14 rounded-2xl text-lg font-bold border-2 border-border bg-card focus-visible:border-primary/60"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-foreground block">{t("whatGrade")}</label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger className="h-14 rounded-2xl text-lg font-bold border-2 border-border bg-card focus:border-primary/60">
                <SelectValue placeholder={t("selectGrade")} />
              </SelectTrigger>
              <SelectContent className="max-h-60 rounded-xl bg-card border-border">
                {grades.map(g => (
                  <SelectItem key={g} value={g} className="font-bold">{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full h-14 rounded-2xl text-lg font-black shadow-md transition-transform active:scale-95 neon-border"
          >
            {t("letsGo")} <Sparkles className="w-5 h-5 ms-2" />
          </Button>
        </form>
      </div>

      <ThemeLangSwitcher />
    </div>
  );
}
