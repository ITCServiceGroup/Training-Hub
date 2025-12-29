# RBAC Database Migration Execution Guide

**⚠️ CRITICAL: Follow these steps exactly in order**

This guide walks you through executing the RBAC database migrations in Supabase.

---

## 📋 Pre-Migration Checklist

Before running any migrations, verify:

- [ ] You have access to Supabase SQL Editor
- [ ] You have Super Admin access to the Supabase project
- [ ] You have backed up the current database (optional but recommended)
- [ ] You have confirmed the Super Admin user ID: `19782d02-d744-488e-849f-154696da81a7`
- [ ] You are on the correct Supabase project (Production or Staging)

---

## 🔍 Step 0: Verify Super Admin User ID

**CRITICAL:** The migration scripts use a hardcoded user ID for the Super Admin. Verify this is correct.

### In Supabase SQL Editor, run:

```sql
SELECT id, email, created_at
FROM auth.users
WHERE email = 'itcservicegroup99@gmail.com';
```

**Expected Result:**
```
id: 19782d02-d744-488e-849f-154696da81a7
email: itcservicegroup99@gmail.com
```

**If the ID doesn't match:**
1. Copy the actual user ID from the query result
2. Edit `22_migrate_content_ownership.sql`
3. Replace all instances of `19782d02-d744-488e-849f-154696da81a7` with the correct ID

---

## 🚀 Step 1: Execute Migration 20 (Schema Creation)

### File: `database/migrations/20_create_rbac_system.sql`

1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy the entire contents of `20_create_rbac_system.sql`
4. Paste into SQL Editor
5. Click "Run" (or press Cmd/Ctrl + Enter)

### Expected Output:
```
CREATE TYPE
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
... (many more CREATE statements)
CREATE FUNCTION
CREATE TRIGGER
```

### Verification:

```sql
-- Verify user_role enum created
SELECT enumlabel FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'user_role'
ORDER BY enumsortorder;
```

**Expected:** 6 rows (super_admin, admin, aom, supervisor, lead_tech, technician)

```sql
-- Verify user_profiles table created
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles';
```

**Expected:** 9 columns (user_id, role, market_id, reports_to_user_id, display_name, email, is_active, created_at, updated_at)

```sql
-- Verify RBAC columns added to content tables
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'sections'
AND column_name IN ('created_by', 'market_id', 'is_nationwide', 'approved_by', 'approved_at');
```

**Expected:** 5 columns

```sql
-- Verify content_approval_requests table created
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'content_approval_requests';
```

**Expected:** 1 row

### ⚠️ If Errors Occur:

**Error: "type user_role already exists"**
- The enum already exists. This is OK. Continue to next migration.

**Error: "column already exists"**
- Some columns already exist. This is OK due to `IF NOT EXISTS` clauses.

**Other Errors:**
- Review the error message carefully
- Check if the table/column/type exists already
- If unsure, STOP and ask for help

---

## 🔐 Step 2: Execute Migration 21 (RLS Policies)

### File: `database/migrations/21_create_rbac_policies.sql`

1. Open new SQL Editor tab
2. Copy the entire contents of `21_create_rbac_policies.sql`
3. Paste into SQL Editor
4. Click "Run"

### Expected Output:
```
CREATE FUNCTION
CREATE FUNCTION
... (many CREATE FUNCTION statements)
ALTER TABLE
DROP POLICY
CREATE POLICY
... (many policy statements)
```

### Verification:

```sql
-- Verify helper functions created
SELECT proname FROM pg_proc
WHERE proname IN (
  'get_user_profile',
  'get_user_role',
  'get_user_market_id',
  'is_admin',
  'is_super_admin',
  'can_view_content',
  'can_edit_content',
  'can_create_content',
  'can_manage_user'
);
```

**Expected:** 9 rows

```sql
-- Verify RLS enabled on user_profiles
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'user_profiles';
```

**Expected:** rowsecurity = true

```sql
-- Verify policies on user_profiles
SELECT policyname
FROM pg_policies
WHERE tablename = 'user_profiles';
```

**Expected:** 6 policies (view own, admins view all, managers view regional, create, update, delete)

```sql
-- Verify policies on content tables
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('sections', 'categories', 'study_guides', 'quizzes', 'questions', 'media_library')
GROUP BY tablename;
```

**Expected:** Each table should have 4 policies (select, insert, update, delete)

### ⚠️ If Errors Occur:

**Error: "function already exists"**
- Use `CREATE OR REPLACE FUNCTION` (already in script). Continue.

**Error: "policy already exists"**
- Policies are dropped first with `DROP POLICY IF EXISTS`. If error persists, manually drop the policy.

**Error: "relation does not exist"**
- Check that migration 20 completed successfully
- Verify table names match your database

---

## 📦 Step 3: Execute Migration 22 (Data Migration)

### File: `database/migrations/22_migrate_content_ownership.sql`

**⚠️ IMPORTANT:** This migration:
- Creates the Super Admin profile
- Sets ownership of ALL existing content to Super Admin
- Marks all content as nationwide
- This is IRREVERSIBLE without a backup

