import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Phone, Mail, MapPin, Calendar } from "lucide-react";

export function StaffStatus() {
  const staffMembers = [
    {
      id: 1,
      name: "Ram Prasad Sharma",
      role: "Ward Chairperson",
      status: "Present",
      avatar: "/staff-1.jpg",
      phone: "+977-98-1234567",
      email: "chairperson@ward.gov.np",
      department: "Administration",
      lastSeen: "Online now",
    },
    {
      id: 2,
      name: "Sita Devi Poudel",
      role: "Ward Secretary",
      status: "Present",
      avatar: "/staff-2.jpg",
      phone: "+977-98-2345678",
      email: "secretary@ward.gov.np",
      department: "Administration",
      lastSeen: "5 minutes ago",
    },
    {
      id: 3,
      name: "Krishna Bahadur Thapa",
      role: "Social Mobilizer",
      status: "On Leave",
      avatar: "/staff-3.jpg",
      phone: "+977-98-3456789",
      email: "social@ward.gov.np",
      department: "Social Development",
      lastSeen: "Yesterday",
    },
    {
      id: 4,
      name: "Maya Kumari Rai",
      role: "Health Coordinator",
      status: "Present",
      avatar: "/staff-4.jpg",
      phone: "+977-98-4567890",
      email: "health@ward.gov.np",
      department: "Health & Sanitation",
      lastSeen: "2 minutes ago",
    },
    {
      id: 5,
      name: "Gopal Singh Bista",
      role: "Infrastructure Officer",
      status: "Absent",
      avatar: "/staff-5.jpg",
      phone: "+977-98-5678901",
      email: "infrastructure@ward.gov.np",
      department: "Infrastructure",
      lastSeen: "2 hours ago",
    },
    {
      id: 6,
      name: "Anita Sharma Adhikari",
      role: "Accounts Officer",
      status: "Present",
      avatar: "/staff-6.jpg",
      phone: "+977-98-6789012",
      email: "accounts@ward.gov.np",
      department: "Finance",
      lastSeen: "Just now",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-success text-success-foreground";
      case "Absent":
        return "bg-destructive text-destructive-foreground";
      case "On Leave":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "Present":
        return "🟢";
      case "Absent":
        return "🔴";
      case "On Leave":
        return "🔵";
      default:
        return "⚫";
    }
  };

  const presentCount = staffMembers.filter(staff => staff.status === "Present").length;
  const totalCount = staffMembers.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Staff Status</h1>
        <p className="text-muted-foreground">
          Real-time attendance and availability of ward staff
        </p>
      </div>

      {/* Stats Card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{presentCount}</div>
              <div className="text-sm text-muted-foreground">Present Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {staffMembers.filter(s => s.status === "Absent").length}
              </div>
              <div className="text-sm text-muted-foreground">Absent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {staffMembers.filter(s => s.status === "On Leave").length}
              </div>
              <div className="text-sm text-muted-foreground">On Leave</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalCount}</div>
              <div className="text-sm text-muted-foreground">Total Staff</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffMembers.map((staff) => (
          <Card key={staff.id} className="card-interactive">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={staff.avatar} alt={staff.name} />
                    <AvatarFallback className="text-lg">
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 text-lg">
                    {getStatusIndicator(staff.status)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg truncate">{staff.name}</h3>
                    <Badge className={getStatusColor(staff.status)}>
                      {staff.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {staff.role}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {staff.department}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 mr-2" />
                      <span className="truncate">{staff.phone}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 mr-2" />
                      <span className="truncate">{staff.email}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-2" />
                      <span>Last seen: {staff.lastSeen}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Schedule */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Today's Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
              <div>
                <h4 className="font-medium">Ward Committee Meeting</h4>
                <p className="text-sm text-muted-foreground">
                  Monthly review and planning session
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">10:00 AM - 12:00 PM</div>
                <div className="text-xs text-muted-foreground">
                  All staff members
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
              <div>
                <h4 className="font-medium">Citizen Service Hours</h4>
                <p className="text-sm text-muted-foreground">
                  Walk-in services and consultations
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">1:00 PM - 5:00 PM</div>
                <div className="text-xs text-muted-foreground">
                  Service desk staff
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
              <div>
                <h4 className="font-medium">Field Inspection</h4>
                <p className="text-sm text-muted-foreground">
                  Infrastructure development sites
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">2:00 PM - 4:00 PM</div>
                <div className="text-xs text-muted-foreground">
                  Infrastructure team
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}