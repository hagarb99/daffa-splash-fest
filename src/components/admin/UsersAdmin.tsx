import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

type Role = "admin" | "user";
type Row = { id: string; user_id: string; role: Role };

export function UsersAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<Role>("admin");

  const load = async () => {
    const { data } = await supabase.from("user_roles").select("*").order("role");
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!userId) return toast.error("Enter user ID (UUID)");
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) return toast.error(error.message);
    toast.success("Role granted"); setUserId(""); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Remove role?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) return toast.error(error.message); load();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display text-2xl font-bold">User Roles</h3>
      <div className="bg-card rounded-2xl shadow-elegant p-4 space-y-3">
        <p className="text-sm text-muted-foreground">Grant a role by user ID (UUID). Find user IDs in Backend → Users.</p>
        <div className="grid sm:grid-cols-[2fr_1fr_auto] gap-2 items-end">
          <div><Label>User ID</Label><Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="00000000-0000-…" /></div>
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="admin">admin</SelectItem><SelectItem value="user">user</SelectItem></SelectContent>
            </Select>
          </div>
          <Button onClick={add} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 me-1" /> Grant</Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-card rounded-2xl shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground"><tr><th className="p-3 text-start">User ID</th><th className="p-3 text-start">Role</th><th className="p-3"></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">{r.user_id}</td>
                <td className="p-3">{r.role}</td>
                <td className="p-3"><Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
