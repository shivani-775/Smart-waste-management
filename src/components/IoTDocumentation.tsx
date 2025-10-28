import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Zap } from "lucide-react";
import { Badge } from "./ui/badge";

export function IoTDocumentation() {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const endpoint = `https://${projectId}.supabase.co/functions/v1/iot-sensor-update`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[hsl(var(--warning))]" />
          IoT Sensor Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Connect your IoT sensors to automatically update bin data in real-time.
          </p>
          <Badge variant="secondary">Public Endpoint - No Auth Required</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Endpoint:</span>
          </div>
          <code className="block p-3 rounded-lg bg-muted text-sm break-all">
            {endpoint}
          </code>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Example Request (POST):</p>
          <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto">
{`{
  "bin_id": "BIN-001",
  "fill_level": 85.5,
  "latitude": 28.6280,
  "longitude": 77.2194
}`}
          </pre>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">cURL Example:</p>
          <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto">
{`curl -X POST \\
  ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "bin_id": "BIN-001",
    "fill_level": 85.5,
    "latitude": 28.6280,
    "longitude": 77.2194
  }'`}
          </pre>
        </div>

        <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
          <p className="text-sm text-foreground">
            <strong>Features:</strong>
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
            <li>Automatically updates existing bins or creates new ones</li>
            <li>Updates status based on fill level (critical ≥90%, warning ≥75%)</li>
            <li>Creates alerts for critical bins</li>
            <li>Real-time dashboard updates via WebSockets</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
