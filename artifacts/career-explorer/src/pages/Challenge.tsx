import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetMyChallenges, useAnswerChallenge, useGetMyProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle2, XCircle, ChevronRight, Star, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";

export default function Challenge() {
  const { data: profile } = useGetMyProfile();
  const { data: challenges, isLoading, refetch } = useGetMyChallenges();
  const answerMutation = useAnswerChallenge();
  const { t } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<{correct: boolean, explanation: string, points: number} | null>(null);

  const activeChallenge = challenges?.[currentIndex];

  const handleAnswer = () => {
    if (!activeChallenge || !selectedOption) return;

    answerMutation.mutate({
      challengeId: activeChallenge.id,
      data: { answer: selectedOption }
    }, {
      onSuccess: (data) => {
        setResult(data);
        if (data.correct) {
          toast({ title: t("correctTitle"), description: `${t("earnedPoints")} ${data.points} ${t("pointsLabel")}` });
        } else {
          toast({ variant: "destructive", title: t("notQuiteTitle"), description: t("wrongFeedback") });
        }
      }
    });
  };

  const handleNext = () => {
    setResult(null);
    setSelectedOption(null);
    if (challenges && currentIndex < challenges.length - 1) {
      setCurrentIndex(curr => curr + 1);
    } else {
      setCurrentIndex(0);
      refetch();
    }
  };

  if (isLoading) return (
    <AppLayout>
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  if (!challenges?.length) {
    return (
      <AppLayout>
        <div className="text-center p-12 glass border border-border rounded-3xl max-w-2xl mx-auto mt-12 neon-border">
          <Trophy className="w-16 h-16 text-muted mx-auto mb-4" />
          <h2 className="font-display text-3xl font-black mb-2">{t("noChallengesYet")}</h2>
          <p className="text-muted-foreground font-medium mb-6">{t("startCareerForChallenges")}</p>
          <Button onClick={() => window.location.href = "/explore"} className="rounded-xl font-bold h-12 px-6 neon-border">
            {t("exploreNow")}
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-12">
        <div className="flex items-center justify-between glass border border-border p-4 rounded-2xl neon-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/20 border border-accent/30 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-accent" />
            </div>
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("yourXP")}</div>
              <div className="font-black text-xl text-foreground">{profile?.role || "Explorer"}</div>
            </div>
          </div>
          <div className="text-end">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("challengeLabel")}</div>
            <div className="font-black text-xl text-primary">{currentIndex + 1} / {challenges.length}</div>
          </div>
        </div>

        <div className="glass border border-border rounded-3xl overflow-hidden neon-border shadow-2xl">
          <div className="relative p-8 sm:p-12 overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.18) 0%, hsl(var(--secondary) / 0.10) 100%)" }}
          >
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 text-primary font-bold text-xs rounded-full mb-4 uppercase tracking-wider relative z-10">
              <Zap className="w-3 h-3" />
              {t("difficultyLabel")}: {activeChallenge.difficulty}
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black leading-tight text-foreground relative z-10">
              {activeChallenge.question}
            </h2>
          </div>

          <div className="p-8 sm:p-12">
            {!result ? (
              <>
                <div className="grid gap-4 mb-8">
                  {activeChallenge.options.map((option, i) => (
                    <Button
                      key={i}
                      variant={selectedOption === option ? "default" : "outline"}
                      onClick={() => setSelectedOption(option)}
                      className={`h-auto min-h-16 py-4 px-6 justify-start text-start whitespace-normal rounded-2xl text-base font-bold border-2 transition-all ${
                        selectedOption === option
                          ? "border-primary ring-4 ring-primary/20 scale-[1.02] neon-border"
                          : "hover:border-primary/50 hover:bg-primary/5 bg-card border-border"
                      }`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                <Button
                  size="lg"
                  onClick={handleAnswer}
                  disabled={!selectedOption || answerMutation.isPending}
                  className="w-full h-16 text-lg rounded-2xl font-black shadow-md transition-transform active:scale-95 neon-border"
                >
                  {t("submitAnswer")}
                </Button>
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className={`p-6 rounded-2xl border-2 mb-8 ${
                  result.correct
                    ? "border-accent/50 text-foreground neon-border-accent"
                    : "border-destructive/50 text-foreground"
                }`}
                  style={{ background: result.correct ? "hsl(var(--accent) / 0.08)" : "hsl(var(--destructive) / 0.08)" }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {result.correct
                      ? <CheckCircle2 className="w-8 h-8 text-accent" />
                      : <XCircle className="w-8 h-8 text-destructive" />
                    }
                    <h3 className={`font-display font-black text-2xl ${result.correct ? "text-accent" : "text-destructive"}`}>
                      {result.correct ? t("greatJobTitle") : t("notQuiteTitle")}
                    </h3>
                  </div>
                  <p className="font-medium text-lg text-muted-foreground">{result.explanation}</p>
                </div>
                <Button
                  size="lg"
                  onClick={handleNext}
                  className="w-full h-16 text-lg rounded-2xl font-black shadow-md transition-transform active:scale-95 neon-border"
                >
                  {currentIndex < challenges.length - 1 ? t("nextChallenge") : t("finish")}
                  <ChevronRight className="w-5 h-5 ms-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
