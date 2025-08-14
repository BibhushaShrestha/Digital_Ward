import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CertificateApplicationForm } from "@/components/forms/CertificateApplicationForm";
import {
  FileText,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Download,
  Eye,
  ArrowRight,
  Baby,
  Heart,
  User,
  MapPin,
} from "lucide-react";

export function Services() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const services = [
    {
      id: "birth-cert",
      title: "Birth Certificate",
      nepali: "जन्म प्रमाणपत्र",
      description: "Official birth registration and certificate issuance",
      icon: Baby,
      category: "certificates",
      documents: ["Parents' citizenship", "Hospital record", "Application form"],
      fee: "Rs. 25",
      duration: "3-5 days",
      color: "bg-blue-500",
    },
    {
      id: "death-cert",
      title: "Death Certificate",
      nepali: "मृत्यु प्रमाणपत्र",
      description: "Official death registration and certificate",
      icon: Heart,
      category: "certificates",
      documents: ["Medical certificate", "Family citizenship", "Application form"],
      fee: "Rs. 25",
      duration: "2-3 days",
      color: "bg-red-500",
    },
    {
      id: "marriage-cert",
      title: "Marriage Certificate",
      nepali: "विवाह दर्ता प्रमाणपत्र",
      description: "Marriage registration and certificate",
      icon: Heart,
      category: "certificates",
      documents: ["Both parties' citizenship", "Witness signatures", "Application form"],
      fee: "Rs. 50",
      duration: "5-7 days",
      color: "bg-pink-500",
    },
    {
      id: "migration-cert",
      title: "Migration Certificate",
      nepali: "बसाइँ सरेको प्रमाणपत्र",
      description: "Address change and migration documentation",
      icon: MapPin,
      category: "certificates",
      documents: ["Citizenship", "Rental agreement/Property deed", "Application form"],
      fee: "Rs. 100",
      duration: "7-10 days",
      color: "bg-green-500",
    },
    {
      id: "unmarried-cert",
      title: "Unmarried Certificate",
      nepali: "अविवाहित प्रमाणपत्र",
      description: "Certificate confirming unmarried status",
      icon: User,
      category: "certificates",
      documents: ["Citizenship", "Application form", "Character certificate"],
      fee: "Rs. 50",
      duration: "3-5 days",
      color: "bg-indigo-500",
    },
    {
      id: "relationship-cert",
      title: "Relationship Verification",
      nepali: "नाता प्रमाणपत्र",
      description: "Certificate verifying family relationship",
      icon: User,
      category: "certificates",
      documents: ["Both parties' citizenship", "Family tree document", "Application form"],
      fee: "Rs. 75",
      duration: "5-7 days",
      color: "bg-teal-500",
    },
    {
      id: "character-cert",
      title: "Character Certificate",
      nepali: "चरित्र प्रमाणपत्र",
      description: "Certificate of good character and conduct",
      icon: User,
      category: "certificates",
      documents: ["Citizenship", "Police clearance", "Application form"],
      fee: "Rs. 100",
      duration: "7-10 days",
      color: "bg-cyan-500",
    },
    {
      id: "income-cert",
      title: "Income Certificate",
      nepali: "आय प्रमाणपत्र",
      description: "Certificate of annual income verification",
      icon: FileText,
      category: "certificates",
      documents: ["Citizenship", "Income documents", "Tax returns", "Application form"],
      fee: "Rs. 150",
      duration: "5-7 days",
      color: "bg-emerald-500",
    },
    {
      id: "recommendation",
      title: "Recommendation Letter",
      nepali: "सिफारिस पत्र",
      description: "Official recommendation for various purposes",
      icon: FileText,
      category: "letters",
      documents: ["Citizenship", "Supporting documents", "Application form"],
      fee: "Rs. 100",
      duration: "1-2 days",
      color: "bg-purple-500",
    },
    {
      id: "tax-clearance",
      title: "Tax Clearance Certificate",
      nepali: "कर चुक्ता प्रमाणपत्र",
      description: "Tax clearance certificate",
      icon: FileText,
      category: "certificates",
      documents: ["Tax returns", "Property documents", "Application form"],
      fee: "Rs. 200",
      duration: "5-7 days",
      color: "bg-orange-500",
    },
    {
      id: "land-ownership",
      title: "Land Ownership Certificate",
      nepali: "जग्गा स्वामित्व प्रमाणपत्र",
      description: "Certificate verifying land ownership",
      icon: MapPin,
      category: "certificates",
      documents: ["Land registration", "Citizenship", "Survey document", "Application form"],
      fee: "Rs. 500",
      duration: "10-15 days",
      color: "bg-amber-500",
    },
  ];

  const applications = [
    {
      id: "APP001",
      service: "Birth Certificate",
      status: "In Progress",
      date: "2024-01-15",
      progress: 75,
      estimatedCompletion: "2024-01-18",
    },
    {
      id: "APP002",
      service: "Marriage Certificate",
      status: "Pending Documents",
      date: "2024-01-12",
      progress: 50,
      estimatedCompletion: "2024-01-20",
    },
    {
      id: "APP003",
      service: "Recommendation Letter",
      status: "Ready for Collection",
      date: "2024-01-10",
      progress: 100,
      estimatedCompletion: "Completed",
    },
    {
      id: "APP004",
      service: "Tax Clearance",
      status: "Under Review",
      date: "2024-01-08",
      progress: 25,
      estimatedCompletion: "2024-01-22",
    },
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

  const handleApplyService = (service) => {
    setSelectedService(service);
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
        <p className="text-muted-foreground">
          Apply for certificates, letters, and other official documents
        </p>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available Services</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <Card key={service.id} className="card-interactive group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`${service.color} p-3 rounded-lg`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="secondary">{service.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <p className="text-sm text-muted-foreground font-medium">{service.nepali}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Fee:</span>
                        <span className="font-medium">{service.fee}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{service.duration}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Required Documents:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {service.documents.map((doc, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => handleApplyService(service)}
                        className="flex-1 gradient-primary group-hover:shadow-primary text-sm hover:scale-105 transition-all"
                      >
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
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${app.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-6">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {app.status === "Ready for Collection" && (
                          <Button size="sm" className="gradient-primary">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Certificate Application Form */}
      <CertificateApplicationForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        service={selectedService}
      />
    </div>
  );
}