1. Open new SQL Editor tab
2. Copy the entire contents of `22_migrate_content_ownership.sql`
3. **DOUBLE-CHECK the user ID is correct** (Step 0)
4. Paste into SQL Editor
5. Click "Run"

### Expected Output:
```
INSERT 0 1 (or UPDATE 1 if profile already exists)
UPDATE 20 (or however many sections exist)
UPDATE 45 (or however many categories exist)
UPDATE 20 (or however many study guides exist)
UPDATE 22 (or however many quizzes exist)
UPDATE 305 (or however many questions exist)
UPDATE X (or however many media items exist)
UPDATE 4 (or however many supervisors exist)
```

### Verification:

```sql
-- Verify Super Admin profile created
SELECT user_id, role, display_name, email, is_active
FROM user_profiles
WHERE role = 'super_admin';
```

**Expected:** 1 row with Nathan Sullivan

```sql
-- Verify content ownership migrated
SELECT
  'sections' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN created_by = '19782d02-d744-488e-849f-154696da81a7' THEN 1 END) as owned_by_admin,
  COUNT(CASE WHEN is_nationwide = TRUE THEN 1 END) as nationwide
FROM sections
UNION ALL
SELECT 'categories', COUNT(*), COUNT(CASE WHEN created_by = '19782d02-d744-488e-849f-154696da81a7' THEN 1 END), COUNT(CASE WHEN is_nationwide = TRUE THEN 1 END)
FROM categories
UNION ALL
SELECT 'study_guides', COUNT(*), COUNT(CASE WHEN created_by = '19782d02-d744-488e-849f-154696da81a7' THEN 1 END), COUNT(CASE WHEN is_nationwide = TRUE THEN 1 END)
FROM study_guides
UNION ALL
SELECT 'quizzes', COUNT(*), COUNT(CASE WHEN created_by = '19782d02-d744-488e-849f-154696da81a7' THEN 1 END), COUNT(CASE WHEN is_nationwide = TRUE THEN 1 END)
FROM quizzes
UNION ALL
SELECT 'questions', COUNT(*), COUNT(CASE WHEN created_by = '19782d02-d744-488e-849f-154696da81a7' THEN 1 END), COUNT(CASE WHEN is_nationwide = TRUE THEN 1 END)
FROM questions
UNION ALL
SELECT 'media_library', COUNT(*), COUNT(CASE WHEN created_by = '19782d02-d744-488e-849f-154696da81a7' THEN 1 END), COUNT(CASE WHEN is_nationwide = TRUE THEN 1 END)
FROM media_library;
```

**Expected:** total = owned_by_admin = nationwide for each table

```sql
-- Verify legacy supervisors marked
SELECT COUNT(*) as legacy_count
FROM supervisors
WHERE is_legacy = TRUE;
```

**Expected:** Count matches existing supervisors (probably 4)

### ⚠️ If Errors Occur:

**Error: "duplicate key value violates unique constraint"**
- Super Admin profile already exists. This is OK - it will be updated.

**Error: "foreign key constraint violation"**
- The user ID doesn't exist in auth.users
- STOP and verify Step 0

**Error: "column does not exist"**
- Migration 20 didn't complete successfully
- Go back and verify migration 20

---

## ✅ Step 4: Post-Migration Testing

### Test 1: Login as Super Admin

1. Go to the Training Hub application
2. Log in with `itcservicegroup99@gmail.com`
3. Open browser console (F12)
4. Check for RBAC context loading

**Expected Console Output:**
```
RBAC Profile: {
  user_id: "19782d02-d744-488e-849f-154696da81a7",
  role: "super_admin",
  display_name: "Nathan Sullivan",
  ...
}
```

### Test 2: Verify Content Access

1. Navigate to Admin → Study Guides
2. All existing content should be visible
3. You should be able to edit any content

### Test 3: Verify RLS Policies

Run in Supabase SQL Editor:

```sql
-- Set the authenticated user context
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "19782d02-d744-488e-849f-154696da81a7"}';

-- Test user profile access
SELECT * FROM user_profiles WHERE user_id = '19782d02-d744-488e-849f-154696da81a7';
```

**Expected:** 1 row returned (Super Admin profile)

```sql
-- Test content access
SELECT COUNT(*) FROM study_guides;
```

**Expected:** All study guides visible

### Test 4: Create Test User

In Supabase:
1. Go to Authentication → Users
2. Click "Add User"
3. Create a test user with any email
4. Copy the new user's ID
5. Run in SQL Editor:

```sql
-- Create a test AOM user for Austin market
INSERT INTO user_profiles (user_id, role, market_id, display_name, email, is_active)
VALUES (
  'PASTE_NEW_USER_ID_HERE',
  'aom',
  1, -- Assuming Austin is market ID 1
  'Test AOM User',
  'test@example.com',
  TRUE
);
```

6. Log in as the test user
7. Verify you can only see nationwide content

---

