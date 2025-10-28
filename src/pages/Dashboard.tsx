import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { AlertItem } from "@/components/AlertItem";
import { BinStatusTable } from "@/components/BinStatusTable";
import { RouteCard } from "@/components/RouteCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, AlertTriangle, TrendingUp, Gauge } from "lucide-react";

const mockBins = [
  { id: "1", location: "Connaught Place", capacity: "100L", fillLevel: 45, status: "normal" as const },
  { id: "2", location: "Gateway of India", capacity: "100L", fillLevel: 78, status: "warning" as const },
  { id: "3", location: "Howrah Bridge", capacity: "100L", fillLevel: 92, status: "critical" as const },
  { id: "4", location: "Charminar", capacity: "100L", fillLevel: 23, status: "low" as const },
];

const mockAlerts = [
  { message: "Times Square Plaza bin at 92% capacity", time: "5 min ago", severity: "critical" as const },
  { message: "Central Park Entrance bin needs attention", time: "15 min ago", severity: "warning" as const },
  { message: "Washington Square Park bin at 85%", time: "1 hour ago", severity: "warning" as const },
  { message: "Route optimization needed for downtown area", time: "2 hours ago", severity: "info" as const },
];

const mockRoutes = [
  { name: "Critical Collection Route", status: "planned" as const, distance: "12.5 km", estimatedTime: "85 min" },
  { name: "Regular Collection Route A", status: "in_progress" as const, distance: "18.3 km", estimatedTime: "120 min" },
  { name: "Optimized Route 3", status: "planned" as const, distance: "27.5 km", estimatedTime: "114 min" },
];

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring and analytics for smart waste management
          </p>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Bins"
            value="8"
            icon={Trash2}
            variant="default"
          />
          <MetricCard
            title="Critical Bins"
            value="1"
            icon={AlertTriangle}
            variant="danger"
            trend={{ value: "1 from last hour", positive: false }}
          />
          <MetricCard
            title="Collections Today"
            value="3"
            icon={TrendingUp}
            variant="success"
          />
          <MetricCard
            title="Avg Fill Level"
            value="60.3%"
            icon={Gauge}
            variant="warning"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bin Status */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                Waste Bins Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BinStatusTable bins={mockBins} />
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAlerts.map((alert, index) => (
                <AlertItem key={index} {...alert} />
              ))}
            </CardContent>
          </Card>

          {/* Collection Routes */}
          <Card>
            <CardHeader>
              <CardTitle>Collection Routes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockRoutes.map((route, index) => (
                <RouteCard key={index} {...route} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
