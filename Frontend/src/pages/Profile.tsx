import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function Profile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ success: boolean; data: { user: any } }>("/api/auth/me");
        setFirstName(res.data.user.firstName || "");
        setLastName(res.data.user.lastName || "");
      } catch {}
    })();
  }, []);

  const save = async () => {
    if (!firstName || !lastName) {
      toast({ title: "Invalid", description: "First and last name are required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api("/api/auth/profile", { method: 'PUT', body: { firstName, lastName }, 
  
      });
      toast({ title: "Saved", description: "Profile updated" });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first">First name</Label>
                <Input id="first" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last">Last name</Label>
                <Input id="last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <Button onClick={save} className="w-full gradient-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


