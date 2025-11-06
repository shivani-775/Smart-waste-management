-- Create collection history table
CREATE TABLE public.collection_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bin_id UUID REFERENCES public.bins(id) ON DELETE CASCADE NOT NULL,
  route_id UUID REFERENCES public.collection_routes(id) ON DELETE SET NULL,
  collected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  collected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  fill_level_before NUMERIC NOT NULL,
  fill_level_after NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create waste predictions table
CREATE TABLE public.waste_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bin_id UUID REFERENCES public.bins(id) ON DELETE CASCADE NOT NULL,
  predicted_fill_date TIMESTAMP WITH TIME ZONE NOT NULL,
  predicted_fill_level NUMERIC NOT NULL,
  confidence_score NUMERIC NOT NULL DEFAULT 0.75,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bin_id, predicted_fill_date)
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collection_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collection_history
CREATE POLICY "Authenticated users can view collection history"
  ON public.collection_history FOR SELECT
  USING (true);

CREATE POLICY "Operators can insert collection history"
  ON public.collection_history FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'operator'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- RLS Policies for waste_predictions
CREATE POLICY "Authenticated users can view predictions"
  ON public.waste_predictions FOR SELECT
  USING (true);

CREATE POLICY "System can manage predictions"
  ON public.waste_predictions FOR ALL
  USING (true);

-- RLS Policies for reports
CREATE POLICY "Authenticated users can view reports"
  ON public.reports FOR SELECT
  USING (true);

CREATE POLICY "Managers can generate reports"
  ON public.reports FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'manager'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Create triggers for audit logs
CREATE TRIGGER audit_collection_history_changes
  AFTER INSERT OR UPDATE ON public.collection_history
  FOR EACH ROW EXECUTE FUNCTION public.audit_bins_changes();

-- Add indexes for performance
CREATE INDEX idx_collection_history_bin_id ON public.collection_history(bin_id);
CREATE INDEX idx_collection_history_collected_at ON public.collection_history(collected_at);
CREATE INDEX idx_waste_predictions_bin_id ON public.waste_predictions(bin_id);
CREATE INDEX idx_reports_created_at ON public.reports(created_at);