import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface Service {
  id: string;
  title: string;
  nepali: string;
  description: string;
  documents: string[];
  fee: string;
  duration: string;
}

interface CertificateApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
}

type LockerDoc = { id: string; name: string; verified: boolean; url?: string };

export function CertificateApplicationForm({ isOpen, onClose, service }: CertificateApplicationFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    motherName: "",
    citizenshipNumber: "",
    address: "",
    contactNumber: "",
    email: "",
    purpose: "",
    additionalNotes: "",
  });
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [availableDocuments, setAvailableDocuments] = useState<LockerDoc[]>([
    { id: "1", name: "Citizenship Certificate", verified: true },
    { id: "2", name: "Birth Certificate", verified: true },
    { id: "3", name: "Passport Copy", verified: false },
    { id: "4", name: "Marriage Certificate", verified: true },
    { id: "5", name: "Property Deed", verified: false },
    { id: "6", name: "Academic Certificate", verified: true },
  ]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocFile, setNewDocFile] = useState<File | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDocument = (docId: string) => {
    setSelectedDocuments(prev => prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]);
  };

  const uploadNewDocument = async () => {
    if (!newDocFile) {
      toast({ title: "Choose a file", description: "Select a PDF/JPG/PNG to upload.", variant: "destructive" });
      return;
    }
    try {
      setUploading(true);
      const form = new FormData();
      form.append('file', newDocFile);
      form.append('name', newDocName || newDocFile.name);
      const res = await api<{ success: boolean; data: { file: { filename: string; url: string } } }>("/api/upload", { method: 'POST', body: form });
      const id = `${Date.now()}`;
      const item: LockerDoc = { id, name: newDocName || newDocFile.name, verified: false, url: res.data.file.url };
      setAvailableDocuments(prev => [item, ...prev]);
      setSelectedDocuments(prev => [id, ...prev]);
      setShowUpload(false);
      setNewDocFile(null);
      setNewDocName("");
      toast({ title: "Uploaded", description: `Saved as ${res.data.file.filename}` });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!service) return;
    setIsSubmitting(true);
    try {
      const res = await api<{ success: boolean; data: { application: any } }>("/api/applications", {
        method: 'POST',
        body: {
          serviceId: service.id,
          title: `${service.title} Application`,
          purpose: formData.purpose || `Requesting ${service.title}`,
          description: formData.additionalNotes,
          formData: { ...formData, selectedDocuments },
        }
      });
      toast({ title: "Application Submitted Successfully", description: `Application ID: ${res.data.application.applicationId || res.data.application._id}` });
      onClose();
      setFormData({ fullName: "", fatherName: "", motherName: "", citizenshipNumber: "", address: "", contactNumber: "", email: "", purpose: "", additionalNotes: "" });
      setSelectedDocuments([]);
    } catch (e: any) {
      toast({ title: "Submission failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            <div>
              <div className="text-lg font-semibold">{service.title}</div>
              <div className="text-sm text-muted-foreground font-normal">{service.nepali}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Fee: </span><span>{service.fee}</span></div>
              <div><span className="font-medium">Processing Time: </span><span>{service.duration}</span></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" value={formData.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} placeholder="Enter your full name" className="w-full" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="citizenshipNumber">Citizenship Number *</Label>
                <Input id="citizenshipNumber" value={formData.citizenshipNumber} onChange={(e) => handleInputChange("citizenshipNumber", e.target.value)} placeholder="Enter citizenship number" className="w-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fatherName">Father's Name *</Label>
                <Input id="fatherName" value={formData.fatherName} onChange={(e) => handleInputChange("fatherName", e.target.value)} placeholder="Enter father's name" className="w-full" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherName">Mother's Name *</Label>
                <Input id="motherName" value={formData.motherName} onChange={(e) => handleInputChange("motherName", e.target.value)} placeholder="Enter mother's name" className="w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} placeholder="Enter current address" className="w-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input id="contactNumber" value={formData.contactNumber} onChange={(e) => handleInputChange("contactNumber", e.target.value)} placeholder="Enter contact number" className="w-full" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="Enter email address" className="w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose *</Label>
              <Textarea id="purpose" value={formData.purpose} onChange={(e) => handleInputChange("purpose", e.target.value)} placeholder="Enter the purpose for this certificate" className="w-full min-h-[80px]" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea id="additionalNotes" value={formData.additionalNotes} onChange={(e) => handleInputChange("additionalNotes", e.target.value)} placeholder="Any additional information" className="w-full min-h-[60px]" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base">Required Documents</h3>
            <p className="text-sm text-muted-foreground">Select documents from your Digital Locker or upload new ones</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableDocuments.map((doc) => (
                <div key={doc.id} className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedDocuments.includes(doc.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => toggleDocument(doc.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.verified ? (
                        <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
                      ) : (
                        <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>
                      )}
                      {selectedDocuments.includes(doc.id) && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowUpload(v => !v)}>
                <Upload className="h-4 w-4 mr-2" />
                {showUpload ? 'Close Uploader' : 'Upload New Document'}
              </Button>
              {showUpload && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input placeholder="Document name" value={newDocName} onChange={(e) => setNewDocName(e.target.value)} className="sm:col-span-1" />
                  <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setNewDocFile(e.target.files?.[0] || null)} className="sm:col-span-1" />
                  <Button onClick={uploadNewDocument} disabled={uploading || !newDocFile} className="sm:col-span-1">
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Required Documents for {service.title}:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {service.documents.map((doc, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full"></div>
                  {doc}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto" disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.fullName || !formData.citizenshipNumber} className="gradient-primary w-full sm:flex-1">
              {isSubmitting ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Submitting...</>) : (<><FileText className="h-4 w-4 mr-2" />Submit Application</>)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}