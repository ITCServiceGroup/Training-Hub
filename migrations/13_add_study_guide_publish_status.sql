-- Add is_published column to v2_study_guides for publish functionality
ALTER TABLE v2_study_guides
ADD COLUMN is_published boolean DEFAULT false;

-- Add an index for faster querying of published study guides
CREATE INDEX IF NOT EXISTS idx_study_guides_is_published ON v2_study_guides(is_published);

-- Set existing study guides to published for backward compatibility
UPDATE v2_study_guides SET is_published = true WHERE is_published IS NULL;

COMMENT ON COLUMN v2_study_guides.is_published IS 'Indicates whether the study guide is published and visible to public users. Default is false.';
