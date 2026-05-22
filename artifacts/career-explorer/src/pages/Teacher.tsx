import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookOpen, Users, Trophy, TrendingUp, Star, School, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TeacherStats {
  totalStudents: number;
  totalCareers: number;
  completedJourneys: number;
  gradeBreakdown: Record<string, number>;
  topStudents: { displayName: string; grade: string; completedCareers: number }[];
}

interface Student {
  id: number;
  clerkId: string;
  displayName: string;
  email: string;
  grade: string;
  role: string;
  isSchoolAccount: boolean;
  isBanned: boolean;
  completedCareers: number;
  activeCareers: number;
  totalCareers: number;
  careers: { careerId: number; careerTitle: string; completed: boolean; completedSteps: number; totalSteps: number }[];
  joinedAt: string;
}

export default function Teacher() {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterGrade, setFilterGrade] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/teacher/stats", { credentials: "include" }).then(r => r.json()),
      fetch("/api/teacher/students", { credentials: "include" }).then(r => r.json()),
    ]).then(([statsData, studentsData]) => {
      setStats(statsData);
      setStudents(studentsData.students ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = !q || s.displayName.toLowerCase().includes(q) || s.grade.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchesGrade = !filterGrade || s.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const grades = Array.from(new Set(students.map(s => s.grade).filter(Boolean))).sort();

  if (loading) return (
    <AppLayout>
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 pb-12">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-accent/20 border border-accent/30 rounded-2xl flex items-center justify-center neon-border-accent">
            <School className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-black text-foreground">Teacher Panel</h1>
            <p className="text-muted-foreground font-medium">Mr Saeed · Teacher of 5B · Wales International British School</p>
          </div>
          <Badge className="ml-auto bg-accent/20 text-accent border border-accent/30 font-black px-4 py-2 text-sm">
            🎓 Mr Saeed
          </Badge>
        </div>

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 neon-border">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-bold text-xs uppercase tracking-wider">Total Students</span>
              </div>
              <div className="text-4xl font-black text-primary">{stats.totalStudents}</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <BookOpen className="w-5 h-5 text-secondary" />
                <span className="font-bold text-xs uppercase tracking-wider">Careers</span>
              </div>
              <div className="text-4xl font-black text-secondary">{stats.totalCareers}</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <Trophy className="w-5 h-5 text-accent" />
                <span className="font-bold text-xs uppercase tracking-wider">Completed</span>
              </div>
              <div className="text-4xl font-black text-accent">{stats.completedJourneys}</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-bold text-xs uppercase tracking-wider">Classes</span>
              </div>
              <div className="text-4xl font-black text-primary">{Object.keys(stats.gradeBreakdown).length}</div>
            </div>
          </div>
        )}

        {/* Top students */}
        {stats?.topStudents && stats.topStudents.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border bg-accent/5">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                <h2 className="font-display text-xl font-black">🏆 Top Explorers</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Students who have completed the most career journeys</p>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {stats.topStudents.map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/10 border border-border">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shrink-0 ${
                    i === 0 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                    i === 1 ? "bg-slate-400/20 text-slate-300 border border-slate-400/30" :
                    i === 2 ? "bg-orange-600/20 text-orange-400 border border-orange-600/30" :
                    "bg-muted/20 text-muted-foreground border border-border"
                  }`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-foreground">{s.displayName}</div>
                    <div className="text-sm text-muted-foreground">{s.grade}</div>
                  </div>
                  <Badge className="bg-accent/20 text-accent border border-accent/30 font-black shrink-0">
                    {s.completedCareers} careers ✓
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student list */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border bg-primary/5">
            <h2 className="font-display text-xl font-black mb-3">All Students</h2>
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, class, or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 rounded-xl border-border bg-muted/20 font-medium"
                />
              </div>
              <select
                value={filterGrade}
                onChange={e => setFilterGrade(e.target.value)}
                className="rounded-xl border border-border bg-muted/20 font-bold text-sm px-3 py-2 text-foreground"
              >
                <option value="">All Classes</option>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Showing {filtered.length} of {students.length} students
            </p>
          </div>

          <div className="divide-y divide-border">
            {filtered.map(student => (
              <div key={student.id} className="p-4">
                <div
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === student.id ? null : student.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="font-black text-primary text-sm">
                      {student.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-foreground">{student.displayName}</span>
                      {student.isSchoolAccount && (
                        <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold">🏫 School</Badge>
                      )}
                      {student.isBanned && (
                        <Badge className="bg-destructive/20 text-destructive border border-destructive/30 text-xs font-bold">Banned</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">{student.grade || "No class set"}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-black text-accent">{student.completedCareers} done ✓</div>
                    <div className="text-xs text-muted-foreground">{student.activeCareers} in progress</div>
                  </div>
                  {expandedId === student.id ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </div>

                {expandedId === student.id && (
                  <div className="mt-3 pl-14 animate-in slide-in-from-top-2 duration-200">
                    <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Career Progress</div>
                    {student.careers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No careers started yet</p>
                    ) : (
                      <div className="space-y-2">
                        {student.careers.map(c => (
                          <div key={c.careerId} className="flex items-center gap-3 p-2 rounded-lg bg-muted/10 border border-border text-sm">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${c.completed ? "bg-accent" : "bg-primary"}`} />
                            <span className="font-bold text-foreground flex-1">{c.careerTitle}</span>
                            {c.completed ? (
                              <Badge className="bg-accent/20 text-accent border border-accent/30 text-xs font-bold">Completed ✓</Badge>
                            ) : (
                              <span className="text-muted-foreground font-medium">{c.completedSteps}/{c.totalSteps} steps</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">Joined: {new Date(student.joinedAt).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-muted-foreground font-medium">
                No students found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
