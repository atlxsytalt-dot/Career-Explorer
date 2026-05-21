import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAdminListUsers, useAdminBanUser, useAdminSetRole, useAdminGetStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Ban, CheckCircle, Users, Activity, Megaphone, Trash2, Zap } from "lucide-react";
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
    fetch("/api/admin/announcements")
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      if (res.ok) {
        toast({ title: "📢 Broadcast sent!", description: "All users will see your message." });
        setMessage("");
        fetchAnnouncements();
      } else {
        toast({ variant: "destructive", title: "Failed to send broadcast" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Announcement dismissed" });
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
        <p className="text-sm text-muted-foreground font-medium">Send a message that appears as a banner for all users on the platform.</p>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex gap-3">
          <Input
            placeholder="Type your announcement here... e.g. 'Career Fair is on Friday! Come explore!'"
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
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recent Announcements</p>
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

export default function Admin() {
  const [page, setPage] = useState(1);
  const { data: stats } = useAdminGetStats();
  const { data: usersData, refetch } = useAdminListUsers({ page, limit: 20 });
  const banMutation = useAdminBanUser();
  const roleMutation = useAdminSetRole();

  const handleToggleBan = (userId: number, currentStatus: boolean) => {
    banMutation.mutate({ userId, data: { banned: !currentStatus } }, {
      onSuccess: () => {
        refetch();
        toast({ title: currentStatus ? "User unbanned ✓" : "User banned ✗" });
      }
    });
  };

  const handleSetRole = (userId: number, currentRole: string) => {
    const roles = ["Explorer", "5B Sigma", "Sigma Boy", "Legend", "Pro", "Admin"];
    const role = prompt(`Enter new role for user:\n${roles.join(" | ")}`, currentRole);
    if (!role) return;
    roleMutation.mutate({ userId, data: { role } }, {
      onSuccess: () => {
        refetch();
        toast({ title: `Role updated to: ${role}` });
      }
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 pb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-secondary/20 border border-secondary/30 rounded-2xl flex items-center justify-center neon-border-purple">
            <Shield className="w-7 h-7 text-secondary" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-black text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground font-medium">Wales School · Career Explorer</p>
          </div>
        </div>

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

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border bg-primary/5">
            <h2 className="font-display text-2xl font-black text-foreground">User Management</h2>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              {usersData?.total ?? 0} total accounts registered
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-bold text-muted-foreground">Name</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Email</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Grade</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Role</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Status</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData?.users.map(user => (
                  <TableRow key={user.id} className="border-border hover:bg-primary/3">
                    <TableCell className="font-bold text-foreground">{user.displayName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground">{user.grade || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`font-bold text-xs border ${
                          user.role === "admin" ? "border-secondary/50 text-secondary bg-secondary/10" :
                          user.role.includes("Sigma") ? "border-primary/50 text-primary bg-primary/10" :
                          user.role === "Legend" ? "border-accent/50 text-accent bg-accent/10" :
                          "border-border text-muted-foreground"
                        }`}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <Badge className="bg-destructive/20 text-destructive border border-destructive/30 font-bold">Banned</Badge>
                      ) : (
                        <Badge className="bg-accent/10 text-accent border border-accent/30 font-bold">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetRole(user.id, user.role)}
                          className="rounded-lg font-bold border-border text-muted-foreground hover:text-primary hover:border-primary/50 text-xs"
                        >
                          Role
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleBan(user.id, user.isBanned)}
                          className={`rounded-lg font-bold text-xs ${user.isBanned
                            ? "border-accent/50 text-accent hover:bg-accent/10"
                            : "border-destructive/50 text-destructive hover:bg-destructive/10"}`}
                        >
                          {user.isBanned ? <><CheckCircle className="w-3 h-3 mr-1" /> Unban</> : <><Ban className="w-3 h-3 mr-1" /> Ban</>}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!usersData?.users.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground font-medium">
                      No users registered yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 border-t border-border flex justify-between items-center bg-muted/10">
            <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} variant="outline" size="sm" className="rounded-xl font-bold border-border">← Prev</Button>
            <span className="font-bold text-sm text-muted-foreground">Page {page}</span>
            <Button disabled={(usersData?.users.length ?? 0) < (usersData?.limit ?? 20)} onClick={() => setPage(p => p + 1)} variant="outline" size="sm" className="rounded-xl font-bold border-border">Next →</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
