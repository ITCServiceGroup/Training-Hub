-- Add parent_id to categories for hierarchical structure
ALTER TABLE v2_categories 
ADD COLUMN parent_id uuid REFERENCES v2_categories(id) ON DELETE CASCADE;

CREATE INDEX v2_categories_parent_id_idx ON v2_categories(parent_id);

-- Update existing categories to be primary categories (null parent_id)
UPDATE v2_categories SET parent_id = NULL;

-- Add sample sub-categories
INSERT INTO v2_categories (name, description, section, parent_id)
SELECT 'Basic Installation', 'Basic installation procedures', 'install', id
FROM v2_categories 
WHERE name = 'Installation';

INSERT INTO v2_categories (name, description, section, parent_id)
SELECT 'Advanced Installation', 'Advanced installation procedures', 'install', id
FROM v2_categories 
WHERE name = 'Installation';

INSERT INTO v2_categories (name, description, section, parent_id)
SELECT 'Basic Service', 'Basic service procedures', 'service', id
FROM v2_categories 
WHERE name = 'Service';

INSERT INTO v2_categories (name, description, section, parent_id)
SELECT 'Advanced Service', 'Advanced service procedures', 'service', id
FROM v2_categories 
WHERE name = 'Service';
