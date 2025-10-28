import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Bin {
  id: string;
  location: string;
  capacity: string;
  fillLevel: number;
  status: "critical" | "warning" | "normal" | "low";
}

interface BinStatusTableProps {
  bins: Bin[];
}

export function BinStatusTable({ bins }: BinStatusTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "destructive";
      case "warning":
        return "default";
      case "normal":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getProgressColor = (fillLevel: number) => {
    if (fillLevel >= 90) return "bg-destructive";
    if (fillLevel >= 75) return "bg-[hsl(var(--warning))]";
    if (fillLevel >= 50) return "bg-primary";
    return "bg-secondary";
  };

  return (
    <div className="space-y-3">
      {bins.map((bin) => (
        <div
          key={bin.id}
          className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{bin.location}</span>
              </div>
              <Badge variant={getStatusColor(bin.status) as any}>
                {bin.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                ID: {bin.id} • Capacity: {bin.capacity}
              </span>
              <div className="flex-1 flex items-center gap-2">
                <Progress 
                  value={bin.fillLevel} 
                  className="h-2 flex-1"
                  indicatorClassName={getProgressColor(bin.fillLevel)}
                />
                <span className="text-sm font-medium text-foreground min-w-[45px]">
                  {bin.fillLevel}%
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
