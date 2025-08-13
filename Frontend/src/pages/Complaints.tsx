import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  MessageSquare,
  Plus,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  FileText,
  Image,
  Video,
} from "lucide-react";

export function Complaints() {
  const [complaintForm, setComplaintForm] = useState({
    category: "",
    subject: "",
    description: "",
    priority: "",
    location: "",
  });

  const complaints = [
    {
      id: "CMP001",
      subject: "Street Light Not Working",
      category: "Infrastructure",
      status: "In Progress",
      priority: "Medium",
      date: "2024-01-15",
      location: "Main Road, Sector 5",
      response: "Maintenance team assigned. Expected resolution: 2 days",
    },
    {
      id: "CMP002",
      subject: "Water Supply Issue",
      category: "Utilities",
      status: "Resolved",
      priority: "High",
      date: "2024-01-12",
      location: "Residential Area, Block B",
      response: "Water pipeline repaired. Service restored.",
    },
    {
      id: "CMP003",
      subject: "Garbage Collection Delayed",
      category: "Sanitation",
      status: "Pending",
      priority: "Low",
      date: "2024-01-10",
      location: "Market Street",
      response: "Complaint received. Review in progress.",
    },
  ];

  const categories = [
    "Infrastructure",
    "Utilities",
    "Sanitation",
    "Traffic",
    "Noise",
    "Environment",
    "Security",
    "Other",
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-500";
      case "In Progress":
        return "bg-blue-500";
      case "Pending":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved":
        return CheckCircle;
      case "In Progress":
        return Clock;
      case "Pending":
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Complaint submitted:", complaintForm);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Complaint Management</h1>
        <p className="text-muted-foreground">
          Report issues and track their resolution status
        </p>
      </div>

      <Tabs defaultValue="file" className="space-y-6">
        <TabsList>
          <TabsTrigger value="file">File Complaint</TabsTrigger>
          <TabsTrigger value="track">Track Complaints</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>File New Complaint</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={complaintForm.category}
                      onValueChange={(value) =>
                        setComplaintForm({ ...complaintForm, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={complaintForm.priority}
                      onValueChange={(value) =>
                        setComplaintForm({ ...complaintForm, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of the issue"
                    value={complaintForm.subject}
                    onChange={(e) =>
                      setComplaintForm({ ...complaintForm, subject: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Specific location or address"
                    value={complaintForm.location}
                    onChange={(e) =>
                      setComplaintForm({ ...complaintForm, location: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about the issue..."
                    rows={4}
                    value={complaintForm.description}
                    onChange={(e) =>
                      setComplaintForm({ ...complaintForm, description: e.target.value })
                    }
                  />
                </div>

                {/* File Upload Section */}
                <div className="space-y-4">
                  <Label>Attachments (Optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-dashed border-2 cursor-pointer hover:bg-accent transition-colors">
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center">
                          Upload Documents
                        </p>
                        <p className="text-xs text-muted-foreground">PDF, DOC</p>
                      </CardContent>
                    </Card>

                    <Card className="border-dashed border-2 cursor-pointer hover:bg-accent transition-colors">
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <Image className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center">
                          Upload Photos
                        </p>
                        <p className="text-xs text-muted-foreground">JPG, PNG</p>
                      </CardContent>
                    </Card>

                    <Card className="border-dashed border-2 cursor-pointer hover:bg-accent transition-colors">
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <Video className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center">
                          Upload Videos
                        </p>
                        <p className="text-xs text-muted-foreground">MP4, MOV</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" type="button">
                    Save as Draft
                  </Button>
                  <Button type="submit" className="gradient-primary">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Submit Complaint
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="track" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Complaints</h2>
            <div className="flex items-center space-x-2">
              <Input placeholder="Search complaints..." className="w-64" />
              <Button variant="outline">Filter</Button>
            </div>
          </div>

          <div className="space-y-4">
            {complaints.map((complaint) => {
              const StatusIcon = getStatusIcon(complaint.status);
              return (
                <Card key={complaint.id} className="hover:shadow-medium transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold">{complaint.subject}</h3>
                          <Badge className={`${getStatusColor(complaint.status)} text-white`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {complaint.status}
                          </Badge>
                          <Badge className={`${getPriorityColor(complaint.priority)} text-white`}>
                            {complaint.priority}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                          <div>
                            <span className="font-medium">Complaint ID:</span>
                            <span className="ml-1">{complaint.id}</span>
                          </div>
                          <div>
                            <span className="font-medium">Category:</span>
                            <span className="ml-1">{complaint.category}</span>
                          </div>
                          <div>
                            <span className="font-medium">Date Filed:</span>
                            <span className="ml-1">{complaint.date}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium text-muted-foreground">Location:</span>
                            <span className="ml-1">{complaint.location}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-muted-foreground">Response:</span>
                            <span className="ml-1">{complaint.response}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-6">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}