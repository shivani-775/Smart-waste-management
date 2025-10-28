import { Layout } from "@/components/Layout";
import { BinStatusTable } from "@/components/BinStatusTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, Trash2 } from "lucide-react";
import { useState } from "react";

const allBins = [
  { id: "1", location: "Connaught Place", capacity: "100L", fillLevel: 45, status: "normal" as const },
  { id: "2", location: "Gateway of India", capacity: "100L", fillLevel: 78, status: "warning" as const },
  { id: "3", location: "Howrah Bridge", capacity: "100L", fillLevel: 92, status: "critical" as const },
  { id: "4", location: "Charminar", capacity: "100L", fillLevel: 23, status: "low" as const },
  { id: "5", location: "MG Road, Bengaluru", capacity: "100L", fillLevel: 67, status: "normal" as const },
  { id: "6", location: "Marine Drive", capacity: "100L", fillLevel: 88, status: "warning" as const },
  { id: "7", location: "India Gate", capacity: "100L", fillLevel: 34, status: "normal" as const },
  { id: "8", location: "Victoria Memorial", capacity: "100L", fillLevel: 56, status: "normal" as const },
];

export default function BinMonitoring() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredBins = allBins.filter(bin => {
    const matchesSearch = bin.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || bin.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    critical: allBins.filter(b => b.status === "critical").length,
    warning: allBins.filter(b => b.status === "warning").length,
    normal: allBins.filter(b => b.status === "normal").length,
    low: allBins.filter(b => b.status === "low").length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Bin Monitoring</h2>
          <p className="text-muted-foreground mt-1">
            Track and manage all waste bins in real-time
          </p>
        </div>

        {/* Status Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-destructive">{statusCounts.critical}</p>
                </div>
                <Badge variant="destructive">Urgent</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Warning</p>
                  <p className="text-2xl font-bold text-[hsl(var(--warning))]">{statusCounts.warning}</p>
                </div>
                <Badge>Monitor</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Normal</p>
                  <p className="text-2xl font-bold text-secondary">{statusCounts.normal}</p>
                </div>
                <Badge variant="secondary">Good</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low</p>
                  <p className="text-2xl font-bold text-muted-foreground">{statusCounts.low}</p>
                </div>
                <Badge variant="outline">Empty</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                All Waste Bins ({filteredBins.length})
              </CardTitle>
              <div className="flex flex-col gap-2 md:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 md:w-64"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === "critical" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("critical")}
                  >
                    Critical
                  </Button>
                  <Button
                    variant={statusFilter === "warning" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("warning")}
                  >
                    Warning
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BinStatusTable bins={filteredBins} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
