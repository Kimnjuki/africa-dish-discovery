-- Diaspora commerce pilot: curated shop links for staple African ingredients.
-- URLs are search landing pages; client may append Amazon associate tags when configured.

CREATE UNIQUE INDEX IF NOT EXISTS affiliate_suppliers_ingredient_supplier_region_uidx
  ON public.affiliate_suppliers (ingredient_id, supplier_name, region)
  WHERE ingredient_id IS NOT NULL;

INSERT INTO public.affiliate_suppliers (ingredient_id, supplier_name, url, region)
SELECT i.id, v.supplier_name, v.url, v.region
FROM public.ingredients i
JOIN (
  VALUES
    ('egusi', 'Amazon US', 'https://www.amazon.com/s?k=egusi+melon+seeds', 'diaspora-us'),
    ('egusi', 'Amazon UK', 'https://www.amazon.co.uk/s?k=egusi+melon+seeds', 'diaspora-uk'),
    ('palm-oil', 'Amazon US', 'https://www.amazon.com/s?k=red+palm+oil+african', 'diaspora-us'),
    ('palm-oil', 'Amazon UK', 'https://www.amazon.co.uk/s?k=red+palm+oil', 'diaspora-uk'),
    ('scotch-bonnet', 'Amazon US', 'https://www.amazon.com/s?k=scotch+bonnet+pepper', 'diaspora-us'),
    ('scotch-bonnet', 'Amazon UK', 'https://www.amazon.co.uk/s?k=scotch+bonnet+pepper', 'diaspora-uk'),
    ('cassava', 'Amazon US', 'https://www.amazon.com/s?k=cassava+flour', 'diaspora-us'),
    ('cassava', 'Amazon UK', 'https://www.amazon.co.uk/s?k=cassava+flour', 'diaspora-uk'),
    ('garri', 'Amazon US', 'https://www.amazon.com/s?k=garri+cassava', 'diaspora-us'),
    ('garri', 'Amazon UK', 'https://www.amazon.co.uk/s?k=garri', 'diaspora-uk'),
    ('teff', 'Amazon US', 'https://www.amazon.com/s?k=teff+flour', 'diaspora-us'),
    ('teff', 'Amazon UK', 'https://www.amazon.co.uk/s?k=teff+flour', 'diaspora-uk'),
    ('fonio', 'Amazon US', 'https://www.amazon.com/s?k=fonio+grain', 'diaspora-us'),
    ('fonio', 'Amazon UK', 'https://www.amazon.co.uk/s?k=fonio', 'diaspora-uk'),
    ('crayfish', 'Amazon US', 'https://www.amazon.com/s?k=dried+crayfish+african', 'diaspora-us'),
    ('crayfish', 'Amazon UK', 'https://www.amazon.co.uk/s?k=dried+crayfish', 'diaspora-uk'),
    ('iru', 'Amazon US', 'https://www.amazon.com/s?k=iru+locust+beans', 'diaspora-us'),
    ('iru', 'Amazon UK', 'https://www.amazon.co.uk/s?k=locust+beans+iru', 'diaspora-uk'),
    ('groundnut', 'Amazon US', 'https://www.amazon.com/s?k=african+groundnut+paste', 'diaspora-us'),
    ('hibiscus', 'Amazon US', 'https://www.amazon.com/s?k=hibiscus+flowers+zobo', 'diaspora-us'),
    ('hibiscus', 'Amazon UK', 'https://www.amazon.co.uk/s?k=hibiscus+flowers+tea', 'diaspora-uk'),
    ('ugwu', 'Amazon US', 'https://www.amazon.com/s?k=ugu+leaves+fluted+pumpkin', 'diaspora-us'),
    ('plantain', 'Amazon US', 'https://www.amazon.com/s?k=plantain+chips+african', 'diaspora-us'),
    ('sorghum', 'Amazon US', 'https://www.amazon.com/s?k=sorghum+flour', 'diaspora-us'),
    ('egusi', 'Jumia NG', 'https://www.jumia.com.ng/catalog/?q=egusi', 'ng'),
    ('palm-oil', 'Jumia NG', 'https://www.jumia.com.ng/catalog/?q=palm+oil', 'ng'),
    ('garri', 'Jumia NG', 'https://www.jumia.com.ng/catalog/?q=garri', 'ng'),
    ('crayfish', 'Jumia NG', 'https://www.jumia.com.ng/catalog/?q=crayfish', 'ng'),
    ('sukuma-wiki', 'Jumia KE', 'https://www.jumia.co.ke/catalog/?q=sukuma+wiki', 'ke'),
    ('cassava', 'Jumia KE', 'https://www.jumia.co.ke/catalog/?q=cassava', 'ke')
) AS v(slug, supplier_name, url, region)
  ON i.slug = v.slug
WHERE NOT EXISTS (
  SELECT 1
  FROM public.affiliate_suppliers a
  WHERE a.ingredient_id = i.id
    AND a.supplier_name = v.supplier_name
    AND a.region IS NOT DISTINCT FROM v.region
);
