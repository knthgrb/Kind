-- Create RPC function for spatial job filtering
CREATE OR REPLACE FUNCTION get_jobs_within_radius(
  user_lng DOUBLE PRECISION,
  user_lat DOUBLE PRECISION,
  radius_meters INTEGER
)
RETURNS TABLE(
  id UUID,
  distance_km DOUBLE PRECISION
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    jp.id,
    ST_Distance(
      ST_GeogFromText('POINT(' || user_lng || ' ' || user_lat || ')'),
      jp.location_coordinates::geography
    ) / 1000.0 as distance_km
  FROM job_posts jp
  WHERE 
    jp.status = 'active'
    AND jp.location_coordinates IS NOT NULL
    AND ST_DWithin(
      ST_GeogFromText('POINT(' || user_lng || ' ' || user_lat || ')'),
      jp.location_coordinates::geography,
      radius_meters
    )
  ORDER BY distance_km ASC;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_jobs_within_radius TO authenticated;

-- Create function to get jobs within user's preferred radius
CREATE OR REPLACE FUNCTION get_jobs_for_user_with_location(
  user_id UUID,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  job_title VARCHAR,
  job_description TEXT,
  required_skills VARCHAR[],
  salary VARCHAR,
  work_schedule JSONB,
  required_years_of_experience BIGINT,
  location VARCHAR,
  preferred_languages VARCHAR[],
  status VARCHAR,
  is_boosted BOOLEAN,
  boost_expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  job_type VARCHAR,
  salary_min REAL,
  salary_max REAL,
  salary_type TEXT,
  location_coordinates POINT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  kindbossing_user_id UUID,
  distance_km DOUBLE PRECISION
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH user_preferences AS (
    SELECT 
      u.location_coordinates,
      kjp.desired_job_location_radius
    FROM users u
    LEFT JOIN kindtao_job_preferences kjp ON u.id = kjp.kindtao_user_id
    WHERE u.id = user_id
  ),
  user_location AS (
    SELECT 
      ST_X(location_coordinates) as lng,
      ST_Y(location_coordinates) as lat,
      COALESCE(desired_job_location_radius, 10) as radius_km
    FROM user_preferences
    WHERE location_coordinates IS NOT NULL
  )
  SELECT 
    jp.*,
    CASE 
      WHEN ul.lng IS NOT NULL AND ul.lat IS NOT NULL THEN
        ST_Distance(
          ST_GeogFromText('POINT(' || ul.lng || ' ' || ul.lat || ')'),
          jp.location_coordinates::geography
        ) / 1000.0
      ELSE NULL
    END as distance_km
  FROM job_posts jp
  CROSS JOIN user_location ul
  WHERE 
    jp.status = 'active'
    AND (
      ul.lng IS NULL OR ul.lat IS NULL OR
      jp.location_coordinates IS NULL OR
      ST_DWithin(
        ST_GeogFromText('POINT(' || ul.lng || ' ' || ul.lat || ')'),
        jp.location_coordinates::geography,
        ul.radius_km * 1000
      )
    )
  ORDER BY 
    CASE WHEN ul.lng IS NOT NULL AND ul.lat IS NOT NULL THEN distance_km ELSE 0 END ASC,
    jp.created_at DESC
  LIMIT limit_count;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_jobs_for_user_with_location TO authenticated;
