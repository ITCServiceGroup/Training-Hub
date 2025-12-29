# Training Hub RBAC System - README

Welcome to the Role-Based Access Control (RBAC) implementation for the Training Hub application.

---

## 📚 Documentation Index

This RBAC implementation includes comprehensive documentation across multiple files:

### 🎯 Planning & Overview
- **[RBAC_IMPLEMENTATION_PLAN.md](./RBAC_IMPLEMENTATION_PLAN.md)** - Original comprehensive plan with architecture diagrams, role definitions, and database schema
- **[RBAC_IMPLEMENTATION_SUMMARY.md](./RBAC_IMPLEMENTATION_SUMMARY.md)** - Current implementation status, completed features, and next steps

### 🚀 Implementation Guides
- **[RBAC_MIGRATION_GUIDE.md](./RBAC_MIGRATION_GUIDE.md)** - Step-by-step database migration execution guide
- **[RBAC_DEVELOPER_GUIDE.md](./RBAC_DEVELOPER_GUIDE.md)** - Quick reference for developers using the RBAC system

---

## 🎉 What's Been Implemented

### ✅ Database Layer (Complete)
- **6 role hierarchy**: Super Admin → Admin → AOM → Supervisor → Lead Tech → Technician
- **User profiles table** with role, market, and reporting structure
- **Content ownership** fields on all content tables
- **Approval workflow** table for regional→nationwide promotion
- **RLS policies** enforcing permissions at database level
- **Helper functions** for permission checks

### ✅ Frontend Layer (Complete)
- **RBACContext** providing role information throughout app
- **useContentVisibility hook** for content permission checks
- **Enhanced ProtectedRoute** with role-based access control
- **Error pages** for unauthorized access and inactive accounts
- **Integration** with existing AuthContext

### ⏳ Not Yet Implemented
- User management UI
- Content visibility indicators in existing pages
- Approval workflow UI
- Integration with existing content CRUD operations

---

## 🚀 Quick Start

### For Administrators

**To enable RBAC in your Training Hub instance:**

1. **Execute Database Migrations**
   - Follow [RBAC_MIGRATION_GUIDE.md](./RBAC_MIGRATION_GUIDE.md)
   - Run migrations 20, 21, and 22 in Supabase SQL Editor
   - Verify Super Admin profile created

2. **Deploy Frontend Changes**
   - The frontend code is already integrated
   - No additional deployment steps needed
   - RBAC will activate automatically after migrations

3. **Test the System**
   - Log in as Super Admin
   - Verify profile loads in browser console
   - Check that content is still accessible

4. **Create User Accounts**
   - Create additional users in Supabase Authentication
   - Manually create profiles in `user_profiles` table
   - OR wait for User Management UI (Phase 3)

### For Developers

**To use RBAC in your components:**

1. **Import the hooks**
   ```javascript
   import { useRBAC, ROLES } from '../contexts/RBACContext';
   import { useContentVisibility } from '../hooks/useContentVisibility';
   ```

2. **Check permissions**
   ```javascript
   const { isAdmin, hasRole, profile } = useRBAC();
   const { canEditContent } = useContentVisibility();
   ```

3. **Protect features**
   ```javascript
   {isAdmin() && <AdminOnlyButton />}
   {canEditContent(content) && <EditButton />}
   ```

4. **Reference the Developer Guide**
   - See [RBAC_DEVELOPER_GUIDE.md](./RBAC_DEVELOPER_GUIDE.md) for code examples

---

## 🏗️ Architecture Overview

### Role Hierarchy
```
Super Admin (Nationwide)
    ↓
  Admin (Nationwide)
    ↓
  AOM (Regional - Single Market)
    ↓
Supervisor (Regional - Single Market)
    ↓
Lead Tech (Regional - Single Market)
    ↓
Technician (Regional - Read-Only)
```

### Content Visibility Model

**Nationwide Content:**
- Created by Super Admin or Admin
- Visible to ALL users across ALL markets
- Cannot be edited by regional users

**Regional Content:**
- Created by AOM, Supervisor, or Lead Tech
- Visible only within the same market
- Can be promoted to nationwide via approval workflow

### Data Flow
```
User Login → Auth → RBACContext → Load Profile → Check Permissions → Render UI
                                        ↓
                                  RLS Policies → Database → Filtered Data
```

---

## 📊 Database Schema

### Key Tables

#### `user_profiles`
Links Supabase auth.users to application roles and markets.

#### `content_approval_requests`
Tracks requests to promote regional content to nationwide visibility.

