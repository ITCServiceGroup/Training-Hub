-- Add icon field to sections and categories tables
ALTER TABLE v2_sections ADD COLUMN IF NOT EXISTS icon VARCHAR;
ALTER TABLE v2_categories ADD COLUMN IF NOT EXISTS icon VARCHAR;

-- Update existing sections with default icons based on name
UPDATE v2_sections
SET icon = 
  CASE 
    WHEN LOWER(name) LIKE '%network%' THEN 'Network'
    WHEN LOWER(name) LIKE '%install%' THEN 'Download'
    WHEN LOWER(name) LIKE '%service%' THEN 'Wrench'
    WHEN LOWER(name) LIKE '%troubleshoot%' THEN 'Search'
    WHEN LOWER(name) LIKE '%security%' THEN 'Lock'
    WHEN LOWER(name) LIKE '%hardware%' THEN 'Laptop'
    WHEN LOWER(name) LIKE '%software%' THEN 'Chart'
    WHEN LOWER(name) LIKE '%advanced%' THEN 'Rocket'
    ELSE 'Book'
  END
WHERE icon IS NULL;

-- Update existing categories with default icons based on name
UPDATE v2_categories
SET icon = 
  CASE 
    WHEN LOWER(name) LIKE '%network%' THEN 'Network'
    WHEN LOWER(name) LIKE '%install%' THEN 'Download'
    WHEN LOWER(name) LIKE '%service%' THEN 'Wrench'
    WHEN LOWER(name) LIKE '%troubleshoot%' THEN 'Search'
    WHEN LOWER(name) LIKE '%security%' THEN 'Lock'
    WHEN LOWER(name) LIKE '%hardware%' THEN 'Laptop'
    WHEN LOWER(name) LIKE '%software%' THEN 'Chart'
    ELSE 'Book'
  END
WHERE icon IS NULL;

-- Add comment to explain the icon field
COMMENT ON COLUMN v2_sections.icon IS 'Name of the icon to display for this section (e.g., "Book", "Network", "Download")';
COMMENT ON COLUMN v2_categories.icon IS 'Name of the icon to display for this category (e.g., "Book", "Network", "Download")';
