import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetMyChallenges, useAnswerChallenge, useGetMyProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle2, XCircle, ChevronRight, Star, Zap, RotateCcw, PartyPopper } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";

type ChallengeStatus = { total: number; completed: number; allDone: boolean } | null;

async function fetchChallengeStatus(careerId?: number): Promise<ChallengeStatus> {
  try {
    const url = careerId ? `/api/users/me/challenges/status?careerId=${careerId}` : "/api/users/me/challenges/status";
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function resetChallenges(careerId?: number) {
  await fetch("/api/users/me/challenges/reset", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ careerId }),
  });
}

export default function Challenge() {
  const { data: profile } = useGetMyProfile();
  const { data: challenges, isLoading, refetch } = useGetMyChallenges();
  const answerMutation = useAnswerChallenge();
  const { t } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<{ correct: boolean; explanation: string; points: number } | null>(null);
  const [status, setStatus] = useState<ChallengeStatus>(null);
  const [showBadge, setShowBadge] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchChallengeStatus(profile?.activeCareer ?? undefined).then(setStatus);
  }, [profile?.activeCareer, challenges]);

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
          toast({ title: "⚡ Correct!", description: `You earned ${data.points} points! Keep going!` });
        } else {
          toast({ variant: "destructive", title: "Not quite! 🤔", description: "Check the explanation below to learn more." });
        }
      }
    });
  };

  const handleNext = async () => {
    setResult(null);
    setSelectedOption(null);

    if (challenges && currentIndex < challenges.length - 1) {
      setCurrentIndex(curr => curr + 1);
    } else {
      // Last question answered — check if all done
      const newStatus = await fetchChallengeStatus(profile?.activeCareer ?? undefined);
      setStatus(newStatus);
      if (newStatus?.allDone) {
        setShowBadge(true);
      } else {
        setCurrentIndex(0);
        refetch();
      }
    }
  };

  const handleReset = async () => {
    setResetting(true);
    await resetChallenges(profile?.activeCareer ?? undefined);
    setShowBadge(false);
    setCurrentIndex(0);
    setResult(null);
    setSelectedOption(null);
    await refetch();
    const newStatus = await fetchChallengeStatus(profile?.activeCareer ?? undefined);
    setStatus(newStatus);
    setResetting(false);
  };

  if (isLoading) return (
    <AppLayout>
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  // All challenges completed — show badge
  if (showBadge || (status?.allDone && !challenges?.length)) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass border border-border rounded-3xl p-12 neon-border relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-32 h-32 rounded-full bg-accent/20 border-4 border-accent/50 flex items-center justify-center mx-auto mb-6 neon-border-accent"
                style={{ boxShadow: "0 0 60px hsl(var(--accent) / 0.4)" }}>
                <PartyPopper className="w-16 h-16 text-accent" />
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/30 text-accent font-black text-sm rounded-full mb-6 uppercase tracking-wider">
                <Trophy className="w-4 h-4" />
                Challenge Master Badge Earned! 🏆
              </div>

              <h2 className="font-display text-5xl font-black mb-4 text-foreground">
                🎉 You did it!
              </h2>
              <p className="text-xl text-muted-foreground font-medium mb-3">
                You completed ALL {status?.total ?? challenges?.length ?? "all the"} challenges for this career!
              </p>
              <p className="text-muted-foreground font-medium mb-8">
                That's amazing! You're officially a <span className="text-accent font-black">Challenge Master</span> for this career. Try a different career or replay these challenges!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleReset}
                  disabled={resetting}
                  variant="outline"
                  className="rounded-2xl font-bold h-14 px-8 border-accent/50 text-accent hover:bg-accent/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {resetting ? "Resetting..." : "Play Again 🔄"}
                </Button>
                <Button
                  onClick={() => window.location.href = "/explore"}
                  className="rounded-2xl font-bold h-14 px-8 neon-border"
                >
                  Try Another Career ✨
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!challenges?.length && !status?.allDone) {
    return (
      <AppLayout>
        <div className="text-center p-12 glass border border-border rounded-3xl max-w-2xl mx-auto mt-12 neon-border">
          <Trophy className="w-16 h-16 text-muted mx-auto mb-4" />
          <h2 className="font-display text-3xl font-black mb-2">No challenges yet! 🎯</h2>
          <p className="text-muted-foreground font-medium mb-6">
            Pick a career on the Explore page and start your journey to unlock challenges!
          </p>
          <Button onClick={() => window.location.href = "/explore"} className="rounded-xl font-bold h-12 px-6 neon-border">
            Explore Careers 🚀
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (!activeChallenge) return null;

  const progressPercent = status ? Math.round((status.completed / status.total) * 100) : 0;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-12">

        {/* Header with progress */}
        <div className="glass border border-border p-4 rounded-2xl neon-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent/20 border border-accent/30 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Role</div>
                <div className="font-black text-xl text-foreground">{profile?.role || "Explorer"}</div>
              </div>
            </div>
            <div className="text-end">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Question</div>
              <div className="font-black text-xl text-primary">{currentIndex + 1} / {challenges.length}</div>
            </div>
          </div>

          {/* Progress bar */}
          {status && status.total > 0 && (
            <div>
              <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                <span>Overall Progress</span>
                <span>{status.completed}/{status.total} completed ({progressPercent}%)</span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
                    boxShadow: "0 0 8px hsl(var(--primary) / 0.5)"
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Question card */}
        <div className="glass border border-border rounded-3xl overflow-hidden neon-border shadow-2xl">
          <div className="relative p-8 sm:p-12 overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.18) 0%, hsl(var(--secondary) / 0.10) 100%)" }}
          >
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 text-primary font-bold text-xs rounded-full mb-4 uppercase tracking-wider relative z-10">
              <Zap className="w-3 h-3" />
              {activeChallenge.difficulty === "easy" ? "🟢 Easy" : activeChallenge.difficulty === "hard" ? "🔴 Hard" : "🟡 Medium"}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black leading-tight text-foreground relative z-10">
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
                      className={`h-auto min-h-14 py-4 px-6 justify-start text-start whitespace-normal rounded-2xl text-base font-bold border-2 transition-all ${
                        selectedOption === option
                          ? "border-primary ring-4 ring-primary/20 scale-[1.02] neon-border"
                          : "hover:border-primary/50 hover:bg-primary/5 bg-card border-border"
                      }`}
                    >
                      <span className="font-black text-primary/70 mr-3 shrink-0">
                        {["A", "B", "C", "D"][i]}.
                      </span>
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
                  {answerMutation.isPending ? "Checking..." : "Submit My Answer ✅"}
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
                  <div className="flex items-center gap-3 mb-3">
                    {result.correct
                      ? <CheckCircle2 className="w-8 h-8 text-accent shrink-0" />
                      : <XCircle className="w-8 h-8 text-destructive shrink-0" />
                    }
                    <h3 className={`font-display font-black text-2xl ${result.correct ? "text-accent" : "text-destructive"}`}>
                      {result.correct ? "🎉 Correct! Great job!" : "Not quite! 🤔"}
                    </h3>
                  </div>
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Here's what you need to know:</div>
                  <p className="font-medium text-base text-foreground/90 leading-relaxed">{result.explanation}</p>
                  {result.correct && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/30 text-accent font-black text-sm rounded-full">
                      ⭐ +{result.points} points earned!
                    </div>
                  )}
                </div>
                <Button
                  size="lg"
                  onClick={handleNext}
                  className="w-full h-16 text-lg rounded-2xl font-black shadow-md transition-transform active:scale-95 neon-border"
                >
                  {currentIndex < challenges.length - 1 ? "Next Question →" : "Finish! 🏁"}
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
