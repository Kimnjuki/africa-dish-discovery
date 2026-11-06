-- Enable RLS on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Enable RLS on regions table  
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for events table (public read access for events)
CREATE POLICY "Events are publicly viewable" ON public.events
  FOR SELECT USING (active = true);

-- Add RLS policies for regions table (public read access for regions)
CREATE POLICY "Regions are publicly viewable" ON public.regions
  FOR SELECT USING (true);