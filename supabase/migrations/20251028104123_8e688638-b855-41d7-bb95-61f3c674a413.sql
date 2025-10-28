-- Create bins table for waste bin management
CREATE TABLE public.bins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bin_id TEXT UNIQUE NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  fill_level DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (fill_level >= 0 AND fill_level <= 100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('critical', 'warning', 'normal', 'low')),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create collection_routes table
CREATE TABLE public.collection_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  distance_km DECIMAL(10,2) NOT NULL,
  estimated_time_minutes INTEGER NOT NULL,
  bins UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bin_id UUID REFERENCES public.bins(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create analytics_data table for tracking metrics
CREATE TABLE public.analytics_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  avg_fill_level DECIMAL(5,2),
  total_collections INTEGER DEFAULT 0,
  critical_bins INTEGER DEFAULT 0,
  distance_saved_km DECIMAL(10,2) DEFAULT 0,
  time_saved_minutes INTEGER DEFAULT 0,
  fuel_savings_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Enable Row Level Security
ALTER TABLE public.bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for dashboard display)
CREATE POLICY "Anyone can view bins"
  ON public.bins FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view routes"
  ON public.collection_routes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view alerts"
  ON public.alerts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view analytics"
  ON public.analytics_data FOR SELECT
  USING (true);

-- Create policies for insert/update (for IoT sensors and manual entry)
CREATE POLICY "Anyone can insert bins"
  ON public.bins FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update bins"
  ON public.bins FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can insert routes"
  ON public.collection_routes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update routes"
  ON public.collection_routes FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can insert alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update alerts"
  ON public.alerts FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can insert analytics"
  ON public.analytics_data FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update analytics"
  ON public.analytics_data FOR UPDATE
  USING (true);

-- Function to automatically update bin status based on fill level
CREATE OR REPLACE FUNCTION update_bin_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.fill_level >= 90 THEN
    NEW.status := 'critical';
  ELSIF NEW.fill_level >= 75 THEN
    NEW.status := 'warning';
  ELSIF NEW.fill_level >= 25 THEN
    NEW.status := 'normal';
  ELSE
    NEW.status := 'low';
  END IF;
  NEW.last_updated := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update bin status on insert or update
CREATE TRIGGER update_bin_status_trigger
  BEFORE INSERT OR UPDATE OF fill_level ON public.bins
  FOR EACH ROW
  EXECUTE FUNCTION update_bin_status();

-- Function to automatically create alerts for critical bins
CREATE OR REPLACE FUNCTION create_critical_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'critical' AND (OLD IS NULL OR OLD.status != 'critical') THEN
    INSERT INTO public.alerts (bin_id, message, severity)
    VALUES (
      NEW.id,
      NEW.location || ' bin at ' || NEW.fill_level || '% capacity',
      'critical'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create alerts for critical bins
CREATE TRIGGER create_critical_alert_trigger
  AFTER INSERT OR UPDATE OF status ON public.bins
  FOR EACH ROW
  EXECUTE FUNCTION create_critical_alert();

-- Enable realtime for bins and alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.bins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collection_routes;

-- Insert sample data
INSERT INTO public.bins (bin_id, location, capacity, fill_level, latitude, longitude) VALUES
  ('BIN-001', 'Connaught Place', 100, 45.5, 28.6280, 77.2194),
  ('BIN-002', 'Gateway of India', 100, 78.2, 18.9220, 72.8347),
  ('BIN-003', 'Howrah Bridge', 100, 92.1, 22.5851, 88.3472),
  ('BIN-004', 'Charminar', 100, 23.4, 17.3616, 78.4747),
  ('BIN-005', 'MG Road, Bengaluru', 100, 67.3, 12.9750, 77.6062),
  ('BIN-006', 'Marine Drive', 100, 88.5, 18.9432, 72.8236),
  ('BIN-007', 'India Gate', 100, 34.2, 28.6129, 77.2295),
  ('BIN-008', 'Victoria Memorial', 100, 56.7, 22.5448, 88.3426);

INSERT INTO public.collection_routes (name, status, distance_km, estimated_time_minutes) VALUES
  ('Critical Collection Route', 'planned', 12.5, 85),
  ('Regular Collection Route A', 'in_progress', 18.3, 120),
  ('Optimized Route 3', 'planned', 27.5, 114);

INSERT INTO public.analytics_data (date, avg_fill_level, total_collections, critical_bins, distance_saved_km, time_saved_minutes, fuel_savings_amount) VALUES
  (CURRENT_DATE - INTERVAL '6 days', 58.0, 2, 0, 3.2, 18, 340),
  (CURRENT_DATE - INTERVAL '5 days', 62.0, 3, 1, 4.1, 25, 425),
  (CURRENT_DATE - INTERVAL '4 days', 55.0, 2, 0, 2.8, 15, 280),
  (CURRENT_DATE - INTERVAL '3 days', 68.0, 4, 2, 5.5, 32, 540),
  (CURRENT_DATE - INTERVAL '2 days', 61.0, 3, 1, 3.9, 22, 380),
  (CURRENT_DATE - INTERVAL '1 day', 72.0, 5, 2, 6.2, 38, 620),
  (CURRENT_DATE, 60.3, 3, 1, 3.5, 20, 350);