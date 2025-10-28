import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Bin {
  id: string;
  bin_id: string;
  location: string;
  capacity: number;
  fill_level: number;
  latitude: number | null;
  longitude: number | null;
  status: "critical" | "warning" | "normal" | "low";
  last_updated: string;
  created_at: string;
}

export function useBins() {
  const { data: bins, isLoading, error, refetch } = useQuery({
    queryKey: ["bins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bins")
        .select("*")
        .order("fill_level", { ascending: false });

      if (error) throw error;
      return data as Bin[];
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('bins-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bins'
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

  return { bins: bins || [], isLoading, error };
}
