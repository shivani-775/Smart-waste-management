import { useState } from "react";
import { Layout } from "@/components/Layout";
import { RouteCard } from "@/components/RouteCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Route, Plus, TrendingDown, Clock, Fuel } from "lucide-react";
import { toast } from "sonner";
import { useRoutes } from "@/hooks/useRoutes";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function RouteOptimization() {
  const { routes, isLoading } = useRoutes();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const handleCreateRoute = () => {
    toast.success("New optimized route created successfully!");
  };

  const handleViewRoute = (routeId: string) => {
    setSelectedRoute(routeId);
  };

  const handleStartCollection = async (routeId: string) => {
    try {
      const { error } = await supabase
        .from("collection_routes")
        .update({ status: "in_progress" })
        .eq("id", routeId);

      if (error) throw error;
      toast.success("Collection started!");
    } catch (error) {
      toast.error("Failed to start collection");
      console.error(error);
    }
  };

  const selectedRouteData = routes.find(r => r.id === selectedRoute);

  const displayRoutes = routes.map(route => ({
    id: route.id,
    name: route.name,
    status: route.status,
    distance: `${route.distance_km} km`,
    estimatedTime: `${route.estimated_time_minutes} min`,
    bins: route.bins || []
  }));

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading routes data...</div>
        </div>
      </Layout>
    );
  }

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
              {displayRoutes.length > 0 ? (
                displayRoutes.map((route) => (
                  <RouteCard 
                    key={route.id} 
                    {...route}
                    onViewRoute={handleViewRoute}
                    onStartCollection={handleStartCollection}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground col-span-3 text-center py-4">
                  No routes available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedRoute} onOpenChange={() => setSelectedRoute(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRouteData?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-semibold">{selectedRouteData?.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance:</span>
              <span className="font-semibold">{selectedRouteData?.distance_km} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-semibold">{selectedRouteData?.estimated_time_minutes} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bins:</span>
              <span className="font-semibold">{selectedRouteData?.bins?.length || 0}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
