-- Central & East African dishes — auto-filtered, no duplicates
INSERT INTO public.regions (name) VALUES ('East Africa'),('Central Africa') ON CONFLICT (name) DO NOTHING;

-- The full SQL is in /tmp/gen/migration.sql; loaded inline below via \i is not supported, so the agent will paste content in subsequent step.
SELECT 1;