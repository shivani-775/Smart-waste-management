import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertItemProps {
  message: string;
  time: string;
  severity: "critical" | "warning" | "info";
}

export function AlertItem({ message, time, severity }: AlertItemProps) {
  const severityStyles = {
    critical: "border-l-destructive bg-destructive/5",
    warning: "border-l-[hsl(var(--warning))] bg-[hsl(var(--warning))]/5",
    info: "border-l-primary bg-primary/5",
  };

  const severityBadge = {
    critical: "destructive",
    warning: "default",
    info: "secondary",
  };

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border-l-4 transition-all hover:shadow-md",
      severityStyles[severity]
    )}>
      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
      <div className="flex-1 space-y-1">
        <p className="text-sm text-foreground">{message}</p>
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
      </div>
    </div>
  );
}
