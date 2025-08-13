import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  MessageSquare,
  Download,
  Calendar,
} from "lucide-react";

export function Analytics() {
  const monthlyStats = [
    { title: "Services Issued", value: 245, change: "+12%", icon: FileText, color: "bg-blue-500" },
    { title: "Complaints Resolved", value: 18, change: "+5%", icon: MessageSquare, color: "bg-green-500" },
    { title: "Staff Attendance", value: "94%", change: "+2%", icon: Users, color: "bg-purple-500" },
    { title: "Response Time", value: "2.3 days", change: "-15%", icon: TrendingUp, color: "bg-orange-500" },
  ];

  const serviceBreakdown = [
    { service: "Birth Certificate", count: 85, percentage: 35 },
    { service: "Marriage Certificate", count: 42, percentage: 17 },
    { service: "Recommendation Letter", count: 68, percentage: 28 },
    { service: "Tax Clearance", count: 32, percentage: 13 },
    { service: "Death Certificate", count: 18, percentage: 7 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Ward performance metrics and insights</p>
        </div>
        <Button className="gradient-primary">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {monthlyStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      {stat.change.startsWith('+') ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className="text-xs text-muted-foreground">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {serviceBreakdown.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.service}</span>
                  <span>{item.count} requests</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success">4.7/5</div>
              <div className="text-sm text-muted-foreground">Citizen Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">92%</div>
              <div className="text-sm text-muted-foreground">Complaint Resolution Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">2.1 days</div>
              <div className="text-sm text-muted-foreground">Avg Document Processing</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}