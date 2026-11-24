-- Wikidata identity for the African ingredient graph.
-- Aliases/claims imported from Wikidata stay review_status='proposed' until editors approve.

ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS wikidata_qid text;

CREATE UNIQUE INDEX IF NOT EXISTS ingredients_wikidata_qid_uidx
  ON public.ingredients (wikidata_qid)
  WHERE wikidata_qid IS NOT NULL;

COMMENT ON COLUMN public.ingredients.wikidata_qid IS
  'Wikidata entity id (e.g. Q11001). Populated by scripts/wikidata-ingredient-extract.mjs; editor-reviewed before trust elevation.';
