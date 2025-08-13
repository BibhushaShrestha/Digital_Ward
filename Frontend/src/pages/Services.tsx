import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CertificateApplicationForm } from "@/components/forms/CertificateApplicationForm";
import { FileText, Search, Clock, CheckCircle, AlertCircle, Plus, Download, Eye, Baby, Heart, User, MapPin } from "lucide-react";
import { api } from "@/lib/api";

const iconMap: Record<string, any> = { Baby, Heart, User, MapPin, FileText };

export function Services() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ success: boolean; data: { services: any[] } }>("/api/services");
        setServices(res.data.services);
      } catch (e) {
        // fallback demo services if backend not available
        setServices([]);
      }
    })();
  }, []);

  const applications = [
    { id: "APP001", service: "Birth Certificate", status: "In Progress", date: "2024-01-15", progress: 75, estimatedCompletion: "2024-01-18" },
  ];

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-500";
      case "Pending Documents":
        return "bg-orange-500";
      case "Ready for Collection":
        return "bg-green-500";
      case "Under Review":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Ready for Collection":
        return CheckCircle;
      case "Pending Documents":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const handleApplyService = (service: any) => {
    setSelectedService({
      id: service._id,
      title: service.title,
      nepali: service.nepaliTitle,
      description: service.description,
      documents: (service.requiredDocuments || []).map((d: any) => d.name),
      fee: `${service.fee.displayText} ${service.fee.amount}`,
      duration: service.processingTime.displayText,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedService(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ward Services</h1>
        <p className="text-muted-foreground">Apply for certificates, letters, and other official documents</p>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available Services</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const IconComponent = iconMap[service.icon] || FileText;
              return (
                <Card key={service._id} className="card-interactive group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`${service.color || 'bg-blue-500'} p-3 rounded-lg`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="secondary">{service.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <p className="text-sm text-muted-foreground font-medium">{service.nepaliTitle}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{service.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Fee:</span>
                        <span className="font-medium">{service.fee.displayText} {service.fee.amount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{service.processingTime.displayText}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Required Documents:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {(service.requiredDocuments || []).map((doc: any, index: number) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
                            <span>{doc.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={() => handleApplyService(service)} className="flex-1 gradient-primary group-hover:shadow-primary text-sm hover:scale-105 transition-all">
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Apply Now</span>
                        <span className="sm:hidden">Apply</span>
                      </Button>
                      <Button variant="outline" size="sm" className="sm:w-auto hover:scale-105 transition-all">
                        <Eye className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Preview</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Applications</h2>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="space-y-4">
            {applications.map((app) => {
              const StatusIcon = getStatusIcon(app.status);
              return (
                <Card key={app.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{app.service}</h3>
                          <Badge className={`${getStatusColor(app.status)} text-white`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {app.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Application ID:</span>
                            <span className="ml-1">{app.id}</span>
                          </div>
                          <div>
                            <span className="font-medium">Applied:</span>
                            <span className="ml-1">{app.date}</span>
                          </div>
                          <div>
                            <span className="font-medium">Expected:</span>
                            <span className="ml-1">{app.estimatedCompletion}</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{app.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${app.progress}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-6">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
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

      <CertificateApplicationForm isOpen={isFormOpen} onClose={handleCloseForm} service={selectedService} />
    </div>
  );
}