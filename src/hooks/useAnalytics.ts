import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface AnalyticsData {
  id: string;
  date: string;
  avg_fill_level: number;
  total_collections: number;
  critical_bins: number;
  distance_saved_km: number;
  time_saved_minutes: number;
  fuel_savings_amount: number;
  created_at: string;
}

export function useAnalytics() {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_data")
        .select("*")
        .order("date", { ascending: true })
        .limit(7);

      if (error) throw error;
      return data as AnalyticsData[];
    },
  });

  const weeklyData = analytics?.map(day => ({
    day: format(new Date(day.date), 'EEE'),
    fillLevel: day.avg_fill_level,
    collections: day.total_collections,
    critical: day.critical_bins
  })) || [];

  return { analytics: analytics || [], weeklyData, isLoading, error };
}
