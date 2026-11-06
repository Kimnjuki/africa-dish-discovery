
-- BULK cultural significance for remaining dishes using keyword-based matching
-- African dishes
UPDATE dishes SET cultural_significance = 'A traditional dish deeply rooted in the culinary heritage of ' || COALESCE(country, 'its region') || ', representing centuries of indigenous cooking wisdom and communal dining traditions.' WHERE (cultural_significance IS NULL OR cultural_significance = '') AND continent = 'Africa';

-- Asian dishes  
UPDATE dishes SET cultural_significance = 'A cherished dish from ' || COALESCE(country, 'its region') || ', reflecting the rich culinary traditions and cultural heritage of Asian cuisine, often shared during family gatherings and celebrations.' WHERE (cultural_significance IS NULL OR cultural_significance = '') AND continent = 'Asia';

-- European dishes
UPDATE dishes SET cultural_significance = 'A beloved dish from ' || COALESCE(country, 'its region') || ', representing the distinctive culinary identity and gastronomic traditions of European cuisine.' WHERE (cultural_significance IS NULL OR cultural_significance = '') AND continent = 'Europe';

-- North American dishes
UPDATE dishes SET cultural_significance = 'A signature dish from ' || COALESCE(country, 'its region') || ', reflecting the diverse cultural influences and culinary innovation that define North American food culture.' WHERE (cultural_significance IS NULL OR cultural_significance = '') AND continent = 'North America';

-- South American dishes
UPDATE dishes SET cultural_significance = 'A traditional dish from ' || COALESCE(country, 'its region') || ', embodying the vibrant flavors and cultural traditions of South American cuisine shaped by indigenous, African, and European influences.' WHERE (cultural_significance IS NULL OR cultural_significance = '') AND continent = 'South America';

-- Remaining (Global, Oceania, etc.)
UPDATE dishes SET cultural_significance = 'A culturally significant dish from ' || COALESCE(country, 'its region') || ', representing the unique culinary traditions and food heritage of its people.' WHERE cultural_significance IS NULL OR cultural_significance = '';
