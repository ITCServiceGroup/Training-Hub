# How to Fix Access Codes RLS Error

## Problem
Migration 28 dropped the old access_codes RLS policies but didn't create new ones, leaving the table with RLS enabled but no policies. This causes 403/406 errors when trying to generate access codes.

## Solution
Run migration 32 to create the proper RLS policies for the access_codes table.

## Steps to Execute

### 1. Open Supabase SQL Editor
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### 2. Copy and Paste Migration
Copy the entire contents of `database/migrations/32_fix_access_codes_rls.sql` and paste it into the SQL Editor.

### 3. Run the Migration
1. Click the "Run" button (or press Ctrl/Cmd + Enter)
2. Wait for the query to complete
3. You should see a success message: "Successfully created 4 RLS policies for access_codes table"

### 4. Verify the Fix
1. Go back to your application
2. Try generating an access code again
3. The error should be resolved

## What This Migration Does

The migration creates 4 RLS policies for the `access_codes` table:

1. **SELECT Policy**: Allows authenticated and anonymous users to read access codes
   - Needed for admins to view generated codes
   - Needed for quiz takers to validate their codes

2. **INSERT Policy**: Allows authenticated users to create access codes
   - Only admins/supervisors can generate codes

3. **UPDATE Policy**: Allows authenticated and anonymous users to update codes
   - Needed to mark codes as "used" when someone takes a quiz

4. **DELETE Policy**: Allows authenticated users to delete codes
   - Only admins can delete access codes

## Troubleshooting

If you still get errors after running the migration:

1. **Check if RLS is enabled**:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'access_codes';
   ```
   Should return `rowsecurity = true`

2. **Check if policies exist**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'access_codes';
   ```
   Should return 4 policies

3. **Check your user authentication**:
   - Make sure you're logged in
   - Check browser console for auth errors

## Alternative: Quick Fix via SQL

If you just want to quickly fix the issue without running the full migration, you can run this simplified version:

```sql
-- Enable RLS
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "access_codes_all_authenticated" ON access_codes
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow anonymous users to read and update (for quiz taking)
CREATE POLICY "access_codes_anon_read_update" ON access_codes
  FOR SELECT
  USING (auth.role() = 'anon');

CREATE POLICY "access_codes_anon_update" ON access_codes
  FOR UPDATE
  USING (auth.role() = 'anon');
```

This is less granular but will fix the immediate issue.

