import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetMyProfile, useUpdateMyProfile, useGetMyProgress, useListCareers } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Trophy, Map, Settings, Edit3, ShieldAlert } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const { data: profile, refetch: refetchProfile } = useGetMyProfile();
  const { data: progress } = useGetMyProgress();
  const { data: careers } = useListCareers();
  const updateMutation = useUpdateMyProfile();

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
    updateMutation.mutate({
      data: { displayName, grade }
    }, {
      onSuccess: () => {
        setIsEditing(false);
        refetchProfile();
        toast({ title: "Profile updated!" });
      }
    });
  };

  const completedCareers = progress?.filter(p => p.completed) || [];
  const inProgressCareers = progress?.filter(p => !p.completed) || [];

  if (!profile) return <AppLayout><div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div></AppLayout>;

  const getBadgeColor = (role: string) => {
    if (role.includes("Sigma")) return "bg-purple-100 text-purple-700 border-purple-300 shadow-purple-500/20";
    if (role.includes("Admin")) return "bg-red-100 text-red-700 border-red-300 shadow-red-500/20";
    if (role.includes("Legend")) return "bg-accent/20 text-accent-foreground border-accent shadow-accent/20";
    return "bg-blue-100 text-blue-700 border-blue-300 shadow-blue-500/20";
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
        <div className="bg-white rounded-3xl border-2 border-muted p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center border-4 border-white shadow-lg shrink-0">
              <User className="w-12 h-12 text-muted-foreground" />
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="grid gap-4 bg-muted/30 p-4 rounded-2xl border border-muted">
                  <div>
                    <Label className="font-bold text-muted-foreground">Display Name</Label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="rounded-xl border-2 font-bold" />
                  </div>
                  <div>
                    <Label className="font-bold text-muted-foreground">Grade / Class</Label>
                    <Input value={grade} onChange={(e) => setGrade(e.target.value)} className="rounded-xl border-2 font-bold" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button onClick={handleSave} disabled={updateMutation.isPending} className="rounded-xl font-bold px-6">Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl font-bold px-6">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-display text-4xl font-black mb-1">{profile.displayName}</h1>
                    <p className="text-muted-foreground font-bold text-lg mb-3">{profile.grade}</p>
                    <div className={`inline-flex items-center px-4 py-1.5 rounded-full border-2 font-black text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(0,0,0,0.1)] ${getBadgeColor(profile.role)}`}>
                      <ShieldAlert className="w-4 h-4 mr-2" /> {profile.role}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="rounded-full">
                    <Edit3 className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border-2 border-muted p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-8 h-8 text-accent" />
              <h2 className="font-display text-2xl font-black">Achievements</h2>
            </div>
            <div className="text-5xl font-black text-foreground mb-2">{completedCareers.length}</div>
            <p className="text-muted-foreground font-bold uppercase tracking-wider text-sm">Careers Completed</p>
          </div>
          
          <div className="bg-white rounded-3xl border-2 border-muted p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Map className="w-8 h-8 text-primary" />
              <h2 className="font-display text-2xl font-black">In Progress</h2>
            </div>
            <div className="text-5xl font-black text-foreground mb-2">{inProgressCareers.length}</div>
            <p className="text-muted-foreground font-bold uppercase tracking-wider text-sm">Active Journeys</p>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}