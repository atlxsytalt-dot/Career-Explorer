import { useLocation, useParams } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useGetCareer, useGetMyProgress, useStartCareer, useUpdateCareerProgress } from "@workspace/api-client-react";
import { ChevronLeft, Flag, CheckCircle2, Rocket, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

export default function CareerDetail() {
  const { id } = useParams();
  const careerId = Number(id);
  const [, setLocation] = useLocation();

  const { data: career, isLoading: isCareerLoading } = useGetCareer(careerId);
  const { data: progress, refetch: refetchProgress } = useGetMyProgress();
  const startCareerMutation = useStartCareer();
  const updateProgressMutation = useUpdateCareerProgress();

  const careerProgress = progress?.find(p => p.careerId === careerId);
  const isStarted = !!careerProgress;
  const completedSteps = careerProgress?.completedSteps || 0;
  const isCompleted = careerProgress?.completed || false;

  const progressPercent = career ? (completedSteps / career.stepCount) * 100 : 0;

  const handleStart = () => {
    startCareerMutation.mutate({ data: { careerId } }, {
      onSuccess: () => {
        refetchProgress();
        toast({ title: "Adventure Started!", description: "You are now on the path to becoming a " + career?.title });
      }
    });
  };

  const handleCompleteStep = (stepOrder: number) => {
    if (!isStarted || isCompleted) return;
    
    // Only allow completing the next sequential step
    if (stepOrder !== completedSteps + 1) return;

    const newCompletedSteps = completedSteps + 1;
    const isNowComplete = newCompletedSteps === career?.stepCount;

    updateProgressMutation.mutate({
      careerId,
      data: { completedSteps: newCompletedSteps, completed: isNowComplete }
    }, {
      onSuccess: () => {
        refetchProgress();
        if (isNowComplete) {
          toast({ 
            title: "Career Completed! 🎉", 
            description: "Amazing job! You've learned how to be a " + career?.title,
          });
        } else {
          toast({ title: "Step Completed!", description: "Great job! Keep going." });
        }
      }
    });
  };

  if (isCareerLoading) return <AppLayout><div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div></AppLayout>;
  if (!career) return <AppLayout><div className="text-center p-12">Career not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 pb-12">
        <Button variant="ghost" onClick={() => setLocation("/explore")} className="w-fit -ml-4 font-bold">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Explore
        </Button>

        <div className="bg-white rounded-3xl p-8 border-2 border-muted shadow-sm flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-primary/10 rounded-3xl flex items-center justify-center text-5xl sm:text-6xl shrink-0">
            {career.icon}
          </div>
          <div className="flex-1">
            <div className="inline-block px-3 py-1 bg-secondary/10 text-secondary font-bold text-xs rounded-full mb-3 uppercase tracking-wider">
              {career.category}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-black mb-4">{career.title}</h1>
            <p className="text-lg text-muted-foreground font-medium mb-6">{career.description}</p>
            
            {isStarted ? (
              <div className="bg-muted/50 p-4 rounded-2xl">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <div className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-1">Your Progress</div>
                    <div className="font-black text-2xl text-primary">{Math.round(progressPercent)}%</div>
                  </div>
                  {isCompleted && (
                    <div className="flex items-center gap-1 text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full text-sm">
                      <Trophy className="w-4 h-4" /> Completed
                    </div>
                  )}
                </div>
                <Progress value={progressPercent} className="h-3 bg-muted border border-muted" />
              </div>
            ) : (
              <Button size="lg" onClick={handleStart} disabled={startCareerMutation.isPending} className="h-14 px-8 text-lg rounded-2xl shadow-md hover:shadow-lg font-black w-full sm:w-auto">
                <Rocket className="w-5 h-5 mr-2" />
                Start This Career
              </Button>
            )}
          </div>
        </div>

        {isStarted && (
          <div className="space-y-6 mt-4">
            <h2 className="font-display text-3xl font-black flex items-center gap-2">
              <Flag className="w-8 h-8 text-secondary" />
              Your Journey Steps
            </h2>
            
            <div className="grid gap-4">
              {career.steps?.map((step) => {
                const isStepCompleted = step.order <= completedSteps;
                const isCurrentStep = step.order === completedSteps + 1;
                const isLocked = step.order > completedSteps + 1;

                return (
                  <div 
                    key={step.id} 
                    className={`p-6 rounded-3xl border-2 transition-all ${
                      isStepCompleted ? 'bg-green-50 border-green-200' :
                      isCurrentStep ? 'bg-white border-primary shadow-md scale-[1.01]' :
                      'bg-muted/30 border-muted opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                            isStepCompleted ? 'bg-green-500 text-white' :
                            isCurrentStep ? 'bg-primary text-white' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {step.order}
                          </span>
                          <h3 className="font-display font-bold text-xl">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground font-medium pl-11">{step.description}</p>
                        {step.tip && (
                          <div className="mt-3 pl-11 text-sm font-bold text-secondary bg-secondary/10 inline-block px-3 py-1 rounded-xl">
                            💡 Tip: {step.tip}
                          </div>
                        )}
                      </div>
                      
                      <div className="pl-11 sm:pl-0 shrink-0">
                        {isStepCompleted ? (
                          <Button disabled variant="outline" className="rounded-xl border-green-500 text-green-600 bg-green-50 font-bold opacity-100 h-12 px-6">
                            <CheckCircle2 className="w-5 h-5 mr-2" /> Done
                          </Button>
                        ) : isCurrentStep ? (
                          <Button 
                            onClick={() => handleCompleteStep(step.order)}
                            disabled={updateProgressMutation.isPending}
                            className="rounded-xl h-12 px-6 font-black w-full sm:w-auto shadow-sm active:scale-95 transition-transform"
                          >
                            Mark Complete
                          </Button>
                        ) : (
                          <Button disabled variant="outline" className="rounded-xl h-12 px-6 font-bold w-full sm:w-auto">
                            Locked
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {isCompleted && (
              <div className="mt-8 text-center p-8 bg-accent/10 border-2 border-accent rounded-3xl">
                <h3 className="font-display font-black text-2xl mb-2">Ready for a challenge?</h3>
                <p className="font-medium text-muted-foreground mb-6">Put your new skills to the test and earn points!</p>
                <Button size="lg" onClick={() => setLocation("/challenge")} className="h-14 px-8 rounded-2xl font-black bg-accent text-accent-foreground hover:bg-accent/90">
                  <Trophy className="w-5 h-5 mr-2" /> Take Challenges
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}