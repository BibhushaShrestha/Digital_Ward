import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api(`/api/auth/reset-password/${token}`, { method: 'POST', body: { password } });
      toast({ title: "Success", description: "Password reset successful. Please log in." });
      navigate('/login');
    } catch (e: any) {
      toast({ title: "Reset failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-center">Reset Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" />
            </div>
            <Button onClick={handleSubmit} className="w-full gradient-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Set New Password'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


