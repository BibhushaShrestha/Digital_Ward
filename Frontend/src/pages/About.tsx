import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  Phone,
  Mail,
  Building,
  Target,
  Eye,
  Heart,
  Award,
  TrendingUp,
} from "lucide-react";

export function About() {
  const wardInfo = {
    name: "Ward No. 15",
    municipality: "Kathmandu Metropolitan City",
    population: 12500,
    area: "2.5 sq km",
    households: 3200,
    establishment: "2017",
  };

  const officials = [
    {
      id: 1,
      name: "Ram Prasad Sharma",
      role: "Ward Chairperson",
      avatar: "/official-1.jpg",
      phone: "+977-98-1234567",
      email: "chairperson@ward15.gov.np",
      experience: "5 years",
      education: "Master's in Public Administration",
    },
    {
      id: 2,
      name: "Sita Devi Poudel",
      role: "Ward Secretary",
      avatar: "/official-2.jpg",
      phone: "+977-98-2345678",
      email: "secretary@ward15.gov.np",
      experience: "8 years",
      education: "Bachelor's in Management",
    },
    {
      id: 3,
      name: "Krishna Bahadur Thapa",
      role: "Social Mobilizer",
      avatar: "/official-3.jpg",
      phone: "+977-98-3456789",
      email: "social@ward15.gov.np",
      experience: "3 years",
      education: "Bachelor's in Social Work",
    },
    {
      id: 4,
      name: "Maya Kumari Rai",
      role: "Health Coordinator",
      avatar: "/official-4.jpg",
      phone: "+977-98-4567890",
      email: "health@ward15.gov.np",
      experience: "6 years",
      education: "Bachelor's in Nursing",
    },
  ];

  const achievements = [
    {
      title: "Digital Ward Initiative",
      description: "First ward to implement comprehensive digital services",
      year: "2023",
      icon: Award,
    },
    {
      title: "100% Birth Registration",
      description: "Achieved complete birth registration coverage",
      year: "2023",
      icon: Target,
    },
    {
      title: "Clean Ward Award",
      description: "Municipal recognition for cleanliness",
      year: "2022",
      icon: Heart,
    },
    {
      title: "Citizens Satisfaction",
      description: "95% satisfaction rate in annual survey",
      year: "2023",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">About Our Ward</h1>
        <p className="text-muted-foreground">
          Learn about our ward, officials, and community services
        </p>
      </div>

      {/* Ward Overview */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full gradient-primary mb-4">
              <Building className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{wardInfo.name}</h2>
            <p className="text-muted-foreground">{wardInfo.municipality}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{wardInfo.population.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Population</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">{wardInfo.area}</div>
              <div className="text-sm text-muted-foreground">Area</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">{wardInfo.households.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Households</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">{wardInfo.establishment}</div>
              <div className="text-sm text-muted-foreground">Established</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-500">15</div>
              <div className="text-sm text-muted-foreground">Services</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-500">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Vision & Mission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Vision & Mission</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-primary">Our Vision</h4>
              <p className="text-sm text-muted-foreground">
                To create a digitally empowered, sustainable, and inclusive community where 
                every citizen has access to quality municipal services and opportunities for growth.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-secondary">Our Mission</h4>
              <p className="text-sm text-muted-foreground">
                To deliver efficient, transparent, and citizen-centric services through 
                digital innovation while preserving our cultural heritage and promoting 
                sustainable development.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location & Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Location & Contact</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Ward Office Address</div>
                  <div className="text-sm text-muted-foreground">
                    Baluwatar, Kathmandu - 44600, Nepal
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Phone</div>
                  <div className="text-sm text-muted-foreground">+977-1-4444444</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">info@ward15.gov.np</div>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <Button className="w-full gradient-primary">
                <MapPin className="h-4 w-4 mr-2" />
                View on Map
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ward Officials */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Ward Officials</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {officials.map((official) => (
              <div key={official.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={official.avatar} alt={official.name} />
                  <AvatarFallback className="text-lg">
                    {official.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{official.name}</h3>
                  <Badge className="mb-2" variant="secondary">{official.role}</Badge>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-2" />
                      <span>{official.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-2" />
                      <span>{official.email}</span>
                    </div>
                    <div className="mt-2">
                      <div className="font-medium text-foreground">Experience: {official.experience}</div>
                      <div>{official.education}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Achievements & Recognition</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  <Badge variant="outline">{achievement.year}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}