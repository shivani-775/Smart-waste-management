import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Bell, Database, Zap } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { IoTDocumentation } from "@/components/IoTDocumentation";

export default function Settings() {
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleSeedData = () => {
    toast.success("Sample data loaded successfully!");
  };

  const handleSimulate = () => {
    toast.success("Real-time simulation started!");
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Settings</h2>
          <p className="text-muted-foreground mt-1">
            Configure your smart waste management system
          </p>
        </div>

        {/* IoT Documentation */}
        <IoTDocumentation />

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              System Configuration
            </CardTitle>
            <CardDescription>
              Manage system-wide settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-optimize" className="text-base">
                  Auto Route Optimization
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically optimize routes based on bin fill levels
                </p>
              </div>
              <Switch
                id="auto-optimize"
                checked={autoOptimize}
                onCheckedChange={setAutoOptimize}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="text-base">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for critical bin levels
                </p>
              </div>
              <Switch
                id="notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Database Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-secondary" />
              Database Management
            </CardTitle>
            <CardDescription>
              Manage system data and testing utilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div>
                <p className="font-medium text-foreground">Seed Sample Data</p>
                <p className="text-sm text-muted-foreground">Load sample waste bin data for testing</p>
              </div>
              <Button onClick={handleSeedData} variant="outline">
                Seed Data
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div>
                <p className="font-medium text-foreground">Simulate Real-time Updates</p>
                <p className="text-sm text-muted-foreground">Generate realistic bin level changes</p>
              </div>
              <Button onClick={handleSimulate} variant="outline">
                Start Simulation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[hsl(var(--warning))]" />
              API Status
            </CardTitle>
            <CardDescription>
              Monitor system connectivity and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div>
                <p className="font-medium text-foreground">Backend Connection</p>
                <p className="text-sm text-muted-foreground">Status of API connection</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-sm font-medium text-secondary">Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

