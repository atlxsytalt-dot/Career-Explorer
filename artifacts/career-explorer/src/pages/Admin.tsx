import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAdminListUsers, useAdminSetRole, useAdminGetStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Ban, CheckCircle, Users, Activity, Megaphone, Trash2, Zap, Clock, School, Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Announcement {
  id: number;
  message: string;
  active: boolean;
  createdAt: string;
}

function BroadcastSection() {
  const [message, setMessage] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = () => {
    fetch("/api/admin/announcements", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(setAnnouncements)
      .catch(() => {});
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleBroadcast = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      if (res.ok) {
        toast({ title: "📢 Broadcast sent!", description: "All users will see your message." });
        setMessage("");
        fetchAnnouncements();
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ variant: "destructive", title: "Failed to send", description: err.error ?? "Check your connection." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      toast({ title: "Announcement removed" });
      fetchAnnouncements();
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border bg-secondary/5">
        <div className="flex items-center gap-3 mb-1">
          <Megaphone className="w-6 h-6 text-secondary" style={{ filter: "drop-shadow(0 0 8px hsl(270 100% 65% / 0.6))" }} />
          <h2 className="font-display text-2xl font-black text-foreground">Broadcast Announcement</h2>
        </div>
        <p className="text-sm text-muted-foreground font-medium">Send a message that appears as a banner for all users.</p>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex gap-3">
          <Input
            placeholder="e.g. 'Career Fair is on Friday! Come explore! 🎉'"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleBroadcast()}
            className="rounded-xl border-border bg-muted/30 focus:border-secondary font-medium flex-1"
            maxLength={500}
          />
          <Button
            onClick={handleBroadcast}
            disabled={loading || !message.trim()}
            className="rounded-xl font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 shrink-0"
            style={{ boxShadow: "0 0 15px hsl(270 100% 65% / 0.3)" }}
          >
            <Zap className="w-4 h-4 mr-2" />
            Broadcast
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{message.length}/500 characters</p>

        {announcements.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Announcements</p>
            {announcements.map(a => (
              <div key={a.id} className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium ${a.active ? "border-secondary/30 bg-secondary/5 text-foreground" : "border-border bg-muted/20 text-muted-foreground"}`}>
                <div className="flex-1">
                  {a.active && <Badge className="mr-2 bg-secondary/20 text-secondary border-secondary/30 text-xs font-bold">LIVE</Badge>}
                  {a.message}
                </div>
                {a.active && (
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(a.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type TabType = "all" | "school" | "external";

export default function Admin() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<TabType>("all");
  const { data: stats } = useAdminGetStats();
  const { data: usersData, refetch } = useAdminListUsers({ page, limit: 50 });
  const roleMutation = useAdminSetRole();

  const [banTarget, setBanTarget] = useState<{ clerkId: string; name: string } | null>(null);
  const [banDuration, setBanDuration] = useState("forever");
  const [banReason, setBanReason] = useState("");
  const [banning, setBanning] = useState(false);

  const performBan = async (clerkId: string, banned: boolean, duration?: string, reason?: string) => {
    setBanning(true);
    try {
      const res = await fetch(`/api/admin/users/${clerkId}/ban`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned, reason: reason ?? null, duration: banned ? duration : undefined }),
      });
      if (res.ok) {
        refetch();
        toast({ title: banned ? `User banned ${duration !== "forever" ? `for ${duration}` : "permanently"} ✗` : "User unbanned ✓" });
        setBanTarget(null);
        setBanReason("");
        setBanDuration("forever");
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ variant: "destructive", title: "Action failed", description: err.error });
      }
    } finally {
      setBanning(false);
    }
  };

  const handleUnban = (clerkId: string) => {
    performBan(clerkId, false);
  };

  const handleDelete = async (clerkId: string, name: string) => {
    if (!confirm(`Delete ${name}'s account? They can re-register, but all their progress will be lost.`)) return;
    const res = await fetch(`/api/admin/users/${clerkId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      refetch();
      toast({ title: `${name}'s account deleted` });
    } else {
      const err = await res.json().catch(() => ({}));
      toast({ variant: "destructive", title: "Delete failed", description: err.error });
    }
  };

  const handleSetRole = (userId: string, currentRole: string) => {
    const roles = ["Explorer", "5B Sigma", "Sigma Boy", "Legend", "Pro"];
    const role = prompt(`Set role for user:\n${roles.join(" | ")}`, currentRole);
    if (!role || !roles.includes(role)) return;
    roleMutation.mutate({ userId, data: { role } }, {
      onSuccess: () => {
        refetch();
        toast({ title: `Role updated to: ${role}` });
      }
    });
  };

  // Filter by tab
  const allUsers = usersData?.users ?? [];
  const filteredUsers = tab === "school"
    ? allUsers.filter(u => u.email.endsWith("@walesschool.com"))
    : tab === "external"
      ? allUsers.filter(u => !u.email.endsWith("@walesschool.com"))
      : allUsers;

  const schoolCount = allUsers.filter(u => u.email.endsWith("@walesschool.com")).length;
  const externalCount = allUsers.filter(u => !u.email.endsWith("@walesschool.com")).length;

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 pb-12">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-secondary/20 border border-secondary/30 rounded-2xl flex items-center justify-center" style={{ boxShadow: "0 0 20px hsl(270 100% 65% / 0.3)" }}>
            <Shield className="w-7 h-7 text-secondary" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-black text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground font-medium">Wales International British School · Career Explorer</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl p-6 neon-border">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-bold text-sm uppercase tracking-wider">Total Users</span>
              </div>
              <div className="text-5xl font-black text-primary" style={{ textShadow: "0 0 20px hsl(185 100% 50% / 0.5)" }}>
                {stats.totalUsers}
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <Activity className="w-5 h-5 text-accent" />
                <span className="font-bold text-sm uppercase tracking-wider">Joined This Week</span>
              </div>
              <div className="text-5xl font-black text-accent" style={{ textShadow: "0 0 20px hsl(142 100% 50% / 0.5)" }}>
                {stats.activeThisWeek}
              </div>
            </div>
          </div>
        )}

        <BroadcastSection />

        {/* Ban Modal */}
        {banTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setBanTarget(null)}>
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="font-display text-xl font-black mb-1">Ban {banTarget.name}</h3>
              <p className="text-sm text-muted-foreground mb-5">Choose how long and why. The user will see this reason.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Duration</label>
                  <Select value={banDuration} onValueChange={setBanDuration}>
                    <SelectTrigger className="rounded-xl border-border bg-muted/20 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="1" className="font-bold">1 Day</SelectItem>
                      <SelectItem value="3" className="font-bold">3 Days</SelectItem>
                      <SelectItem value="7" className="font-bold">1 Week</SelectItem>
                      <SelectItem value="14" className="font-bold">2 Weeks</SelectItem>
                      <SelectItem value="30" className="font-bold">30 Days</SelectItem>
                      <SelectItem value="forever" className="font-bold text-destructive">Permanent Ban</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Reason (optional)</label>
                  <Input
                    placeholder="e.g. Violated rules, inappropriate behaviour..."
                    value={banReason}
                    onChange={e => setBanReason(e.target.value)}
                    className="rounded-xl border-border bg-muted/20 font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setBanTarget(null)} className="flex-1 rounded-xl font-bold border-border">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => performBan(banTarget.clerkId, true, banDuration, banReason || undefined)}
                    disabled={banning}
                    className="flex-1 rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    {banning ? "Banning..." : "Confirm Ban"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border bg-primary/5">
            <h2 className="font-display text-2xl font-black text-foreground">User Management</h2>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              {usersData?.total ?? 0} total accounts
            </p>

            {/* Tabs */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {(["all", "school", "external"] as TabType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border ${
                    tab === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {t === "school" ? <School className="w-4 h-4" /> : t === "external" ? <Globe className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  {t === "all" ? `All (${allUsers.length})` : t === "school" ? `School (${schoolCount})` : `External (${externalCount})`}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-bold text-muted-foreground">Name</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Email</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Class</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Role</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Status</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id} className="border-border hover:bg-primary/3">
                    <TableCell className="font-bold text-foreground">
                      {user.displayName}
                      {(user as any).isSchoolAccount && (
                        <span className="ml-2 text-xs text-primary font-black">🏫</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{user.grade || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`font-bold text-xs border ${
                          user.role === "admin" ? "border-secondary/50 text-secondary bg-secondary/10" :
                          user.role === "mr_saeed" ? "border-accent/50 text-accent bg-accent/10" :
                          user.role?.includes("Sigma") ? "border-primary/50 text-primary bg-primary/10" :
                          user.role === "Legend" ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10" :
                          "border-border text-muted-foreground"
                        }`}
                      >
                        {user.role === "mr_saeed" ? "🎓 Mr Saeed" : user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <div>
                          <Badge className="bg-destructive/20 text-destructive border border-destructive/30 font-bold text-xs">Banned</Badge>
                          {(user as any).banUntil && (
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Until {new Date((user as any).banUntil).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Badge className="bg-accent/10 text-accent border border-accent/30 font-bold text-xs">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetRole(user.clerkId, user.role)}
                          className="rounded-lg font-bold border-border text-muted-foreground hover:text-primary hover:border-primary/50 text-xs px-2"
                          title="Change role"
                        >
                          Role
                        </Button>
                        {user.isBanned ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnban(user.clerkId)}
                            className="rounded-lg font-bold text-xs px-2 border-accent/50 text-accent hover:bg-accent/10"
                            title="Unban user"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Unban
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setBanTarget({ clerkId: user.clerkId, name: user.displayName }); }}
                            disabled={user.role === "admin"}
                            className="rounded-lg font-bold text-xs px-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                            title="Ban user"
                          >
                            <Ban className="w-3 h-3 mr-1" /> Ban
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user.clerkId, user.displayName)}
                          disabled={user.role === "admin"}
                          className="rounded-lg font-bold text-xs px-2 border-red-900/50 text-red-400 hover:bg-red-950/20"
                          title="Delete account"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground font-medium">
                      No users in this category.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 border-t border-border flex justify-between items-center bg-muted/10">
            <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} variant="outline" size="sm" className="rounded-xl font-bold border-border">← Prev</Button>
            <span className="font-bold text-sm text-muted-foreground">Page {page}</span>
            <Button disabled={(usersData?.users.length ?? 0) < 50} onClick={() => setPage(p => p + 1)} variant="outline" size="sm" className="rounded-xl font-bold border-border">Next →</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
