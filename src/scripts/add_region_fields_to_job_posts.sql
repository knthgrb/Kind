-- Add province and region fields to job_posts table
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS province VARCHAR,
ADD COLUMN IF NOT EXISTS region VARCHAR;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_posts_province 
ON public.job_posts USING btree (province) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_job_posts_region 
ON public.job_posts USING btree (region) TABLESPACE pg_default;

-- Create composite index for location-based queries
CREATE INDEX IF NOT EXISTS idx_job_posts_location_region 
ON public.job_posts USING btree (province, region) TABLESPACE pg_default;

-- Update existing job posts to extract province and region from location
-- This is a one-time migration to populate the new fields
UPDATE public.job_posts 
SET 
  province = CASE 
    WHEN location ILIKE '%Metro Manila%' OR location ILIKE '%Manila%' OR location ILIKE '%Quezon City%' OR location ILIKE '%Makati%' OR location ILIKE '%Taguig%' OR location ILIKE '%Pasig%' OR location ILIKE '%Mandaluyong%' OR location ILIKE '%San Juan%' OR location ILIKE '%Marikina%' OR location ILIKE '%Caloocan%' OR location ILIKE '%Malabon%' OR location ILIKE '%Navotas%' OR location ILIKE '%Parañaque%' OR location ILIKE '%Las Piñas%' OR location ILIKE '%Muntinlupa%' OR location ILIKE '%Pateros%' OR location ILIKE '%Valenzuela%' THEN 'Metro Manila'
    WHEN location ILIKE '%Cavite%' THEN 'Cavite'
    WHEN location ILIKE '%Laguna%' THEN 'Laguna'
    WHEN location ILIKE '%Rizal%' THEN 'Rizal'
    WHEN location ILIKE '%Bulacan%' THEN 'Bulacan'
    WHEN location ILIKE '%Bataan%' THEN 'Bataan'
    WHEN location ILIKE '%Nueva Ecija%' THEN 'Nueva Ecija'
    WHEN location ILIKE '%Pampanga%' THEN 'Pampanga'
    WHEN location ILIKE '%Tarlac%' THEN 'Tarlac'
    WHEN location ILIKE '%Zambales%' THEN 'Zambales'
    WHEN location ILIKE '%Aurora%' THEN 'Aurora'
    WHEN location ILIKE '%Batangas%' THEN 'Batangas'
    WHEN location ILIKE '%Quezon%' THEN 'Quezon'
    WHEN location ILIKE '%Cebu%' THEN 'Cebu'
    WHEN location ILIKE '%Bohol%' THEN 'Bohol'
    WHEN location ILIKE '%Negros Oriental%' THEN 'Negros Oriental'
    WHEN location ILIKE '%Siquijor%' THEN 'Siquijor'
    WHEN location ILIKE '%Iloilo%' THEN 'Iloilo'
    WHEN location ILIKE '%Capiz%' THEN 'Capiz'
    WHEN location ILIKE '%Aklan%' THEN 'Aklan'
    WHEN location ILIKE '%Antique%' THEN 'Antique'
    WHEN location ILIKE '%Guimaras%' THEN 'Guimaras'
    WHEN location ILIKE '%Negros Occidental%' THEN 'Negros Occidental'
    WHEN location ILIKE '%Leyte%' THEN 'Leyte'
    WHEN location ILIKE '%Samar%' THEN 'Samar'
    WHEN location ILIKE '%Eastern Samar%' THEN 'Eastern Samar'
    WHEN location ILIKE '%Northern Samar%' THEN 'Northern Samar'
    WHEN location ILIKE '%Southern Leyte%' THEN 'Southern Leyte'
    WHEN location ILIKE '%Biliran%' THEN 'Biliran'
    WHEN location ILIKE '%Davao%' THEN 'Davao del Sur'
    WHEN location ILIKE '%Cagayan%' THEN 'Cagayan'
    WHEN location ILIKE '%Isabela%' THEN 'Isabela'
    WHEN location ILIKE '%Nueva Vizcaya%' THEN 'Nueva Vizcaya'
    WHEN location ILIKE '%Quirino%' THEN 'Quirino'
    WHEN location ILIKE '%Batanes%' THEN 'Batanes'
    WHEN location ILIKE '%Ilocos Norte%' THEN 'Ilocos Norte'
    WHEN location ILIKE '%Ilocos Sur%' THEN 'Ilocos Sur'
    WHEN location ILIKE '%La Union%' THEN 'La Union'
    WHEN location ILIKE '%Pangasinan%' THEN 'Pangasinan'
    WHEN location ILIKE '%Abra%' THEN 'Abra'
    WHEN location ILIKE '%Apayao%' THEN 'Apayao'
    WHEN location ILIKE '%Benguet%' THEN 'Benguet'
    WHEN location ILIKE '%Ifugao%' THEN 'Ifugao'
    WHEN location ILIKE '%Kalinga%' THEN 'Kalinga'
    WHEN location ILIKE '%Mountain Province%' THEN 'Mountain Province'
    WHEN location ILIKE '%Albay%' THEN 'Albay'
    WHEN location ILIKE '%Camarines Norte%' THEN 'Camarines Norte'
    WHEN location ILIKE '%Camarines Sur%' THEN 'Camarines Sur'
    WHEN location ILIKE '%Catanduanes%' THEN 'Catanduanes'
    WHEN location ILIKE '%Masbate%' THEN 'Masbate'
    WHEN location ILIKE '%Sorsogon%' THEN 'Sorsogon'
    WHEN location ILIKE '%Marinduque%' THEN 'Marinduque'
    WHEN location ILIKE '%Occidental Mindoro%' THEN 'Occidental Mindoro'
    WHEN location ILIKE '%Oriental Mindoro%' THEN 'Oriental Mindoro'
    WHEN location ILIKE '%Palawan%' THEN 'Palawan'
    WHEN location ILIKE '%Romblon%' THEN 'Romblon'
    WHEN location ILIKE '%Zamboanga del Norte%' THEN 'Zamboanga del Norte'
    WHEN location ILIKE '%Zamboanga del Sur%' THEN 'Zamboanga del Sur'
    WHEN location ILIKE '%Zamboanga Sibugay%' THEN 'Zamboanga Sibugay'
    WHEN location ILIKE '%Bukidnon%' THEN 'Bukidnon'
    WHEN location ILIKE '%Camiguin%' THEN 'Camiguin'
    WHEN location ILIKE '%Lanao del Norte%' THEN 'Lanao del Norte'
    WHEN location ILIKE '%Misamis Occidental%' THEN 'Misamis Occidental'
    WHEN location ILIKE '%Misamis Oriental%' THEN 'Misamis Oriental'
    WHEN location ILIKE '%Davao del Norte%' THEN 'Davao del Norte'
    WHEN location ILIKE '%Davao del Sur%' THEN 'Davao del Sur'
    WHEN location ILIKE '%Davao Occidental%' THEN 'Davao Occidental'
    WHEN location ILIKE '%Davao Oriental%' THEN 'Davao Oriental'
    WHEN location ILIKE '%Davao de Oro%' THEN 'Davao de Oro'
    WHEN location ILIKE '%Cotabato%' THEN 'Cotabato'
    WHEN location ILIKE '%Sarangani%' THEN 'Sarangani'
    WHEN location ILIKE '%South Cotabato%' THEN 'South Cotabato'
    WHEN location ILIKE '%Sultan Kudarat%' THEN 'Sultan Kudarat'
    WHEN location ILIKE '%Agusan del Norte%' THEN 'Agusan del Norte'
    WHEN location ILIKE '%Agusan del Sur%' THEN 'Agusan del Sur'
    WHEN location ILIKE '%Dinagat Islands%' THEN 'Dinagat Islands'
    WHEN location ILIKE '%Surigao del Norte%' THEN 'Surigao del Norte'
    WHEN location ILIKE '%Surigao del Sur%' THEN 'Surigao del Sur'
    WHEN location ILIKE '%Basilan%' THEN 'Basilan'
    WHEN location ILIKE '%Lanao del Sur%' THEN 'Lanao del Sur'
    WHEN location ILIKE '%Maguindanao%' THEN 'Maguindanao'
    WHEN location ILIKE '%Sulu%' THEN 'Sulu'
    WHEN location ILIKE '%Tawi-Tawi%' THEN 'Tawi-Tawi'
    ELSE NULL
  END,
  region = CASE 
    WHEN location ILIKE '%Metro Manila%' OR location ILIKE '%Manila%' OR location ILIKE '%Quezon City%' OR location ILIKE '%Makati%' OR location ILIKE '%Taguig%' OR location ILIKE '%Pasig%' OR location ILIKE '%Mandaluyong%' OR location ILIKE '%San Juan%' OR location ILIKE '%Marikina%' OR location ILIKE '%Caloocan%' OR location ILIKE '%Malabon%' OR location ILIKE '%Navotas%' OR location ILIKE '%Parañaque%' OR location ILIKE '%Las Piñas%' OR location ILIKE '%Muntinlupa%' OR location ILIKE '%Pateros%' OR location ILIKE '%Valenzuela%' THEN 'National Capital Region'
    WHEN location ILIKE '%Cavite%' OR location ILIKE '%Laguna%' OR location ILIKE '%Rizal%' OR location ILIKE '%Batangas%' OR location ILIKE '%Quezon%' THEN 'CALABARZON'
    WHEN location ILIKE '%Bulacan%' OR location ILIKE '%Bataan%' OR location ILIKE '%Nueva Ecija%' OR location ILIKE '%Pampanga%' OR location ILIKE '%Tarlac%' OR location ILIKE '%Zambales%' OR location ILIKE '%Aurora%' THEN 'Central Luzon'
    WHEN location ILIKE '%Cebu%' OR location ILIKE '%Bohol%' OR location ILIKE '%Negros Oriental%' OR location ILIKE '%Siquijor%' THEN 'Central Visayas'
    WHEN location ILIKE '%Iloilo%' OR location ILIKE '%Capiz%' OR location ILIKE '%Aklan%' OR location ILIKE '%Antique%' OR location ILIKE '%Guimaras%' OR location ILIKE '%Negros Occidental%' THEN 'Western Visayas'
    WHEN location ILIKE '%Leyte%' OR location ILIKE '%Samar%' OR location ILIKE '%Eastern Samar%' OR location ILIKE '%Northern Samar%' OR location ILIKE '%Southern Leyte%' OR location ILIKE '%Biliran%' THEN 'Eastern Visayas'
    WHEN location ILIKE '%Davao%' THEN 'Davao Region'
    WHEN location ILIKE '%Cagayan%' OR location ILIKE '%Isabela%' OR location ILIKE '%Nueva Vizcaya%' OR location ILIKE '%Quirino%' OR location ILIKE '%Batanes%' THEN 'Cagayan Valley'
    WHEN location ILIKE '%Ilocos Norte%' OR location ILIKE '%Ilocos Sur%' OR location ILIKE '%La Union%' OR location ILIKE '%Pangasinan%' THEN 'Ilocos Region'
    WHEN location ILIKE '%Abra%' OR location ILIKE '%Apayao%' OR location ILIKE '%Benguet%' OR location ILIKE '%Ifugao%' OR location ILIKE '%Kalinga%' OR location ILIKE '%Mountain Province%' THEN 'Cordillera Administrative Region'
    WHEN location ILIKE '%Albay%' OR location ILIKE '%Camarines Norte%' OR location ILIKE '%Camarines Sur%' OR location ILIKE '%Catanduanes%' OR location ILIKE '%Masbate%' OR location ILIKE '%Sorsogon%' THEN 'Bicol Region'
    WHEN location ILIKE '%Marinduque%' OR location ILIKE '%Occidental Mindoro%' OR location ILIKE '%Oriental Mindoro%' OR location ILIKE '%Palawan%' OR location ILIKE '%Romblon%' THEN 'MIMAROPA'
    WHEN location ILIKE '%Zamboanga%' THEN 'Zamboanga Peninsula'
    WHEN location ILIKE '%Bukidnon%' OR location ILIKE '%Camiguin%' OR location ILIKE '%Lanao del Norte%' OR location ILIKE '%Misamis Occidental%' OR location ILIKE '%Misamis Oriental%' THEN 'Northern Mindanao'
    WHEN location ILIKE '%Cotabato%' OR location ILIKE '%Sarangani%' OR location ILIKE '%South Cotabato%' OR location ILIKE '%Sultan Kudarat%' THEN 'SOCCSKSARGEN'
    WHEN location ILIKE '%Agusan%' OR location ILIKE '%Dinagat Islands%' OR location ILIKE '%Surigao%' THEN 'Caraga'
    WHEN location ILIKE '%Basilan%' OR location ILIKE '%Lanao del Sur%' OR location ILIKE '%Maguindanao%' OR location ILIKE '%Sulu%' OR location ILIKE '%Tawi-Tawi%' THEN 'Bangsamoro Autonomous Region'
    ELSE NULL
  END
WHERE province IS NULL OR region IS NULL;
