import { useState } from "react";
import { useLocation } from "wouter";
import { useUpdateMyProfile, useGetMyProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Compass, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { data: profile, isLoading } = useGetMyProfile();
  const updateMutation = useUpdateMyProfile();
  
  const [displayName, setDisplayName] = useState("");
  const [grade, setGrade] = useState("");

  const grades = [
    "Grade 1A", "Grade 1B", "Grade 2A", "Grade 2B", "Grade 3A", "Grade 3B",
    "Grade 4A", "Grade 4B", "5A", "5B", "5C", "6A", "6B", "6C",
    "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
  ];

  // If already onboarded (has name and grade), redirect to explore
  if (!isLoading && profile?.displayName && profile?.grade) {
    setLocation("/explore");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !grade) {
      toast({ variant: "destructive", title: "Wait!", description: "Please fill in all fields to start." });
      return;
    }

    updateMutation.mutate({
      data: { displayName, grade }
    }, {
      onSuccess: () => {
        toast({ title: "Welcome aboard!", description: "Your adventure begins now." });
        setLocation("/explore");
      }
    });
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl border-4 border-primary/10 w-full max-w-md relative z-10">
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6 rotate-3">
          <Compass className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="font-display text-3xl font-black text-center mb-2">Welcome Explorer!</h1>
        <p className="text-center text-muted-foreground font-medium mb-8">Tell us a bit about yourself before we start.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="font-bold text-foreground block">What should we call you?</label>
            <Input 
              placeholder="e.g. Captain Alex" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-14 rounded-2xl text-lg font-bold border-2"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-foreground block">What grade are you in?</label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger className="h-14 rounded-2xl text-lg font-bold border-2">
                <SelectValue placeholder="Select your grade/class" />
              </SelectTrigger>
              <SelectContent className="max-h-60 rounded-xl">
                {grades.map(g => (
                  <SelectItem key={g} value={g} className="font-bold">{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={updateMutation.isPending} className="w-full h-14 rounded-2xl text-lg font-black shadow-md transition-transform active:scale-95">
            Let's Go! <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
}