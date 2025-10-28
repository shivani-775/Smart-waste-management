import { Layout } from "@/components/Layout";
import { RouteCard } from "@/components/RouteCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Route, Plus, TrendingDown, Clock, Fuel } from "lucide-react";
import { toast } from "sonner";

const routes = [
  { name: "Critical Collection Route", status: "planned" as const, distance: "12.5 km", estimatedTime: "85 min" },
  { name: "Regular Collection Route A", status: "in_progress" as const, distance: "18.3 km", estimatedTime: "120 min" },
  { name: "Optimized Route 3", status: "planned" as const, distance: "27.5 km", estimatedTime: "114 min" },
  { name: "Downtown Collection Route", status: "completed" as const, distance: "15.8 km", estimatedTime: "95 min" },
  { name: "Suburban Route B", status: "planned" as const, distance: "22.1 km", estimatedTime: "135 min" },
];

export default function RouteOptimization() {
  const handleCreateRoute = () => {
    toast.success("New optimized route created successfully!");
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Route Optimization</h2>
            <p className="text-muted-foreground mt-1">
              Manage and optimize collection routes for maximum efficiency
            </p>
          </div>
          <Button onClick={handleCreateRoute} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Optimized Route
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <TrendingDown className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Distance Saved</p>
                  <p className="text-2xl font-bold text-foreground">23.4 km</p>
                  <p className="text-xs text-secondary">↓ 18% from last week</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Saved</p>
                  <p className="text-2xl font-bold text-foreground">142 min</p>
                  <p className="text-xs text-primary">↓ 22% from last week</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-[hsl(var(--warning))]/10">
                  <Fuel className="h-6 w-6 text-[hsl(var(--warning))]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fuel Savings</p>
                  <p className="text-2xl font-bold text-foreground">₹2,340</p>
                  <p className="text-xs text-[hsl(var(--warning))]">↓ 15% from last week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Routes List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" />
              Collection Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {routes.map((route, index) => (
                <RouteCard key={index} {...route} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
