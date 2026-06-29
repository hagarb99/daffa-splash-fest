import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listAllUsers, deleteUser, getUserActivity } from "@/lib/admin-users.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Activity, Shield } from "lucide-react";

type Role = "admin" | "user";

type UserRow = {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string | null;
  confirmed: boolean;
  roles: string[];
  profile: { full_name?: string | null; phone?: string | null } | null;
  bookings: Array<{ id: string; status: string; total_price: number; created_at: string }>;
};

export function UsersAdmin() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [granting, setGranting] = useState<{ userId: string; role: Role }>({ userId: "", role: "admin" });
  const [activity, setActivity] = useState<{ open: boolean; user?: UserRow; bookings: any[] }>({ open: false, bookings: [] });

  const list = useServerFn(listAllUsers);
  const del = useServerFn(deleteUser);
  const getAct = useServerFn(getUserActivity);

  const load = async () => {
    setLoading(true);
    try {
      const data = await list();
      setUsers(data as UserRow[]);
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const grantRole = async () => {
    if (!granting.userId) return toast.error("Select a user");
    const { error } = await supabase.from("user_roles").insert({ user_id: granting.userId, role: granting.role });
    if (error) return toast.error(error.message);
    toast.success("Role granted"); load();
  };

  const revokeRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as Role);
    if (error) return toast.error(error.message);
    toast.success("Role revoked"); load();
  };

  const removeUser = async (u: UserRow) => {
    if (u.roles.includes("admin")) return toast.error("Cannot delete an admin user. Revoke the admin role first.");
    if (!confirm(`Delete user ${u.email}? This removes their bookings too.`)) return;
    try { await del({ data: { user_id: u.id } }); toast.success("User deleted"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const viewActivity = async (u: UserRow) => {
    try {
      const res = await getAct({ data: { user_id: u.id } });
      setActivity({ open: true, user: u, bookings: res.bookings });
    } catch (e: any) { toast.error(e.message); }
  };

  const filtered = users.filter((u) =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.id.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-2xl font-bold">Users ({users.length})</h3>
        <Input placeholder="Search by email / name / id…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <div className="bg-card rounded-2xl shadow-elegant p-4 space-y-3">
        <div className="grid sm:grid-cols-[2fr_1fr_auto] gap-2 items-end">
          <div>
            <Label>Grant role to user</Label>
            <Select value={granting.userId} onValueChange={(v) => setGranting((g) => ({ ...g, userId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select user…" /></SelectTrigger>
              <SelectContent>
                {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.email ?? u.id}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Role</Label>
            <Select value={granting.role} onValueChange={(v) => setGranting((g) => ({ ...g, role: v as Role }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="admin">admin</SelectItem><SelectItem value="user">user</SelectItem></SelectContent>
            </Select>
          </div>
          <Button onClick={grantRole} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 me-1" /> Grant</Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-card rounded-2xl shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3 text-start">Email</th>
              <th className="p-3 text-start">Name</th>
              <th className="p-3 text-start">Phone</th>
              <th className="p-3 text-start">Roles</th>
              <th className="p-3 text-start">Bookings</th>
              <th className="p-3 text-start">Last sign-in</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
              : filtered.map((u) => (
                <tr key={u.id} className="border-t border-border align-top">
                  <td className="p-3">
                    <div className="font-medium">{u.email}</div>
                    <div className="text-xs text-muted-foreground font-mono">{u.id.slice(0, 8)}…</div>
                  </td>
                  <td className="p-3">{u.profile?.full_name ?? "—"}</td>
                  <td className="p-3">{u.profile?.phone ?? "—"}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.length === 0 && <span className="text-muted-foreground">user</span>}
                      {u.roles.map((r) => (
                        <Badge key={r} variant="secondary" className="cursor-pointer" onClick={() => revokeRole(u.id, r)} title="Click to revoke">
                          <Shield className="h-3 w-3 me-1" />{r} ×
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">{u.bookings.length}</td>
                  <td className="p-3 text-xs">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "Never"}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => viewActivity(u)} title="View activity"><Activity className="h-4 w-4" /></Button>
                      {!u.roles.includes("admin") && (
                        <Button size="icon" variant="ghost" onClick={() => removeUser(u)} title="Delete user"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Dialog open={activity.open} onOpenChange={(o) => setActivity((a) => ({ ...a, open: o }))}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>Activity — {activity.user?.email}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {activity.bookings.length === 0 && <p className="text-muted-foreground">No bookings yet.</p>}
            {activity.bookings.map((b) => (
              <div key={b.id} className="border border-border rounded-lg p-3 text-sm">
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="font-medium">{b.activities?.name_en ?? b.packages?.name_en ?? "Booking"}</div>
                    <div className="text-xs text-muted-foreground">
                      {b.time_slots ? `${b.time_slots.slot_date} · ${b.time_slots.start_time}–${b.time_slots.end_time}` : b.booking_date ?? ""}
                    </div>
                    <div className="text-xs text-muted-foreground">Persons: {b.persons} · {b.contact_phone ?? ""}</div>
                  </div>
                  <div className="text-end">
                    <Badge>{b.status}</Badge>
                    <div className="text-xs mt-1">{b.total_price} EGP</div>
                    <div className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
