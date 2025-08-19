import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email) {
      toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await api<any>("/api/auth/forgot-password", { method: 'POST', body: { email } });
      toast({ title: "Check your email", description: res.message || 'If an account exists, a reset link was sent.' });
      if (res?.data?.resetToken) setDevToken(res.data.resetToken);
    } catch (e: any) {
      toast({ title: "Request failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-center">Forgot Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <Button onClick={handleSubmit} className="w-full gradient-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            {devToken && (
              <div className="text-xs text-muted-foreground">
                Dev token: <button className="underline" onClick={() => navigate(`/reset-password/${devToken}`)}>open reset page</button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


