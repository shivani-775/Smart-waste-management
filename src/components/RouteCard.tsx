import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Route, Clock, MapPin } from "lucide-react";

interface RouteCardProps {
  name: string;
  status: "planned" | "in_progress" | "completed";
  distance: string;
  estimatedTime: string;
}

export function RouteCard({ name, status, distance, estimatedTime }: RouteCardProps) {
  const statusConfig = {
    planned: { label: "PLANNED", variant: "outline" as const, color: "text-muted-foreground" },
    in_progress: { label: "IN PROGRESS", variant: "default" as const, color: "text-primary" },
    completed: { label: "COMPLETED", variant: "secondary" as const, color: "text-success" },
  };

  const config = statusConfig[status];

  return (
    <Card className="border-border/50 hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold">{name}</CardTitle>
          </div>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Total Distance</span>
          </div>
          <span className="font-semibold text-foreground">{distance}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Est. Time</span>
          </div>
          <span className="font-semibold text-foreground">{estimatedTime}</span>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            View Route
          </Button>
          {status === "planned" && (
            <Button size="sm" className="flex-1">
              Start Collection
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
