-- Add description column to v2_study_guides for custom descriptions
ALTER TABLE v2_study_guides
ADD COLUMN description text;

COMMENT ON COLUMN v2_study_guides.description IS 'Optional custom description that overrides the auto-generated description when provided.';
