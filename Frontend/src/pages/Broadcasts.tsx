import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Radio,
  AlertTriangle,
  Info,
  Calendar,
  Search,
  Bell,
  Volume2,
  Clock,
} from "lucide-react";

export function Broadcasts() {
  const broadcasts = [
    {
      id: 1,
      title: "Emergency Water Supply Disruption",
      message: "Water supply will be disrupted tomorrow (Jan 22) from 6 AM to 2 PM due to pipeline maintenance. Alternative water sources will be available at community centers.",
      type: "Emergency",
      date: "2024-01-21",
      time: "09:30 AM",
      priority: "High",
      icon: AlertTriangle,
      color: "bg-red-500",
    },
    {
      id: 2,
      title: "Health Camp Announcement",
      message: "Free health checkup camp on January 25th at Ward Office premises. Services include general checkup, blood pressure monitoring, and diabetes screening. Registration starts at 8 AM.",
      type: "General",
      date: "2024-01-20",
      time: "02:15 PM", 
      priority: "Medium",
      icon: Info,
      color: "bg-blue-500",
    },
    {
      id: 3,
      title: "Ward Committee Meeting",
      message: "Monthly ward committee meeting scheduled for January 22nd at 2 PM in the community hall. Citizens are welcome to attend and raise their concerns.",
      type: "Scheduled",
      date: "2024-01-19",
      time: "11:00 AM",
      priority: "Medium",
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      id: 4,
      title: "Tax Collection Deadline Extended",
      message: "Due to technical issues, the property tax collection deadline has been extended to January 31st. Citizens can pay online or visit the ward office during business hours.",
      type: "General",
      date: "2024-01-18",
      time: "04:45 PM",
      priority: "Low",
      icon: Info,
      color: "bg-blue-500",
    },
    {
      id: 5,
      title: "Road Closure Notice",
      message: "Main road from intersection A to intersection B will be closed for construction from January 23-25. Please use alternative routes. Emergency services will remain accessible.",
      type: "Emergency",
      date: "2024-01-17",
      time: "08:20 AM",
      priority: "High",
      icon: AlertTriangle,
      color: "bg-red-500",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-orange-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Emergency":
        return "bg-red-100 text-red-800 border-red-300";
      case "General":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Scheduled":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ward Broadcasts</h1>
        <p className="text-muted-foreground">
          Stay informed with official announcements and important updates
        </p>
      </div>

      {/* Alert Settings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-medium">Emergency Alerts</div>
                  <div className="text-sm text-muted-foreground">SMS + In-app</div>
                </div>
              </div>
              <Badge className="bg-green-500 text-white">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Info className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">General Updates</div>
                  <div className="text-sm text-muted-foreground">In-app only</div>
                </div>
              </div>
              <Badge className="bg-green-500 text-white">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Volume2 className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="font-medium">Voice Announcements</div>
                  <div className="text-sm text-muted-foreground">Public Address</div>
                </div>
              </div>
              <Badge variant="secondary">Available</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search broadcasts..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Broadcasts List */}
      <div className="space-y-6">
        {broadcasts.map((broadcast) => {
          const IconComponent = broadcast.icon;
          return (
            <Card key={broadcast.id} className="hover:shadow-medium transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`${broadcast.color} p-3 rounded-lg flex-shrink-0`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">{broadcast.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getPriorityColor(broadcast.priority)} text-white`}>
                          {broadcast.priority}
                        </Badge>
                        <Badge className={getTypeColor(broadcast.type)}>
                          {broadcast.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {broadcast.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{broadcast.date}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{broadcast.time}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Bell className="h-4 w-4 mr-2" />
                          Set Reminder
                        </Button>
                        <Button variant="outline" size="sm">
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Broadcast Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {broadcasts.filter(b => b.type === "Emergency").length}
              </div>
              <div className="text-sm text-muted-foreground">Emergency Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {broadcasts.filter(b => b.type === "General").length}
              </div>
              <div className="text-sm text-muted-foreground">General Updates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {broadcasts.filter(b => b.type === "Scheduled").length}
              </div>
              <div className="text-sm text-muted-foreground">Scheduled Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {broadcasts.filter(b => b.priority === "High").length}
              </div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}