### RBAC Columns on Content Tables
All content tables (sections, categories, study_guides, quizzes, questions, media_library) have:
- `created_by` - User who created the content
- `market_id` - Market the content belongs to (NULL for nationwide)
- `is_nationwide` - TRUE if visible to all markets
- `approved_by` - Admin who approved for nationwide (if applicable)
- `approved_at` - Timestamp of approval

---

## 🔐 Permissions Matrix

| Action | Super Admin | Admin | AOM | Supervisor | Lead Tech | Technician |
|--------|------------|-------|-----|------------|-----------|------------|
| View nationwide content | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View regional content (own) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View regional content (other) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create nationwide content | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create regional content | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit any content | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit regional content (own market) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit own content only | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Approve nationwide requests | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage all users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage non-admin users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage regional users | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 🛠️ Development Workflow

### Adding a New Feature with RBAC

1. **Determine permission requirements**
   - Who should access this feature?
   - What content visibility rules apply?

2. **Implement permission checks**
   - Use `useRBAC()` for role checks
   - Use `useContentVisibility()` for content checks

3. **Add UI protection**
   - Conditionally render based on permissions
   - Show appropriate error messages

4. **Test with multiple roles**
   - Create test users for each role
   - Verify access patterns match design

5. **Update RLS policies if needed**
   - New tables need RLS policies
   - Follow existing patterns

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Super Admin can access everything
- [ ] Admin can access everything except Super Admin management
- [ ] AOM can only see/edit their market's content
- [ ] Supervisor can only see/edit their market's content
- [ ] Lead Tech can see market content, only edit own
- [ ] Inactive users cannot log in
- [ ] Unauthorized routes redirect to /unauthorized
- [ ] Content visibility filters correctly by role

### Creating Test Users

```sql
-- Example: Create a test AOM for Austin market
INSERT INTO user_profiles (user_id, role, market_id, display_name, email, is_active)
VALUES (
  'USER_ID_FROM_SUPABASE_AUTH',
  'aom',
  1, -- Austin market ID
  'Test AOM',
  'test.aom@example.com',
  TRUE
);
```

---

## 🚨 Troubleshooting

### Common Issues

**Issue: User has no profile after login**
- **Cause:** User exists in auth.users but not in user_profiles
- **Fix:** Create profile in user_profiles table

**Issue: Content not visible**
- **Cause:** RLS policies filtering content
- **Check:** is_nationwide flag and market_id match user's market
- **Fix:** Verify content ownership and visibility settings

**Issue: Permission denied errors**
- **Cause:** User role doesn't have required permissions
- **Check:** User's role in user_profiles table
- **Fix:** Assign correct role or adjust feature requirements

**Issue: RBACContext not loading**
- **Cause:** User not authenticated or Supabase connection issue
- **Check:** Browser console for errors
- **Fix:** Verify AuthContext and Supabase configuration

### Debugging Tools

```javascript
// In browser console
const { profile, loading, error } = useRBAC();
console.log({ profile, loading, error });

// Check permissions
console.log('Is Admin:', isAdmin());
console.log('Can Create:', canCreateContent());
console.log('Market ID:', profile?.market_id);
```

---

## 📈 Roadmap

### Phase 3: User Management (Next)
- User list page
- Create/edit user form
- Role assignment
- Market assignment
- User activation/deactivation

### Phase 4: Content Visibility Integration
- Update content lists to show visibility badges
- Filter content by user's permissions
- Add "Request Nationwide" buttons
- Update content forms with RBAC fields

### Phase 5: Approval Workflow
- Approval queue page
- Review and approve/reject requests
- Notification system for pending approvals
- Audit log of approvals

### Phase 6: Enhanced Features
- Bulk user operations
- Role templates
- Permission reports
- User activity logs

---

## 🤝 Contributing

When working on RBAC features:

1. **Read the documentation** - All guides before starting
2. **Follow patterns** - Use existing code as examples
3. **Test thoroughly** - With multiple roles
4. **Update docs** - If you add new features
5. **Review checklist** - Use developer guide checklist

---

## 📞 Support

**For implementation questions:**
- Review [RBAC_DEVELOPER_GUIDE.md](./RBAC_DEVELOPER_GUIDE.md)
- Check browser console for errors
- Verify database migrations completed

**For migration issues:**
- Follow [RBAC_MIGRATION_GUIDE.md](./RBAC_MIGRATION_GUIDE.md)
- Check Supabase logs
- Verify user IDs match

**For design questions:**
- Review [RBAC_IMPLEMENTATION_PLAN.md](./RBAC_IMPLEMENTATION_PLAN.md)
- Check permissions matrix above
- Understand role hierarchy

---

## 📄 License & Attribution

Part of the Training Hub application.
RBAC implementation completed: 2025-12-29

---

**End of README**
