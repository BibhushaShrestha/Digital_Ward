import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Filter,
  Bell,
  Plus,
  Heart,
  GraduationCap,
  Building,
  Stethoscope,
} from "lucide-react";

export function Events() {
  const [searchTerm, setSearchTerm] = useState("");

  const events = [
    {
      id: 1,
      title: "Free Health Camp",
      description: "Comprehensive health checkup for all age groups",
      date: "2024-01-25",
      time: "09:00 AM - 4:00 PM",
      location: "Ward Office Premises",
      category: "Health",
      attendees: 150,
      status: "upcoming",
      organizer: "Ward Health Committee",
      icon: Stethoscope,
      color: "bg-red-500",
    },
    {
      id: 2,
      title: "Community Development Meeting",
      description: "Monthly meeting to discuss ward development projects",
      date: "2024-01-22",
      time: "2:00 PM - 4:00 PM",
      location: "Community Hall",
      category: "Meeting",
      attendees: 75,
      status: "upcoming",
      organizer: "Ward Committee",
      icon: Building,
      color: "bg-blue-500",
    },
    {
      id: 3,
      title: "Digital Literacy Workshop",
      description: "Learn basic computer and internet skills",
      date: "2024-01-20",
      time: "10:00 AM - 3:00 PM",
      location: "Ward Office Training Room",
      category: "Education",
      attendees: 30,
      status: "ongoing",
      organizer: "Digital Nepal Initiative",
      icon: GraduationCap,
      color: "bg-green-500",
    },
    {
      id: 4,
      title: "Blood Donation Drive",
      description: "Save lives by donating blood",
      date: "2024-01-18",
      time: "8:00 AM - 12:00 PM",
      location: "Local School Ground",
      category: "Health",
      attendees: 200,
      status: "completed",
      organizer: "Red Cross Society",
      icon: Heart,
      color: "bg-red-500",
    },
    {
      id: 5,
      title: "Cleanliness Campaign",
      description: "Community cleaning and awareness program",
      date: "2024-01-15",
      time: "6:00 AM - 10:00 AM",
      location: "Main Street to Park Area",
      category: "Environment",
      attendees: 120,
      status: "completed",
      organizer: "Environmental Committee",
      icon: Building,
      color: "bg-green-600",
    },
  ];

  const upcomingEvents = events.filter(event => event.status === "upcoming");
  const ongoingEvents = events.filter(event => event.status === "ongoing");
  const completedEvents = events.filter(event => event.status === "completed");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500";
      case "ongoing":
        return "bg-green-500";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const EventCard = ({ event }: { event: any }) => {
    const IconComponent = event.icon;
    return (
      <Card className="card-interactive group">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`${event.color} p-3 rounded-lg`}>
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                <Badge className={`${getStatusColor(event.status)} text-white`}>
                  {event.status}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {event.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{event.attendees} expected attendees</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="secondary">{event.category}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    By {event.organizer}
                  </p>
                </div>
                
                {event.status === "upcoming" && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Bell className="h-4 w-4 mr-2" />
                      Remind Me
                    </Button>
                    <Button size="sm" className="gradient-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Register
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ward Events</h1>
        <p className="text-muted-foreground">
          Stay updated with community events, meetings, and programs
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 mb-8">
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="ongoing">
            Ongoing ({ongoingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Upcoming Events</h3>
                <p className="text-muted-foreground">
                  Check back soon for new events and programs
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ongoing" className="space-y-6">
          {ongoingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Ongoing Events</h3>
                <p className="text-muted-foreground">
                  No events are currently in progress
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {ongoingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="space-y-6">
            {completedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Event Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {upcomingEvents.length}
              </div>
              <div className="text-sm text-muted-foreground">Upcoming Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {ongoingEvents.length}
              </div>
              <div className="text-sm text-muted-foreground">Ongoing Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500">
                {completedEvents.length}
              </div>
              <div className="text-sm text-muted-foreground">Completed This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {events.reduce((sum, event) => sum + event.attendees, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Participants</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}