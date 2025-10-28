import { Layout } from "@/components/Layout";
import { BinStatusTable } from "@/components/BinStatusTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { useBins } from "@/hooks/useBins";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function BinMonitoring() {
  const { bins, isLoading } = useBins();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [newBin, setNewBin] = useState({
    bin_id: "",
    location: "",
    capacity: 100,
    fill_level: 0
  });

  const filteredBins = bins.filter(bin => {
    const matchesSearch = bin.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || bin.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayBins = filteredBins.map(bin => ({
    id: bin.bin_id,
    location: bin.location,
    capacity: `${bin.capacity}L`,
    fillLevel: bin.fill_level,
    status: bin.status
  }));

  const statusCounts = {
    critical: bins.filter(b => b.status === "critical").length,
    warning: bins.filter(b => b.status === "warning").length,
    normal: bins.filter(b => b.status === "normal").length,
    low: bins.filter(b => b.status === "low").length,
  };

  const handleAddBin = async () => {
    if (!newBin.bin_id || !newBin.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    const { error } = await supabase.from("bins").insert({
      bin_id: newBin.bin_id,
      location: newBin.location,
      capacity: newBin.capacity,
      fill_level: newBin.fill_level
    });

    if (error) {
      toast.error("Failed to add bin: " + error.message);
    } else {
      toast.success("Bin added successfully!");
      setOpen(false);
      setNewBin({ bin_id: "", location: "", capacity: 100, fill_level: 0 });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading bins data...</div>
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
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Bin Monitoring</h2>
            <p className="text-muted-foreground mt-1">
              Track and manage all waste bins in real-time
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Bin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Bin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="bin-id">Bin ID *</Label>
                  <Input
                    id="bin-id"
                    placeholder="BIN-009"
                    value={newBin.bin_id}
                    onChange={(e) => setNewBin({ ...newBin, bin_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Enter location"
                    value={newBin.location}
                    onChange={(e) => setNewBin({ ...newBin, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (Liters)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newBin.capacity}
                    onChange={(e) => setNewBin({ ...newBin, capacity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fill-level">Initial Fill Level (%)</Label>
                  <Input
                    id="fill-level"
                    type="number"
                    min="0"
                    max="100"
                    value={newBin.fill_level}
                    onChange={(e) => setNewBin({ ...newBin, fill_level: parseFloat(e.target.value) })}
                  />
                </div>
                <Button onClick={handleAddBin} className="w-full">Add Bin</Button>
              </div>
            </DialogContent>
          </Dialog>
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
            <BinStatusTable bins={displayBins} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

