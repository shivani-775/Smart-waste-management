import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

export interface Alert {
  id: string;
  bin_id: string | null;
  message: string;
  severity: "critical" | "warning" | "info";
  resolved: boolean;
  created_at: string;
  timeAgo: string;
}

export function useAlerts() {
  const { data: alerts, isLoading, error, refetch } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("resolved", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      
      return (data || []).map(alert => ({
        ...alert,
        timeAgo: formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })
      })) as Alert[];
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { alerts: alerts || [], isLoading, error };
}
