import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetMyChallenges, useAnswerChallenge, useGetMyProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle2, XCircle, ChevronRight, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Challenge() {
  const { data: profile } = useGetMyProfile();
  const { data: challenges, isLoading, refetch } = useGetMyChallenges();
  const answerMutation = useAnswerChallenge();

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
          toast({ title: "Correct!", description: `You earned ${data.points} points!` });
        } else {
          toast({ variant: "destructive", title: "Not quite!", description: "Read the explanation to learn why." });
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
      // Loop or handle finish
      setCurrentIndex(0);
      refetch();
    }
  };

  if (isLoading) return <AppLayout><div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div></AppLayout>;
  
  if (!challenges?.length) {
    return (
      <AppLayout>
        <div className="text-center p-12 bg-white rounded-3xl border-2 border-muted max-w-2xl mx-auto mt-12">
          <Trophy className="w-16 h-16 text-muted mx-auto mb-4" />
          <h2 className="font-display text-3xl font-black mb-2">No Challenges Yet</h2>
          <p className="text-muted-foreground font-medium mb-6">Start a career to unlock its challenges!</p>
          <Button onClick={() => window.location.href = "/explore"} className="rounded-xl font-bold h-12 px-6">Explore Careers</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-12">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-muted shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-accent" />
            </div>
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your XP</div>
              <div className="font-black text-xl">{profile?.role || "Explorer"}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Challenge</div>
            <div className="font-black text-xl text-primary">{currentIndex + 1} / {challenges.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-muted shadow-xl overflow-hidden">
          <div className="bg-primary p-8 sm:p-12 text-white">
            <div className="inline-block px-3 py-1 bg-white/20 font-bold text-xs rounded-full mb-4 uppercase tracking-wider backdrop-blur-sm">
              Difficulty: {activeChallenge.difficulty}
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black leading-tight">{activeChallenge.question}</h2>
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
                      className={`h-auto min-h-16 py-4 px-6 justify-start text-left whitespace-normal rounded-2xl text-lg font-bold border-2 transition-all ${selectedOption === option ? 'border-primary ring-4 ring-primary/20 scale-[1.02]' : 'hover:border-primary/50 hover:bg-muted/50'}`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                <Button 
                  size="lg" 
                  onClick={handleAnswer} 
                  disabled={!selectedOption || answerMutation.isPending}
                  className="w-full h-16 text-lg rounded-2xl font-black shadow-md transition-transform active:scale-95"
                >
                  Submit Answer
                </Button>
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className={`p-6 rounded-2xl border-2 mb-8 ${result.correct ? 'bg-green-50 border-green-200 text-green-900' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    {result.correct ? <CheckCircle2 className="w-8 h-8 text-green-500" /> : <XCircle className="w-8 h-8" />}
                    <h3 className="font-display font-black text-2xl">
                      {result.correct ? "Great Job!" : "Not Quite"}
                    </h3>
                  </div>
                  <p className="font-medium text-lg opacity-90">{result.explanation}</p>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleNext}
                  className="w-full h-16 text-lg rounded-2xl font-black shadow-md transition-transform active:scale-95"
                >
                  {currentIndex < challenges.length - 1 ? "Next Challenge" : "Finish"} <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}