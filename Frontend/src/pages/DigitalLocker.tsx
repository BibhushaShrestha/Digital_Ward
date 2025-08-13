import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  Plus,
  Search,
  Filter,
  File,
  Image,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

export function DigitalLocker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const documentCategories = [
    { id: "all", label: "All Documents", count: 12 },
    { id: "identity", label: "Identity", count: 4 },
    { id: "certificates", label: "Certificates", count: 5 },
    { id: "property", label: "Property", count: 2 },
    { id: "other", label: "Other", count: 1 },
  ];

  const documents = [
    {
      id: "1",
      name: "Citizenship Certificate",
      type: "PDF",
      size: "2.3 MB",
      uploadDate: "2024-01-15",
      category: "identity",
      status: "verified",
      preview: "/placeholder.svg",
    },
    {
      id: "2",
      name: "Birth Certificate",
      type: "PDF",
      size: "1.8 MB",
      uploadDate: "2024-01-10",
      category: "certificates",
      status: "verified",
      preview: "/placeholder.svg",
    },
    {
      id: "3",
      name: "Passport Copy",
      type: "JPG",
      size: "3.2 MB",
      uploadDate: "2024-01-08",
      category: "identity",
      status: "pending",
      preview: "/placeholder.svg",
    },
    {
      id: "4",
      name: "Marriage Certificate",
      type: "PDF",
      size: "2.1 MB",
      uploadDate: "2024-01-05",
      category: "certificates",
      status: "verified",
      preview: "/placeholder.svg",
    },
    {
      id: "5",
      name: "Property Deed",
      type: "PDF",
      size: "4.5 MB",
      uploadDate: "2024-01-01",
      category: "property",
      status: "rejected",
      preview: "/placeholder.svg",
    },
    {
      id: "6",
      name: "Academic Certificate",
      type: "PDF",
      size: "1.9 MB",
      uploadDate: "2023-12-28",
      category: "certificates",
      status: "verified",
      preview: "/placeholder.svg",
    },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-500";
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
      case "verified":
        return CheckCircle;
      case "pending":
        return Clock;
      case "rejected":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return FileText;
      case "jpg":
      case "jpeg":
      case "png":
        return Image;
      default:
        return File;
    }
  };

  const handleUpload = () => {
    toast({
      title: "Document Uploaded",
      description: "Your document has been uploaded successfully and is being verified.",
    });
  };

  const handleDelete = (docName: string) => {
    toast({
      title: "Document Deleted",
      description: `${docName} has been removed from your locker.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Digital Locker</h1>
        <p className="text-muted-foreground">
          Securely store and manage your important documents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {documentCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className="w-full justify-between"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="text-sm">{category.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Upload New Document */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Upload Document</CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full gradient-primary">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="doc-name">Document Name</Label>
                      <Input
                        id="doc-name"
                        placeholder="Enter document name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-category">Category</Label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="identity">Identity</option>
                        <option value="certificates">Certificates</option>
                        <option value="property">Property</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-file">Select File</Label>
                      <Input
                        id="doc-file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                    <Button onClick={handleUpload} className="w-full gradient-primary">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => {
              const FileIcon = getFileIcon(doc.type);
              const StatusIcon = getStatusIcon(doc.status);
              
              return (
                <Card key={doc.id} className="card-interactive group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <FileIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{doc.name}</h3>
                          <p className="text-xs text-muted-foreground">{doc.size}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(doc.status)} text-white text-xs`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {doc.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground mb-4">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span>{doc.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uploaded:</span>
                        <span>{doc.uploadDate}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs hover:scale-105 transition-all hover:bg-primary hover:text-primary-foreground"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">View</span>
                        <span className="sm:hidden">View</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs hover:scale-105 transition-all hover:bg-success hover:text-white"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Download</span>
                        <span className="sm:hidden">Down</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(doc.name)}
                        className="text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 hover:scale-105 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Upload your first document to get started"}
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="doc-name">Document Name</Label>
                      <Input
                        id="doc-name"
                        placeholder="Enter document name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-category">Category</Label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="identity">Identity</option>
                        <option value="certificates">Certificates</option>
                        <option value="property">Property</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-file">Select File</Label>
                      <Input
                        id="doc-file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                    <Button onClick={handleUpload} className="w-full gradient-primary">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}