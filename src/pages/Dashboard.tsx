import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { AlertItem } from "@/components/AlertItem";
import { BinStatusTable } from "@/components/BinStatusTable";
import { RouteCard } from "@/components/RouteCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, AlertTriangle, TrendingUp, Gauge } from "lucide-react";
import { useBins } from "@/hooks/useBins";
import { useRoutes } from "@/hooks/useRoutes";
import { useAlerts } from "@/hooks/useAlerts";

export default function Dashboard() {
  const { bins, isLoading: binsLoading } = useBins();
  const { routes, isLoading: routesLoading } = useRoutes();
  const { alerts, isLoading: alertsLoading } = useAlerts();

  const totalBins = bins.length;
  const criticalBins = bins.filter(b => b.status === "critical").length;
  const collectionsToday = routes.filter(r => r.status === "in_progress" || r.status === "completed").length;
  const avgFillLevel = bins.length > 0 
    ? (bins.reduce((sum, b) => sum + b.fill_level, 0) / bins.length).toFixed(1)
    : "0.0";

  const displayBins = bins.slice(0, 4).map(bin => ({
    id: bin.bin_id,
    location: bin.location,
    capacity: `${bin.capacity}L`,
    fillLevel: bin.fill_level,
    status: bin.status
  }));

  const displayRoutes = routes.slice(0, 3).map(route => ({
    id: route.id,
    name: route.name,
    status: route.status,
    distance: `${route.distance_km} km`,
    estimatedTime: `${route.estimated_time_minutes} min`,
    bins: route.bins || []
  }));

  if (binsLoading || routesLoading || alertsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading dashboard data...</div>
        </div>
      </Layout>
    );
  }

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
            value={totalBins}
            icon={Trash2}
            variant="default"
          />
          <MetricCard
            title="Critical Bins"
            value={criticalBins}
            icon={AlertTriangle}
            variant="danger"
            trend={criticalBins > 0 ? { value: `${criticalBins} need attention`, positive: false } : undefined}
          />
          <MetricCard
            title="Collections Today"
            value={collectionsToday}
            icon={TrendingUp}
            variant="success"
          />
          <MetricCard
            title="Avg Fill Level"
            value={`${avgFillLevel}%`}
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
              <BinStatusTable bins={displayBins} />
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
              {alerts.length > 0 ? (
                alerts.slice(0, 4).map((alert) => (
                  <AlertItem 
                    key={alert.id} 
                    message={alert.message}
                    time={alert.timeAgo}
                    severity={alert.severity}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active alerts
                </p>
              )}
            </CardContent>
          </Card>

          {/* Collection Routes */}
          <Card>
            <CardHeader>
              <CardTitle>Collection Routes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayRoutes.length > 0 ? (
                displayRoutes.map((route, index) => (
                  <RouteCard key={index} {...route} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No routes available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
