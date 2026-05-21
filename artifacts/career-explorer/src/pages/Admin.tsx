import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAdminListUsers, useAdminBanUser, useAdminSetRole, useAdminGetStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Ban, CheckCircle, Users, Activity } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Admin() {
  const [page, setPage] = useState(1);
  const { data: stats } = useAdminGetStats();
  const { data: usersData, refetch } = useAdminListUsers({ page, limit: 20 });
  const banMutation = useAdminBanUser();
  const roleMutation = useAdminSetRole();

  const handleToggleBan = (userId: number, currentStatus: boolean) => {
    banMutation.mutate({
      userId,
      data: { banned: !currentStatus }
    }, {
      onSuccess: () => {
        refetch();
        toast({ title: currentStatus ? "User unbanned" : "User banned" });
      }
    });
  };

  const handleSetRole = (userId: number, role: string) => {
    roleMutation.mutate({
      userId,
      data: { role }
    }, {
      onSuccess: () => {
        refetch();
        toast({ title: "Role updated" });
      }
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 pb-12">
        <div className="flex items-center gap-3">
          <Shield className="w-10 h-10 text-primary" />
          <h1 className="font-display text-4xl font-black">Admin Dashboard</h1>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border-2 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <Users className="w-5 h-5" />
                <span className="font-bold">Total Users</span>
              </div>
              <div className="text-4xl font-black">{stats.totalUsers}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border-2 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <Activity className="w-5 h-5" />
                <span className="font-bold">Active This Week</span>
              </div>
              <div className="text-4xl font-black">{stats.activeThisWeek}</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border-2 shadow-sm overflow-hidden">
          <div className="p-6 border-b-2 bg-muted/10">
            <h2 className="font-display text-2xl font-black">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Email</TableHead>
                  <TableHead className="font-bold">Grade</TableHead>
                  <TableHead className="font-bold">Role</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData?.users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-bold">{user.displayName}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>{user.grade}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-bold">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <Badge variant="destructive" className="font-bold">Banned</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-500 font-bold">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            const role = prompt("Enter new role (Explorer, 5B Sigma, Sigma Boy, Legend):", user.role);
                            if (role) handleSetRole(user.id, role);
                          }}
                        >
                          Change Role
                        </Button>
                        <Button 
                          size="sm" 
                          variant={user.isBanned ? "outline" : "destructive"}
                          onClick={() => handleToggleBan(user.id, user.isBanned)}
                        >
                          {user.isBanned ? <CheckCircle className="w-4 h-4 mr-1" /> : <Ban className="w-4 h-4 mr-1" />}
                          {user.isBanned ? "Unban" : "Ban"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 border-t-2 flex justify-between items-center bg-muted/10">
            <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} variant="outline">Previous</Button>
            <span className="font-bold text-sm">Page {page} of {Math.ceil((usersData?.total || 0) / (usersData?.limit || 20))}</span>
            <Button disabled={usersData?.users.length !== usersData?.limit} onClick={() => setPage(p => p + 1)} variant="outline">Next</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}