## 🔄 Rollback Plan (If Needed)

If something goes wrong and you need to rollback:

### Option 1: Restore from Backup
If you created a backup before migration, restore it.

### Option 2: Manual Rollback

**Rollback Migration 22:**
```sql
-- Remove Super Admin profile
DELETE FROM user_profiles WHERE role = 'super_admin';

-- Clear content ownership (optional - doesn't break anything)
UPDATE sections SET created_by = NULL, market_id = NULL, is_nationwide = FALSE;
UPDATE categories SET created_by = NULL, market_id = NULL, is_nationwide = FALSE;
UPDATE study_guides SET created_by = NULL, market_id = NULL, is_nationwide = FALSE;
UPDATE quizzes SET created_by = NULL, market_id = NULL, is_nationwide = FALSE;
UPDATE questions SET created_by = NULL, market_id = NULL, is_nationwide = FALSE;
UPDATE media_library SET created_by = NULL, market_id = NULL, is_nationwide = FALSE;

-- Unmark legacy supervisors
UPDATE supervisors SET is_legacy = FALSE;
```

**Rollback Migration 21:**
```sql
-- Disable RLS on all tables
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_guides DISABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE media_library DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_approval_requests DISABLE ROW LEVEL SECURITY;

-- Drop all policies (optional)
-- (List is long - see migration file for all policy names)

-- Drop helper functions
DROP FUNCTION IF EXISTS get_user_profile();
DROP FUNCTION IF EXISTS get_user_role();
DROP FUNCTION IF EXISTS get_user_market_id();
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_super_admin();
DROP FUNCTION IF EXISTS can_view_content(INTEGER, BOOLEAN);
DROP FUNCTION IF EXISTS can_edit_content(UUID, INTEGER);
DROP FUNCTION IF EXISTS can_create_content();
DROP FUNCTION IF EXISTS can_manage_user(UUID);
```

**Rollback Migration 20:**
```sql
-- Drop tables
DROP TABLE IF EXISTS content_approval_requests;
DROP TABLE IF EXISTS user_profiles;

-- Remove RBAC columns from content tables
ALTER TABLE sections DROP COLUMN IF EXISTS created_by, DROP COLUMN IF EXISTS market_id, DROP COLUMN IF EXISTS is_nationwide, DROP COLUMN IF EXISTS approved_by, DROP COLUMN IF EXISTS approved_at;
ALTER TABLE categories DROP COLUMN IF EXISTS created_by, DROP COLUMN IF EXISTS market_id, DROP COLUMN IF EXISTS is_nationwide, DROP COLUMN IF EXISTS approved_by, DROP COLUMN IF EXISTS approved_at;
ALTER TABLE study_guides DROP COLUMN IF EXISTS created_by, DROP COLUMN IF EXISTS market_id, DROP COLUMN IF EXISTS is_nationwide, DROP COLUMN IF EXISTS approved_by, DROP COLUMN IF EXISTS approved_at;
ALTER TABLE quizzes DROP COLUMN IF EXISTS created_by, DROP COLUMN IF EXISTS market_id, DROP COLUMN IF EXISTS is_nationwide, DROP COLUMN IF EXISTS approved_by, DROP COLUMN IF EXISTS approved_at;
ALTER TABLE questions DROP COLUMN IF EXISTS created_by, DROP COLUMN IF EXISTS market_id, DROP COLUMN IF EXISTS is_nationwide, DROP COLUMN IF EXISTS approved_by, DROP COLUMN IF EXISTS approved_at;
ALTER TABLE media_library DROP COLUMN IF EXISTS created_by, DROP COLUMN IF EXISTS market_id, DROP COLUMN IF EXISTS is_nationwide, DROP COLUMN IF EXISTS approved_by, DROP COLUMN IF EXISTS approved_at;

-- Remove columns from supervisors
ALTER TABLE supervisors DROP COLUMN IF EXISTS user_id, DROP COLUMN IF EXISTS is_legacy;

-- Drop enum type
DROP TYPE IF EXISTS user_role;
```

**⚠️ Warning:** Rollback will remove all RBAC functionality. Frontend will need to be reverted as well.

---

## 📞 Support

If you encounter issues during migration:

1. **Check the error message** - Most errors are self-explanatory
2. **Verify previous steps** - Ensure all prior migrations completed
3. **Check Supabase logs** - Look for detailed error information
4. **Review verification queries** - Confirm expected data exists
5. **Consult the plan** - Review RBAC_IMPLEMENTATION_PLAN.md for context

---

## ✅ Migration Complete Checklist

After all migrations are complete:

- [ ] All 3 migration files executed without errors
- [ ] Super Admin profile exists in user_profiles table
- [ ] All helper functions created
- [ ] RLS policies active on all tables
- [ ] Existing content has ownership and is nationwide
- [ ] Super Admin can log in successfully
- [ ] RBACContext loads profile correctly
- [ ] All existing content is visible
- [ ] No console errors related to RBAC

**If all items are checked, migration is complete! 🎉**

---

**End of Migration Guide**
