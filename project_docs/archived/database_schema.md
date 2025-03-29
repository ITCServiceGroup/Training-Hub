# Database Schema

## Tables Structure

### Categories
```sql
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name varchar not null,
  description text,
  main_section varchar not null check (main_section in ('install', 'service')),
  is_shared boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Trigger to update updated_at timestamp
create trigger categories_updated_at_trigger
  before update on categories
  for each row
  execute function update_updated_at_column();
```

### Questions
```sql
create table questions (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references categories(id) on delete cascade,
  question_text text not null,
  question_type varchar not null check (question_type in ('multiple_choice', 'check_all_that_apply', 'true_false')),
  options jsonb, -- Array for multiple choice/check all, null for true/false
  correct_answer jsonb not null, -- Single index for MC, array for Check All, boolean for T/F
  explanation text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create index questions_category_id_idx on questions(category_id);

create trigger questions_updated_at_trigger
  before update on questions
  for each row
  execute function update_updated_at_column();
```

### Study Guides
```sql
create table study_guides (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references categories(id) on delete cascade,
  title varchar not null,
  content text not null, -- Rich text content
  interactive_elements jsonb, -- Optional JavaScript/CSS
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create index study_guides_category_id_idx on study_guides(category_id);
create index study_guides_display_order_idx on study_guides(display_order);

create trigger study_guides_updated_at_trigger
  before update on study_guides
  for each row
  execute function update_updated_at_column();
```

### Quizzes
```sql
create table quizzes (
  id uuid default uuid_generate_v4() primary key,
  name varchar not null,
  description text,
  categories jsonb not null, -- Array of category IDs
  time_limit integer, -- In seconds, null for no limit
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create trigger quizzes_updated_at_trigger
  before update on quizzes
  for each row
  execute function update_updated_at_column();
```

### Access Codes
```sql
create table access_codes (
  id uuid default uuid_generate_v4() primary key,
  code varchar not null unique,
  quiz_id uuid references quizzes(id) on delete cascade,
  expires_at timestamp with time zone not null,
  used boolean default false,
  used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index access_codes_code_idx on access_codes(code);
create index access_codes_quiz_id_idx on access_codes(quiz_id);
```

### Quiz Results
```sql
create table quiz_results (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references quizzes(id) on delete cascade,
  ldap varchar not null,
  supervisor varchar not null,
  market varchar not null,
  score_value decimal not null,
  score_text varchar not null,
  time_taken integer not null, -- In seconds
  answers jsonb not null, -- Array of answer objects
  pdf_url varchar,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index quiz_results_quiz_id_idx on quiz_results(quiz_id);
create index quiz_results_ldap_idx on quiz_results(ldap);
create index quiz_results_created_at_idx on quiz_results(created_at);
```

## Row Level Security (RLS) Policies

### Categories Table
```sql
alter table categories enable row level security;

create policy "Categories are viewable by everyone"
  on categories for select
  using (true);

create policy "Categories are editable by authenticated admins only"
  on categories for insert update delete
  using (auth.role() = 'authenticated');
```

### Questions Table
```sql
alter table questions enable row level security;

create policy "Questions are viewable by everyone"
  on questions for select
  using (true);

create policy "Questions are editable by authenticated admins only"
  on questions for insert update delete
  using (auth.role() = 'authenticated');
```

### Study Guides Table
```sql
alter table study_guides enable row level security;

create policy "Study guides are viewable by everyone"
  on study_guides for select
  using (true);

create policy "Study guides are editable by authenticated admins only"
  on study_guides for insert update delete
  using (auth.role() = 'authenticated');
```

### Quizzes Table
```sql
alter table quizzes enable row level security;

create policy "Quizzes are viewable by everyone"
  on quizzes for select
  using (true);

create policy "Quizzes are editable by authenticated admins only"
  on quizzes for insert update delete
  using (auth.role() = 'authenticated');
```

### Access Codes Table
```sql
alter table access_codes enable row level security;

create policy "Access codes are viewable by everyone"
  on access_codes for select
  using (true);

create policy "Access codes are editable by authenticated admins only"
  on access_codes for insert update delete
  using (auth.role() = 'authenticated');
```

### Quiz Results Table
```sql
alter table quiz_results enable row level security;

create policy "Quiz results are viewable by authenticated admins only"
  on quiz_results for select
  using (auth.role() = 'authenticated');

create policy "Quiz results can be inserted by anyone"
  on quiz_results for insert
  using (true);
```

## Storage Bucket Policies

### PDF Results Bucket
```sql
create policy "PDF results are accessible by authenticated admins only"
  on storage.objects for select
  using (auth.role() = 'authenticated' and bucket_id = 'quiz-pdfs');

create policy "PDF results can be uploaded by anyone"
  on storage.objects for insert
  using (bucket_id = 'quiz-pdfs')
  with check (bucket_id = 'quiz-pdfs');
```

## Helper Functions

### Updated At Trigger Function
```sql
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;
```

## Example Question Data Structure

### Multiple Choice Question
```json
{
  "question_text": "What is the correct method to install X?",
  "question_type": "multiple_choice",
  "options": [
    "Method A",
    "Method B",
    "Method C",
    "Method D"
  ],
  "correct_answer": 2,
  "explanation": "Method C is correct because..."
}
```

### Check All That Apply Question
```json
{
  "question_text": "Which of the following are valid installation steps?",
  "question_type": "check_all_that_apply",
  "options": [
    "Step 1",
    "Step 2",
    "Step 3",
    "Step 4"
  ],
  "correct_answer": [0, 2],
  "explanation": "Steps 1 and 3 are correct because..."
}
```

### True/False Question
```json
{
  "question_text": "Statement X is correct.",
  "question_type": "true_false",
  "options": ["True", "False"],
  "correct_answer": true,
  "explanation": "This statement is true because..."
}
