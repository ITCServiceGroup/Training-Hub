# Database Migrations

This directory contains the database migration files for the Training Hub v2 application. All migrations are organized in a single location with proper dependency ordering.

## Migration Files

The migrations are numbered sequentially and should be executed in order:

### Core Tables (01-08)
- `01_create_core_tables.sql` - Sections, categories, study guides, and templates
- `02_create_quiz_system.sql` - Quizzes, questions, and quiz-question relationships  
- `03_create_quiz_results.sql` - Active quiz results table (not v2_quiz_results)
- `04_create_access_codes.sql` - Access code system for quiz control
- `05_create_media_library.sql` - Media file management system
- `06_create_markets_supervisors.sql` - Market and supervisor organization
- `07_create_user_dashboards.sql` - User dashboard system
- `08_create_user_initialization.sql` - User onboarding tracking

### Database Features (09-11)
- `09_create_functions.sql` - All custom database functions
- `10_create_triggers.sql` - All database triggers  
- `11_create_policies.sql` - Row Level Security policies

### Performance & Constraints (12-15)
- `12_create_indexes.sql` - Performance indexes
- `13_create_foreign_keys.sql` - Foreign key constraints
- `14_create_sequences.sql` - Identity sequences
- `15_create_storage_buckets.sql` - Supabase storage configuration

## Important Notes

### Active vs Deprecated Tables
- **quiz_results** is the ACTIVE quiz results table
- **v2_quiz_results** is DEPRECATED and will be removed soon

### Foreign Key Strategy
Tables follow a cascade deletion strategy where appropriate:
- Deleting a section cascades to categories and their content
- Deleting a category cascades to questions and study guides
- Deleting a quiz cascades to access codes and quiz-question relationships

### RLS Policies
- Public users can read most content tables
- Authenticated users can modify content
- Users can only access their own dashboards and initialization data
- Media library requires authentication for all operations

## Running Migrations

Execute migrations in numerical order. Each migration is idempotent and safe to run multiple times.

```sql
-- Run in order
\i 01_create_core_tables.sql
\i 02_create_quiz_system.sql
\i 03_create_quiz_results.sql
-- ... continue through 15_create_storage_buckets.sql
```

## Schema Overview

The database is organized into several logical domains:

- **Content**: Sections → Categories → Study Guides
- **Assessment**: Quizzes → Questions (many-to-many via quiz_questions)
- **Results**: quiz_results (active table for storing completed attempts)
- **Access Control**: Access codes tied to specific quizzes
- **Media**: File storage metadata with Supabase integration
- **Organization**: Markets and supervisors for reporting structure
- **User Data**: Dashboards and initialization tracking per user