import { useState } from "react";
import { useLocation } from "wouter";
import { useUpdateMyProfile, useGetMyProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Compass, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";
import { ThemeLangSwitcher } from "@/components/ThemeLangSwitcher";

// Wales International British School UAE — full grade structure
const GRADE_GROUPS = [
  {
    label: "Foundation Stage",
    grades: ["FS1 (Nursery)", "FS2 (Reception)"],
  },
  {
    label: "Primary — Year 1",
    grades: ["Year 1A", "Year 1B", "Year 1C", "Year 1D"],
  },
  {
    label: "Primary — Year 2",
    grades: ["Year 2A", "Year 2B", "Year 2C", "Year 2D"],
  },
  {
    label: "Primary — Year 3",
    grades: ["Year 3A", "Year 3B", "Year 3C", "Year 3D"],
  },
  {
    label: "Primary — Year 4",
    grades: ["Year 4A", "Year 4B", "Year 4C", "Year 4D"],
  },
  {
    label: "Primary — Year 5",
    grades: ["Year 5A", "Year 5B", "Year 5C", "Year 5D", "Year 5E"],
  },
  {
    label: "Primary — Year 6",
    grades: ["Year 6A", "Year 6B", "Year 6C", "Year 6D"],
  },
  {
    label: "Secondary — Year 7",
    grades: ["Year 7A", "Year 7B", "Year 7C", "Year 7D"],
  },
  {
    label: "Secondary — Year 8",
    grades: ["Year 8A", "Year 8B", "Year 8C", "Year 8D"],
  },
  {
    label: "Secondary — Year 9",
    grades: ["Year 9A", "Year 9B", "Year 9C", "Year 9D"],
  },
  {
    label: "Secondary — Year 10 (GCSE)",
    grades: ["Year 10A", "Year 10B", "Year 10C"],
  },
  {
    label: "Secondary — Year 11 (GCSE)",
    grades: ["Year 11A", "Year 11B", "Year 11C"],
  },
  {
    label: "Sixth Form",
    grades: ["Year 12 (AS Level)", "Year 13 (A Level)"],
  },
  {
    label: "Staff",
    grades: ["Teacher", "Admin Staff", "Support Staff"],
  },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { data: profile, isLoading } = useGetMyProfile();
  const updateMutation = useUpdateMyProfile();
  const { t } = useApp();

  const [displayName, setDisplayName] = useState("");
  const [grade, setGrade] = useState("");

  if (!isLoading && profile?.displayName && profile?.grade) {
    setLocation("/explore");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !grade) {
      toast({ variant: "destructive", title: "Hold on! ✋", description: "Please fill in your name and class before continuing." });
      return;
    }

    updateMutation.mutate(
      { data: { displayName: displayName.trim().slice(0, 50), grade } },
      {
        onSuccess: () => {
          toast({ title: "🎉 Welcome aboard!", description: "Your adventure is about to begin!" });
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

        <h1 className="font-display text-3xl font-black text-center mb-2">
          👋 Hey Explorer!
        </h1>
        <p className="text-center text-muted-foreground font-medium mb-8">
          Tell us a little about yourself to get started! 🚀
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="font-bold text-foreground block">
              What should we call you? 😎
            </label>
            <Input
              placeholder="e.g. Ahmed, Layla, or SuperStar..."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-14 rounded-2xl text-lg font-bold border-2 border-border bg-card focus-visible:border-primary/60"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-foreground block">
              Which class are you in? 🏫
            </label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger className="h-14 rounded-2xl text-lg font-bold border-2 border-border bg-card focus:border-primary/60">
                <SelectValue placeholder="Pick your class..." />
              </SelectTrigger>
              <SelectContent className="max-h-72 rounded-xl bg-card border-border">
                {GRADE_GROUPS.map(group => (
                  <SelectGroup key={group.label}>
                    <SelectLabel className="text-xs font-black text-muted-foreground uppercase tracking-wider px-2 py-1">
                      {group.label}
                    </SelectLabel>
                    {group.grades.map(g => (
                      <SelectItem key={g} value={g} className="font-bold py-2">{g}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={updateMutation.isPending || !displayName.trim() || !grade}
            className="w-full h-14 rounded-2xl text-lg font-black shadow-md transition-transform active:scale-95 neon-border"
          >
            {updateMutation.isPending ? "Getting ready..." : "Let's Go! 🚀"} <Sparkles className="w-5 h-5 ms-2" />
          </Button>
        </form>
      </div>

      <ThemeLangSwitcher />
    </div>
  );
}
