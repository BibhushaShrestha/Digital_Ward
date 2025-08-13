import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  MessageSquare,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  Star,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Dashboard() {
  const stats = [
    {
      title: "Active Applications",
      value: "12",
      icon: FileText,
      color: "bg-blue-500",
      change: "+2 this week",
    },
    {
      title: "Pending Complaints",
      value: "3",
      icon: MessageSquare,
      color: "bg-orange-500",
      change: "-1 from last week",
    },
    {
      title: "Upcoming Events",
      value: "5",
      icon: Calendar,
      color: "bg-green-500",
      change: "Next: Health Camp",
    },
    {
      title: "Queue Position",
      value: "#7",
      icon: Clock,
      color: "bg-purple-500",
      change: "Est. 25 mins",
    },
  ];

  const recentApplications = [
    {
      id: "APP001",
      type: "Birth Certificate",
      status: "In Progress",
      date: "2024-01-15",
      progress: 75,
    },
    {
      id: "APP002",
      type: "Marriage Certificate",
      status: "Pending Documents",
      date: "2024-01-12",
      progress: 50,
    },
    {
      id: "APP003",
      type: "Recommendation Letter",
      status: "Ready for Collection",
      date: "2024-01-10",
      progress: 100,
    },
  ];

  const quickActions = [
    {
      title: "Apply for Service",
      description: "Submit new application",
      icon: FileText,
      href: "/services",
      color: "bg-primary",
    },
    {
      title: "File Complaint",
      description: "Report an issue",
      icon: MessageSquare,
      href: "/complaints",
      color: "bg-orange-500",
    },
    {
      title: "Book Appointment",
      description: "Schedule a visit",
      icon: Clock,
      href: "/queue",
      color: "bg-blue-500",
    },
    {
      title: "View Events",
      description: "Upcoming programs",
      icon: Calendar,
      href: "/events",
      color: "bg-green-500",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-500";
      case "Pending Documents":
        return "bg-orange-500";
      case "Ready for Collection":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="gradient-hero rounded-2xl p-8 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
          <p className="text-white/90 mb-6">
            Stay updated with your applications, events, and ward services. 
            We're here to serve you better.
          </p>
          <div className="flex items-center space-x-4">
            <Badge className="bg-white/20 text-white hover:bg-white/30">
              Citizen ID: 1234567890
            </Badge>
            <Badge className="bg-success text-success-foreground">
              Verified
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="card-interactive">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/my-applications">
                  View All Applications
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium">{app.type}</h3>
                      <Badge
                        className={`${getStatusColor(app.status)} text-white`}
                      >
                        {app.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Application ID: {app.id} • {app.date}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{app.progress}%</span>
                      </div>
                      <Progress value={app.progress} className="h-2" />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/my-applications">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className="flex items-center p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className={`${action.color} p-2 rounded-lg mr-3`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{action.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Satisfaction Survey */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Rate Our Service</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                How was your recent experience with our Birth Certificate service?
              </p>
              <div className="flex space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    className="p-1"
                  >
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </Button>
                ))}
              </div>
              <Button className="w-full gradient-primary" size="sm">
                Submit Rating
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Recent Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-success/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  Your Marriage Certificate is ready for collection
                </p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  Health Camp scheduled for tomorrow at 10:00 AM
                </p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
              <Users className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  Ward meeting announcement: Community Development Discussion
                </p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}