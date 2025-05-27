-- Create templates table
CREATE TABLE v2_study_guide_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE TRIGGER set_timestamp_v2_study_guide_templates
BEFORE UPDATE ON v2_study_guide_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
