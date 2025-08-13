import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Users,
  Calendar,
  Plus,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
} from "lucide-react";

export function Queue() {
  const [bookingForm, setBookingForm] = useState({
    service: "",
    date: "",
    timeSlot: "",
    purpose: "",
  });

  const currentQueue = [
    { position: 1, name: "RAM B.", service: "Birth Certificate", status: "In Service", estimatedTime: "Now" },
    { position: 2, name: "SITA P.", service: "Marriage Certificate", status: "Waiting", estimatedTime: "5 min" },
    { position: 3, name: "HARI S.", service: "Recommendation", status: "Waiting", estimatedTime: "12 min" },
    { position: 4, name: "MAYA R.", service: "Tax Clearance", status: "Waiting", estimatedTime: "18 min" },
    { position: 5, name: "GOPAL T.", service: "Death Certificate", status: "Waiting", estimatedTime: "25 min" },
  ];

  const myAppointments = [
    {
      id: "APT001",
      service: "Birth Certificate",
      date: "2024-01-22",
      time: "10:30 AM",
      status: "Confirmed",
      position: 3,
      estimatedWait: "15 minutes",
    },
    {
      id: "APT002",
      service: "Recommendation Letter",
      date: "2024-01-25",
      time: "2:00 PM",
      status: "Pending",
      position: null,
      estimatedWait: null,
    },
  ];

  const availableServices = [
    "Birth Certificate",
    "Death Certificate", 
    "Marriage Certificate",
    "Migration Certificate",
    "Recommendation Letter",
    "Tax Clearance",
    "General Consultation",
  ];

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Service":
        return "bg-green-500";
      case "Waiting":
        return "bg-blue-500";
      case "Confirmed":
        return "bg-green-500";
      case "Pending":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Booking submitted:", bookingForm);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Queue Management</h1>
        <p className="text-muted-foreground">
          Book appointments and track waiting times for ward services
        </p>
      </div>

      {/* Live Queue Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Live Queue Status</span>
            <Badge className="bg-green-500 text-white animate-pulse">LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">5</div>
              <div className="text-sm text-muted-foreground">People in Queue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">2</div>
              <div className="text-sm text-muted-foreground">Service Counters Open</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">25</div>
              <div className="text-sm text-muted-foreground">Avg. Wait Time (min)</div>
            </div>
          </div>

          <div className="space-y-3">
            {currentQueue.map((person) => (
              <div
                key={person.position}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  person.status === "In Service" ? "bg-green-50 border-green-200 border" : "bg-blue-50"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    person.status === "In Service" ? "bg-green-500" : "bg-blue-500"
                  }`}>
                    {person.position}
                  </div>
                  <div>
                    <div className="font-medium">{person.name}</div>
                    <div className="text-sm text-muted-foreground">{person.service}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${getStatusColor(person.status)} text-white mb-1`}>
                    {person.status}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {person.estimatedTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="book" className="space-y-6">
        <TabsList>
          <TabsTrigger value="book">Book Appointment</TabsTrigger>
          <TabsTrigger value="appointments">My Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="book">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Book New Appointment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBooking} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="service">Service Required</Label>
                    <Select
                      value={bookingForm.service}
                      onValueChange={(value) =>
                        setBookingForm({ ...bookingForm, service: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableServices.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Preferred Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, date: e.target.value })
                      }
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeSlot">Time Slot</Label>
                  <Select
                    value={bookingForm.timeSlot}
                    onValueChange={(value) =>
                      setBookingForm({ ...bookingForm, timeSlot: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose (Optional)</Label>
                  <Input
                    id="purpose"
                    placeholder="Brief description of your visit"
                    value={bookingForm.purpose}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, purpose: e.target.value })
                    }
                  />
                </div>

                <div className="bg-accent p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Important Information
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Please arrive 10 minutes before your scheduled time</li>
                    <li>• Bring all required documents</li>
                    <li>• Appointments can be rescheduled up to 24 hours in advance</li>
                    <li>• Walk-ins are accepted but may have longer wait times</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full gradient-primary">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Appointments</h2>
              <Button variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Contact Office
              </Button>
            </div>

            <div className="space-y-4">
              {myAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold">{appointment.service}</h3>
                          <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                            {appointment.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>Ward Office</span>
                          </div>
                        </div>

                        {appointment.position && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Queue Position: #{appointment.position}</span>
                              <span className="text-sm text-muted-foreground">
                                Est. wait: {appointment.estimatedWait}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-6">
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Contact */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="font-semibold mb-2">Need immediate assistance?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Contact our office for urgent matters or appointment changes
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Call: +977-1-4444444
              </Button>
              <Button variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Visit Office
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}