import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { api, auth } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Info,
  FileText,
  Users,
  MessageSquare,
  Radio,
  Calendar,
  Clock,
  BarChart3,
  Globe,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  FolderOpen,
  CheckSquare,
} from "lucide-react";

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "About Ward", href: "/about", icon: Info },
  { name: "Services", href: "/services", icon: FileText },
  
  { name: "Digital Locker", href: "/digital-locker", icon: FolderOpen },
  { name: "Staff Status", href: "/staff-status", icon: Users },
  { name: "Complaints", href: "/complaints", icon: MessageSquare },
  
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    const token = auth.getToken();
    if (!token) return;
    (async () => {
      try {
        const res = await api<{ success: boolean; data: { user: any } }>("/api/auth/me");
        setCurrentUser(res.data.user);
      } catch {
        // ignore
      }
    })();
  }, [location.pathname]);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "np" : "en");
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/95 shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">
                Digital Ward
              </span>
              <span className="text-xs text-muted-foreground">
                {language === "en" ? "Smart Governance" : "स्मार्ट शासन"}
              </span>
            </div>
          </Link>

           {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.slice(0, 7).map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item ${
                    isActivePath(item.href) ? "active" : ""
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
            
            {/* More Menu */}
           
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex"
            >
              <Globe className="h-4 w-4 mr-2" />
              <span className="text-lg">{language === "en" ? "🇬🇧" : "🇳🇵"}</span>
            </Button>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {(currentUser?.firstName?.[0] || 'J').toUpperCase()}{(currentUser?.lastName?.[0] || 'D').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-success text-success-foreground"
                  >
                    C
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{currentUser?.fullName || 'Guest User'}</p>
                    {currentUser?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {currentUser.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/my-applications" className="flex items-center space-x-2">
                    <CheckSquare className="h-4 w-4" />
                    <span>My Applications</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/digital-locker" className="flex items-center space-x-2">
                    <FolderOpen className="h-4 w-4" />
                    <span>Digital Locker</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); auth.clearToken(); window.location.href = '/login'; }}>
                  <div className="text-destructive flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-item ${
                      isActivePath(item.href) ? "active" : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleLanguage}
                  className="w-full justify-start"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  <span className="text-lg mr-2">{language === "en" ? "🇬🇧" : "🇳🇵"}</span>
                  {language === "en" ? "English" : "नेपाली"}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}