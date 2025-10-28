import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Route {
  id: string;
  name: string;
  status: "planned" | "in_progress" | "completed";
  distance_km: number;
  estimated_time_minutes: number;
  bins: string[];
  created_at: string;
  updated_at: string;
}

export function useRoutes() {
  const { data: routes, isLoading, error, refetch } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collection_routes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Route[];
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('routes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collection_routes'
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

  return { routes: routes || [], isLoading, error };
}
