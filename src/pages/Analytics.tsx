import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function Analytics() {
  const weeklyData = [
    { day: "Mon", fillLevel: 58, collections: 2, critical: 0 },
    { day: "Tue", fillLevel: 62, collections: 3, critical: 1 },
    { day: "Wed", fillLevel: 55, collections: 2, critical: 0 },
    { day: "Thu", fillLevel: 68, collections: 4, critical: 2 },
    { day: "Fri", fillLevel: 61, collections: 3, critical: 1 },
    { day: "Sat", fillLevel: 72, collections: 5, critical: 2 },
    { day: "Sun", fillLevel: 59, collections: 3, critical: 1 },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h2>
          <p className="text-muted-foreground mt-1">
            Insights and trends from your waste management system
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Fill Level</p>
                  <p className="text-2xl font-bold text-foreground">62.1%</p>
                  <p className="text-xs text-secondary flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    5.2% from last week
                  </p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Collections</p>
                  <p className="text-2xl font-bold text-foreground">22</p>
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <TrendingDown className="h-3 w-3" />
                    3% from last week
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Efficiency Rate</p>
                  <p className="text-2xl font-bold text-foreground">87.3%</p>
                  <p className="text-xs text-secondary flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    12% from last month
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Response Time</p>
                  <p className="text-2xl font-bold text-foreground">18 min</p>
                  <p className="text-xs text-secondary flex items-center gap-1 mt-1">
                    <TrendingDown className="h-3 w-3" />
                    8 min faster
                  </p>
                </div>
                <Activity className="h-8 w-8 text-[hsl(var(--warning))]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Waste Management Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((data, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium text-muted-foreground">
                    {data.day}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Fill Level</span>
                      <span className="font-medium text-foreground">{data.fillLevel}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${data.fillLevel}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Collections: </span>
                      <span className="font-medium text-foreground">{data.collections}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Critical: </span>
                      <span className={`font-medium ${data.critical > 0 ? 'text-destructive' : 'text-secondary'}`}>
                        {data.critical}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Collection Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Optimized Routes</span>
                  <span className="text-sm font-medium text-foreground">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">On-Time Collections</span>
                  <span className="text-sm font-medium text-foreground">89%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Missed Pickups</span>
                  <span className="text-sm font-medium text-foreground">2.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Cost Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fuel Savings</span>
                  <span className="text-sm font-medium text-secondary">₹8,450</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Labor Hours Saved</span>
                  <span className="text-sm font-medium text-secondary">124 hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Savings</span>
                  <span className="text-sm font-medium text-secondary">₹24,890</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
