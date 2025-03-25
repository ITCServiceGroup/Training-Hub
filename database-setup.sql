-- Database setup for Training Hub v2
-- Execute this in Supabase SQL Editor

-- Helper function for updated_at timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Categories
create table v2_categories (
  id uuid default uuid_generate_v4() primary key,
  name varchar not null,
  description text,
  section varchar not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create trigger v2_categories_updated_at_trigger
  before update on v2_categories
  for each row
  execute function update_updated_at_column();

-- Study Guides
create table v2_study_guides (x
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references v2_categories(id) on delete cascade,
  title varchar not null,
  content text not null, -- Rich text content
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create index v2_study_guides_category_id_idx on v2_study_guides(category_id);
create index v2_study_guides_display_order_idx on v2_study_guides(display_order);

create trigger v2_study_guides_updated_at_trigger
  before update on v2_study_guides
  for each row
  execute function update_updated_at_column();

-- Questions
create table v2_questions (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references v2_categories(id) on delete cascade,
  question_text text not null,
  question_type varchar not null check (question_type in ('multiple_choice', 'check_all_that_apply', 'true_false')),
  options jsonb, -- Array for multiple choice/check all options
  correct_answer jsonb not null, -- Single index for MC, array for Check All, boolean for T/F
  explanation text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create index v2_questions_category_id_idx on v2_questions(category_id);

create trigger v2_questions_updated_at_trigger
  before update on v2_questions
  for each row
  execute function update_updated_at_column();

-- Quizzes
create table v2_quizzes (
  id uuid default uuid_generate_v4() primary key,
  title varchar not null,
  description text,
  category_ids jsonb not null, -- Array of category IDs
  time_limit integer, -- In seconds, null for no limit
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create trigger v2_quizzes_updated_at_trigger
  before update on v2_quizzes
  for each row
  execute function update_updated_at_column();

-- New Quiz Results (separate from existing "Quiz Results" table)
create table v2_quiz_results (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references v2_quizzes(id) on delete cascade,
  user_identifier varchar not null, -- External ID (LDAP, email, etc.)
  supervisor varchar,
  market varchar,
  score_value decimal not null,
  score_text varchar not null,
  answers jsonb not null, -- Record of answers given
  time_taken integer, -- In seconds
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index v2_quiz_results_quiz_id_idx on v2_quiz_results(quiz_id);
create index v2_quiz_results_created_at_idx on v2_quiz_results(created_at);

-- Row Level Security Policies

-- Categories: public read, admin write
alter table v2_categories enable row level security;

create policy "Public can read v2_categories" 
  on v2_categories for select 
  using (true);

create policy "Only admins can modify v2_categories" 
  on v2_categories for insert update delete 
  using (auth.role() = 'authenticated');

-- Study Guides: public read, admin write
alter table v2_study_guides enable row level security;

create policy "Public can read v2_study_guides" 
  on v2_study_guides for select 
  using (true);

create policy "Only admins can modify v2_study_guides" 
  on v2_study_guides for insert update delete 
  using (auth.role() = 'authenticated');

-- Questions: public read, admin write
alter table v2_questions enable row level security;

create policy "Public can read v2_questions" 
  on v2_questions for select 
  using (true);

create policy "Only admins can modify v2_questions" 
  on v2_questions for insert update delete 
  using (auth.role() = 'authenticated');

-- Quizzes: public read, admin write
alter table v2_quizzes enable row level security;

create policy "Public can read v2_quizzes" 
  on v2_quizzes for select 
  using (true);

create policy "Only admins can modify v2_quizzes" 
  on v2_quizzes for insert update delete 
  using (auth.role() = 'authenticated');

-- Quiz Results: public insert, admin read
alter table v2_quiz_results enable row level security;

create policy "Public can submit v2_quiz_results" 
  on v2_quiz_results for insert 
  using (true);

create policy "Only admins can read v2_quiz_results" 
  on v2_quiz_results for select 
  using (auth.role() = 'authenticated');

-- Note: Storage bucket "v2-media" needs to be created in the Supabase UI
-- After creating the bucket, execute these policies:

/* 
   After creating the "v2-media" bucket in Supabase dashboard, 
   execute these policies manually:

   create policy "Public can read v2-media"
     on storage.objects for select
     using (bucket_id = 'v2-media');
    
   create policy "Only admins can upload v2-media"
     on storage.objects for insert
     using (bucket_id = 'v2-media' and auth.role() = 'authenticated')
     with check (bucket_id = 'v2-media');

   create policy "Only admins can update/delete v2-media"
     on storage.objects for update delete
     using (bucket_id = 'v2-media' and auth.role() = 'authenticated');
*/

-- Insert sample data for testing

-- Categories
INSERT INTO v2_categories (name, description, section)
VALUES 
  ('Installation', 'Installation guides and procedures', 'install'),
  ('Service', 'Service and maintenance procedures', 'service');

-- Study Guides (Sample)
INSERT INTO v2_study_guides (category_id, title, content, display_order)
VALUES 
  (
    (SELECT id FROM v2_categories WHERE name = 'Installation'), 
    'Getting Started with Installation', 
    '<h2>Installation Basics</h2><p>This is a sample study guide for installation procedures.</p>', 
    1
  ),
  (
    (SELECT id FROM v2_categories WHERE name = 'Service'), 
    'Service Fundamentals', 
    '<h2>Service Basics</h2><p>This is a sample study guide for service procedures.</p>', 
    1
  );

-- Questions (Sample)
INSERT INTO v2_questions (category_id, question_text, question_type, options, correct_answer, explanation)
VALUES 
  (
    (SELECT id FROM v2_categories WHERE name = 'Installation'),
    'What is the first step in the installation process?',
    'multiple_choice',
    '["Check the manual", "Contact support", "Prepare the tools", "Turn off power"]',
    '3',
    'Always turn off power before beginning any installation for safety reasons.'
  ),
  (
    (SELECT id FROM v2_categories WHERE name = 'Installation'),
    'Which of the following tools are needed for installation?',
    'check_all_that_apply',
    '["Screwdriver", "Hammer", "Measuring tape", "Chainsaw"]',
    '[0, 2]',
    'Screwdriver and measuring tape are essential for most installations. A hammer may be needed in some cases, but a chainsaw is not typically required.'
  ),
  (
    (SELECT id FROM v2_categories WHERE name = 'Service'),
    'Regular maintenance should be performed every 6 months.',
    'true_false',
    null,
    'true',
    'Regular maintenance every 6 months helps ensure optimal performance and extends the life of the equipment.'
  );
