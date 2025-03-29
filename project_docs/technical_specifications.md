# Technical Specifications

## Database Schema

### Authentication
Using Supabase built-in authentication system with a single admin user.

### Content Tables

#### Categories
```sql
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name varchar not null,
  description text,
  section varchar not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger categories_updated_at_trigger
  before update on categories
  for each row
  execute function update_updated_at_column();
```

#### Study Guides
```sql
create table study_guides (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references categories(id) on delete cascade,
  title varchar not null,
  content text not null, -- Rich text content
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

#### Questions
```sql
create table questions (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references categories(id) on delete cascade,
  question_text text not null,
  question_type varchar not null check (question_type in ('multiple_choice', 'check_all_that_apply', 'true_false')),
  options jsonb, -- Array for multiple choice/check all options
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

#### Quizzes
```sql
create table quizzes (
  id uuid default uuid_generate_v4() primary key,
  title varchar not null,
  description text,
  category_ids jsonb not null, -- Array of category IDs
  time_limit integer, -- In seconds, null for no limit
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create trigger quizzes_updated_at_trigger
  before update on quizzes
  for each row
  execute function update_updated_at_column();
```

#### Quiz Results
```sql
create table quiz_results (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references quizzes(id) on delete cascade,
  user_identifier varchar not null, -- External ID (LDAP, email, etc.)
  supervisor varchar,
  market varchar,
  score_value decimal not null,
  score_text varchar not null,
  answers jsonb not null, -- Record of answers given
  time_taken integer, -- In seconds
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index quiz_results_quiz_id_idx on quiz_results(quiz_id);
create index quiz_results_created_at_idx on quiz_results(created_at);
```

## Row Level Security Policies

```sql
-- Categories: public read, admin write
alter table categories enable row level security;

create policy "Public can read categories" 
  on categories for select 
  using (true);

create policy "Only admins can modify categories" 
  on categories for insert update delete 
  using (auth.role() = 'authenticated');

-- Study Guides: public read, admin write
alter table study_guides enable row level security;

create policy "Public can read study guides" 
  on study_guides for select 
  using (true);

create policy "Only admins can modify study guides" 
  on study_guides for insert update delete 
  using (auth.role() = 'authenticated');

-- Questions: public read, admin write
alter table questions enable row level security;

create policy "Public can read questions" 
  on questions for select 
  using (true);

create policy "Only admins can modify questions" 
  on questions for insert update delete 
  using (auth.role() = 'authenticated');

-- Quizzes: public read, admin write
alter table quizzes enable row level security;

create policy "Public can read quizzes" 
  on quizzes for select 
  using (true);

create policy "Only admins can modify quizzes" 
  on quizzes for insert update delete 
  using (auth.role() = 'authenticated');

-- Quiz Results: public insert, admin read
alter table quiz_results enable row level security;

create policy "Public can submit quiz results" 
  on quiz_results for insert 
  using (true);

create policy "Only admins can read quiz results" 
  on quiz_results for select 
  using (auth.role() = 'authenticated');
```

## Supabase Configuration

### Authentication Settings
- **Email Auth**: Enabled for admin login
- **Signup**: Disabled (admin account created manually)
- **Auth Redirects**: 
  - After login: `/admin`
  - After logout: `/`

### Storage Buckets
- **media**: For storing images and other media files used in study guides
  ```sql
  create policy "Public can read media"
    on storage.objects for select
    using (bucket_id = 'media');
    
  create policy "Only admins can upload media"
    on storage.objects for insert
    using (bucket_id = 'media' and auth.role() = 'authenticated')
    with check (bucket_id = 'media');

  create policy "Only admins can update/delete media"
    on storage.objects for update delete
    using (bucket_id = 'media' and auth.role() = 'authenticated');
  ```

## Example Data Structures

### Question Types

#### Multiple Choice Question
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

#### Check All That Apply Question
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

#### True/False Question
```json
{
  "question_text": "Statement X is correct.",
  "question_type": "true_false",
  "options": null,
  "correct_answer": true,
  "explanation": "This statement is true because..."
}
```
