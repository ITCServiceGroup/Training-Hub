# Quiz Database Schema

This document details the database schema for the quiz component of the Training Hub application. It includes existing tables, required modifications, and new tables that need to be created.

## Table of Contents

1. [Existing Tables](#existing-tables)
2. [Required Modifications](#required-modifications)
3. [New Tables](#new-tables)
4. [Relationships](#relationships)
5. [Row Level Security Policies](#row-level-security-policies)
6. [Data Examples](#data-examples)

## Existing Tables

The following tables already exist in the database and will be utilized by the quiz component:

### Questions

```sql
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
```

### Quizzes

```sql
create table v2_quizzes (
  id uuid default uuid_generate_v4() primary key,
  title varchar not null,
  description text,
  category_ids jsonb not null, -- Array of category IDs
  time_limit integer, -- In seconds, null for no limit
  passing_score decimal, -- Percentage required to pass
  is_practice boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Quiz Results

```sql
create table v2_quiz_results (
  id bigint primary key,
  ldap text,
  supervisor text,
  market text,
  quiz_type text,
  score_value double precision,
  score_text text,
  pdf_url text,
  time_taken real,
  date_of_test timestamp with time zone
);
```

### Access Codes

```sql
create table v2_access_codes (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references v2_quizzes(id) on delete cascade,
  code varchar(8) not null unique, -- 8-digit alphanumeric code
  ldap varchar not null,
  email varchar not null,
  supervisor varchar not null,
  market varchar not null,
  is_used boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  expires_at timestamp with time zone
);

-- Create index for faster code lookups
create index v2_access_codes_code_idx on v2_access_codes(code);
```

## Row Level Security Policies

The following Row Level Security (RLS) policies will be applied to the tables:

### Questions

```sql
-- Questions: public read, admin write
alter table v2_questions enable row level security;

create policy "Questions read access" 
  on v2_questions for select 
  using (true);

create policy "Questions insert access" 
  on v2_questions for insert 
  with check (auth.role() = 'authenticated');

create policy "Questions update access" 
  on v2_questions for update 
  using (auth.role() = 'authenticated');

create policy "Questions delete access" 
  on v2_questions for delete 
  using (auth.role() = 'authenticated');
```

### Quizzes

```sql
-- Quizzes: public read, admin write
alter table v2_quizzes enable row level security;

create policy "Quizzes read access" 
  on v2_quizzes for select 
  using (true);

create policy "Quizzes insert access" 
  on v2_quizzes for insert 
  with check (auth.role() = 'authenticated');

create policy "Quizzes update access" 
  on v2_quizzes for update 
  using (auth.role() = 'authenticated');

create policy "Quizzes delete access" 
  on v2_quizzes for delete 
  using (auth.role() = 'authenticated');
```

### Quiz Results

```sql
-- Quiz Results: public insert, admin read
alter table v2_quiz_results enable row level security;

create policy "Quiz results insert access" 
  on v2_quiz_results for insert 
  using (true);

create policy "Quiz results read access" 
  on v2_quiz_results for select 
  using (auth.role() = 'authenticated');
```

### Access Codes

```sql
-- Access Codes: public read for validation, admin write
alter table v2_access_codes enable row level security;

create policy "Access codes read access" 
  on v2_access_codes for select 
  using (true);

create policy "Access codes insert access" 
  on v2_access_codes for insert 
  with check (auth.role() = 'authenticated');

create policy "Access codes update access" 
  on v2_access_codes for update 
  using (auth.role() = 'authenticated');

create policy "Access codes delete access" 
  on v2_access_codes for delete 
  using (auth.role() = 'authenticated');
```

## Data Examples

### Question Types

#### Multiple Choice Question

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "category_id": "550e8400-e29b-41d4-a716-446655440001",
  "question_text": "What is the correct method to install X?",
  "question_type": "multiple_choice",
  "options": [
    "Method A",
    "Method B",
    "Method C",
    "Method D"
  ],
  "correct_answer": 2,
  "explanation": "Method C is correct because it follows the standard installation procedure.",
  "created_at": "2025-03-15T12:00:00Z",
  "updated_at": "2025-03-15T12:00:00Z"
}
```

### Quiz Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "title": "Installation Basics",
  "description": "Test your knowledge of basic installation procedures.",
  "category_ids": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440005"
  ],
  "time_limit": 1800,
  "passing_score": 70.0,
  "is_practice": false,
  "created_at": "2025-03-15T13:00:00Z",
  "updated_at": "2025-03-15T13:00:00Z"
}
```

### Quiz Result Example

```json
{
  "id": 12345,
  "ldap": "jsmith",
  "supervisor": "Jane Doe",
  "market": "North",
  "quiz_type": "Installation Basics",
  "score_value": 85.0,
  "score_text": "Pass",
  "pdf_url": "https://example.com/results/12345.pdf",
  "time_taken": 1200.5,
  "date_of_test": "2025-03-15T15:00:00Z"
}
```

### Access Code Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "quiz_id": "550e8400-e29b-41d4-a716-446655440004",
  "code": "AB12CD34",
  "ldap": "jsmith",
  "email": "jsmith@example.com",
  "supervisor": "Jane Doe",
  "market": "North",
  "is_used": false,
  "created_at": "2025-03-15T14:00:00Z",
  "expires_at": "2025-03-22T14:00:00Z"
}
