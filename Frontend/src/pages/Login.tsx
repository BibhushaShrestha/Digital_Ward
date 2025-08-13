import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  User,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Shield,
  Building,
} from "lucide-react";
import { api, auth } from "@/lib/api";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState("citizenship");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    citizenship: "",
    mobile: "",
    email: "",
    password: "",
    otp: "",
    role: "citizen",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const payload: any = { loginType, password: formData.password };
      if (loginType === 'citizenship') payload.citizenshipNumber = formData.citizenship;
      if (loginType === 'mobile') {
        payload.mobileNumber = formData.mobile;
        if (formData.otp) payload.otp = formData.otp;
      }
      if (loginType === 'email') payload.email = formData.email;

      const res = await api<{ success: boolean; data: { token: string; user: any } }>("/api/auth/login", {
        method: 'POST',
        body: payload,
      });
      auth.setToken(res.data.token);
      toast({ title: "Login Successful", description: `Welcome ${res.data.user.fullName}` });

      if (res.data.user.role === 'citizen') navigate('/');
      else navigate('/analytics');
    } catch (e: any) {
      toast({ title: "Login failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const payload = {
        firstName: formData.email.split('@')[0] || 'Citizen',
        lastName: 'User',
        citizenshipNumber: formData.citizenship || '01-0000-00000',
        mobileNumber: formData.mobile || '+9779812345678',
        email: formData.email || undefined,
        password: formData.password || 'secret12',
        dateOfBirth: '1990-01-01',
        gender: 'other',
        address: { province: 'Bagmati', district: 'Kathmandu', municipality: 'KMC', ward: 1, streetAddress: 'N/A' }
      };
      const res = await api<{ success: boolean; data: { token: string } }>("/api/auth/register", {
        method: 'POST',
        body: payload,
      });
      if (res?.data?.token) auth.setToken(res.data.token);
      toast({ title: "Registration Successful", description: "Please verify your mobile/email" });
    } catch (e: any) {
      toast({ title: "Registration failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Digital Ward System</h1>
          <p className="text-muted-foreground">Secure access to ward services</p>
        </div>

        <Card className="shadow-elegant">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Register</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="text-center">Welcome Back</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>Login as</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={formData.role === "citizen" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange("role", "citizen")}
                      className="text-xs"
                    >
                      <User className="h-3 w-3 mr-1" />
                      Citizen
                    </Button>
                    <Button
                      variant={formData.role === "staff" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange("role", "staff")}
                      className="text-xs"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Staff
                    </Button>
                    <Button
                      variant={formData.role === "admin" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange("role", "admin")}
                      className="text-xs"
                    >
                      <Building className="h-3 w-3 mr-1" />
                      Admin
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Login Method Selection */}
                <Tabs value={loginType} onValueChange={setLoginType}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="citizenship" className="text-xs">
                      <User className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Citizenship</span>
                    </TabsTrigger>
                    <TabsTrigger value="mobile" className="text-xs">
                      <Smartphone className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Mobile</span>
                    </TabsTrigger>
                    <TabsTrigger value="email" className="text-xs">
                      <Mail className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Email</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="citizenship" className="space-y-3 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="citizenship">Citizenship Number</Label>
                      <Input
                        id="citizenship"
                        placeholder="Enter citizenship number"
                        value={formData.citizenship}
                        onChange={(e) => handleChange("citizenship", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={formData.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="mobile" className="space-y-3 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input
                        id="mobile"
                        placeholder="Enter mobile number"
                        value={formData.mobile}
                        onChange={(e) => handleChange("mobile", e.target.value)}
                      />
                    </div>
                    <Button variant="outline" className="w-full">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Send OTP
                    </Button>
                    <div className="space-y-2">
                      <Label htmlFor="otp">OTP Code</Label>
                      <Input
                        id="otp"
                        placeholder="Enter OTP"
                        value={formData.otp}
                        onChange={(e) => handleChange("otp", e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="email" className="space-y-3 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-email">Password</Label>
                      <div className="relative">
                        <Input
                          id="password-email"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={formData.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button onClick={handleLogin} className="w-full gradient-primary" disabled={isLoading}>
                  <LogIn className="h-4 w-4 mr-2" />
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>

                <div className="text-center">
                  <Button variant="link" className="text-sm">
                    Forgot Password?
                  </Button>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader>
                <CardTitle className="text-center">Create Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="reg-citizenship">Citizenship Number</Label>
                    <Input
                      id="reg-citizenship"
                      placeholder="Citizenship"
                      value={formData.citizenship}
                      onChange={(e) => handleChange("citizenship", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-mobile">Mobile Number</Label>
                    <Input
                      id="reg-mobile"
                      placeholder="Mobile"
                      value={formData.mobile}
                      onChange={(e) => handleChange("mobile", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email Address (Optional)</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                  />
                </div>

                <Button onClick={handleRegister} className="w-full gradient-primary" disabled={isLoading}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isLoading ? 'Registering...' : 'Register'}
                </Button>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>© 2024 Digital Ward System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}