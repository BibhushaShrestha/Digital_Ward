import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Eye,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Calendar,
  User,
} from "lucide-react";

export function MyApplications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const applications = [
    {
      id: "APP001",
      service: "Birth Certificate",
      nepali: "जन्म प्रमाणपत्र",
      status: "completed",
      date: "2024-01-15",
      completedDate: "2024-01-20",
      progress: 100,
      estimatedCompletion: "Completed",
      fee: "Rs. 25",
      applicationNumber: "BC/2024/001",
    },
    {
      id: "APP002",
      service: "Marriage Certificate",
      nepali: "विवाह दर्ता प्रमाणपत्र",
      status: "in-progress",
      date: "2024-01-12",
      progress: 75,
      estimatedCompletion: "2024-01-25",
      fee: "Rs. 50",
      applicationNumber: "MC/2024/002",
    },
    {
      id: "APP003",
      service: "Recommendation Letter",
      nepali: "सिफारिस पत्र",
      status: "completed",
      date: "2024-01-10",
      completedDate: "2024-01-12",
      progress: 100,
      estimatedCompletion: "Completed",
      fee: "Rs. 100",
      applicationNumber: "RL/2024/003",
    },
    {
      id: "APP004",
      service: "Tax Clearance Certificate",
      nepali: "कर चुक्ता प्रमाणपत्र",
      status: "pending",
      date: "2024-01-08",
      progress: 25,
      estimatedCompletion: "2024-01-30",
      fee: "Rs. 200",
      applicationNumber: "TC/2024/004",
    },
    {
      id: "APP005",
      service: "Character Certificate",
      nepali: "चरित्र प्रमाणपत्र",
      status: "rejected",
      date: "2024-01-05",
      progress: 0,
      estimatedCompletion: "Rejected",
      fee: "Rs. 100",
      applicationNumber: "CC/2024/005",
      rejectionReason: "Incomplete documentation provided",
    },
    {
      id: "APP006",
      service: "Income Certificate",
      nepali: "आय प्रमाणपत्र",
      status: "in-progress",
      date: "2024-01-03",
      progress: 50,
      estimatedCompletion: "2024-01-28",
      fee: "Rs. 150",
      applicationNumber: "IC/2024/006",
    },
  ];

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "pending":
        return "bg-orange-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "in-progress":
        return Clock;
      case "pending":
        return AlertCircle;
      case "rejected":
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const statusCounts = {
    all: applications.length,
    completed: applications.filter(app => app.status === "completed").length,
    "in-progress": applications.filter(app => app.status === "in-progress").length,
    pending: applications.filter(app => app.status === "pending").length,
    rejected: applications.filter(app => app.status === "rejected").length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Applications</h1>
        <p className="text-muted-foreground">
          Track the status of your certificate applications
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{statusCounts.all}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statusCounts["in-progress"]}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{statusCounts.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-5 w-full sm:w-auto">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">Done</TabsTrigger>
            <TabsTrigger value="in-progress" className="text-xs">Progress</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
            <TabsTrigger value="rejected" className="text-xs">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((app) => {
          const StatusIcon = getStatusIcon(app.status);
          return (
            <Card key={app.id} className="card-interactive">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{app.service}</h3>
                      <p className="text-sm text-muted-foreground">{app.nepali}</p>
                      <Badge className={`${getStatusColor(app.status)} text-white w-fit`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {getStatusLabel(app.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">App ID:</span>
                        <span className="font-medium">{app.applicationNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Applied:</span>
                        <span className="font-medium">{app.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Expected:</span>
                        <span className="font-medium">{app.estimatedCompletion}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Fee:</span>
                        <span className="font-medium">{app.fee}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {app.status !== "rejected" && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{app.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              app.status === "completed" ? "bg-green-500" : "bg-primary"
                            }`}
                            style={{ width: `${app.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {app.status === "rejected" && app.rejectionReason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                          <strong>Rejection Reason:</strong> {app.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-2 lg:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 lg:flex-none text-xs sm:text-sm">
                      <Eye className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                    {app.status === "completed" && (
                      <Button size="sm" className="gradient-primary flex-1 lg:flex-none text-xs sm:text-sm">
                        <Download className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Download</span>
                        <span className="sm:hidden">Download</span>
                      </Button>
                    )}
                    {app.status === "rejected" && (
                      <Button variant="outline" size="sm" className="flex-1 lg:flex-none text-xs sm:text-sm">
                        <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Reapply</span>
                        <span className="sm:hidden">Reapply</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No applications found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter"
              : "You haven't submitted any applications yet"}
          </p>
          <Button className="gradient-primary">
            <FileText className="h-4 w-4 mr-2" />
            Apply for Service
          </Button>
        </div>
      )}
    </div>
  );
}