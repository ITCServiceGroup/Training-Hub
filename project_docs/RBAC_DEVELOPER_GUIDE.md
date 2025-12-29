# RBAC Developer Quick Reference Guide

This guide provides quick code snippets and patterns for working with the RBAC system.

---

## 🎯 Quick Start

### Import RBAC Context
```javascript
import { useRBAC, ROLES } from '../contexts/RBACContext';
```

### Import Content Visibility Hook
```javascript
import { useContentVisibility } from '../hooks/useContentVisibility';
```

---

## 🔐 Common Patterns

### 1. Check if User is Admin
```javascript
const MyComponent = () => {
  const { isAdmin } = useRBAC();

  if (isAdmin()) {
    return <AdminPanel />;
  }

  return <RegularUserView />;
};
```

### 2. Check Specific Role
```javascript
const { hasRole } = useRBAC();

// Single role
if (hasRole(ROLES.SUPER_ADMIN)) {
  // Super admin only
}

// Multiple roles
if (hasRole([ROLES.SUPER_ADMIN, ROLES.ADMIN])) {
  // Any admin
}
```

### 3. Conditionally Render Based on Role
```javascript
const Navigation = () => {
  const { hasRole, canManageUsers } = useRBAC();

  return (
    <nav>
      <Link to="/admin">Dashboard</Link>
      {canManageUsers() && <Link to="/admin/users">Users</Link>}
      {hasRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]) && (
        <Link to="/admin/approvals">Approvals</Link>
      )}
    </nav>
  );
};
```

### 4. Show User Info
```javascript
const UserProfile = () => {
  const { profile, getRoleDisplayName, marketName } = useRBAC();

  return (
    <div>
      <p>Name: {profile.display_name}</p>
      <p>Role: {getRoleDisplayName(profile.role)}</p>
      {marketName && <p>Market: {marketName}</p>}
    </div>
  );
};
```

### 5. Check Content Permissions
```javascript
const ContentCard = ({ content }) => {
  const { canEditContent, canDeleteContent } = useContentVisibility();

  return (
    <div className="content-card">
      <h3>{content.title}</h3>

      <div className="actions">
        {canEditContent(content) && (
          <button onClick={() => handleEdit(content)}>Edit</button>
        )}
        {canDeleteContent(content) && (
          <button onClick={() => handleDelete(content)}>Delete</button>
        )}
      </div>
    </div>
  );
};
```

### 6. Display Visibility Badge
```javascript
const ContentItem = ({ content }) => {
  const { getVisibilityBadge } = useContentVisibility();
  const badge = getVisibilityBadge(content);

  return (
    <div>
      <span className={`badge bg-${badge.color}-100 text-${badge.color}-800`}>
        {badge.icon} {badge.label}
      </span>
      <h3>{content.title}</h3>
    </div>
  );
};
```

### 7. Filter Content List
```javascript
const ContentList = ({ allContent }) => {
  const { filterVisibleContent } = useContentVisibility();

  const visibleContent = filterVisibleContent(allContent);

  return (
    <div>
      {visibleContent.map(item => (
        <ContentCard key={item.id} content={item} />
      ))}
    </div>
  );
};
```

### 8. Create New Content with Correct Ownership
```javascript
const CreateContentForm = () => {
  const { getNewContentDefaults } = useContentVisibility();

  const handleSubmit = async (formData) => {
    const defaults = getNewContentDefaults();

    const newContent = {
      title: formData.title,
      description: formData.description,
      // Add RBAC fields
      created_by: defaults.created_by,
      market_id: defaults.market_id,
      is_nationwide: defaults.is_nationwide
    };

    const { data, error } = await supabase
      .from('study_guides')
      .insert(newContent);

    if (!error) {
      console.log('Content created:', data);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

### 9. Request Nationwide Approval
```javascript
const ContentActions = ({ content }) => {
  const { canRequestNationwideApproval } = useContentVisibility();

  const handleRequestApproval = async () => {
    const { error } = await supabase
      .from('content_approval_requests')
      .insert({
        content_type: 'study_guide',
        content_id: content.id,
        requested_by: content.created_by,
        status: 'pending'
      });

    if (!error) {
      alert('Approval requested!');
    }
  };

  return (
    <>
      {canRequestNationwideApproval(content) && (
        <button onClick={handleRequestApproval}>
          Request Nationwide Approval
        </button>
      )}
    </>
  );
};
```

### 10. Protected Route by Role
```javascript
// In route definitions
import { ROLES } from '../contexts/RBACContext';

<Route
  path="admin/users"
  element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]} />}
>
  <Route index element={<UserManagement />} />
</Route>
```

### 11. Fetch User's Visible Content
```javascript
const MyContentPage = () => {
  const { profile, isAdmin } = useRBAC();
  const [content, setContent] = useState([]);

  useEffect(() => {
    const fetchContent = async () => {
      let query = supabase.from('study_guides').select('*');

      // RLS will filter automatically, but we can optimize the query
      if (!isAdmin() && profile?.market_id) {
        // Fetch nationwide + user's market
        query = query.or(`is_nationwide.eq.true,market_id.eq.${profile.market_id}`);
      }

      const { data } = await query;
      setContent(data || []);
    };

    fetchContent();
  }, [profile]);

  return <ContentList content={content} />;
};
```

### 12. Update Content with Ownership Preservation
```javascript
const EditContentForm = ({ content }) => {
  const { canEditContent } = useContentVisibility();

  if (!canEditContent(content)) {
    return <p>You don't have permission to edit this content.</p>;
  }

  const handleUpdate = async (updates) => {
    // Never change ownership fields during update
    const safeUpdates = {
      title: updates.title,
      description: updates.description,
      // DO NOT update: created_by, market_id, is_nationwide, approved_by
    };

    const { error } = await supabase
      .from('study_guides')
      .update(safeUpdates)
      .eq('id', content.id);

    if (!error) {
      console.log('Content updated');
    }
  };

  return <form>...</form>;
};
```

### 13. Check if User Can Manage Another User
```javascript
const UserListItem = ({ targetUser }) => {
  const { canManageSpecificUser } = useRBAC();

  const canManage = canManageSpecificUser(targetUser);

  return (
    <div className="user-item">
      <p>{targetUser.display_name}</p>
      {canManage && (
        <div className="actions">
          <button>Edit</button>
          <button>Deactivate</button>
        </div>
      )}
    </div>
  );
};
```

### 14. Display Content Creator Info
```javascript
const ContentDetails = ({ content }) => {
  const { isOwnContent } = useContentVisibility();

  return (
    <div>
      <p>Created by: {content.creator?.display_name || 'Unknown'}</p>
      {isOwnContent(content) && (
        <span className="badge">Your Content</span>
      )}
    </div>
  );
};
```

### 15. Loading State with RBAC
```javascript
const MyPage = () => {
  const { profile, loading } = useRBAC();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return <p>No profile found. Please contact admin.</p>;
  }

  return <div>Welcome, {profile.display_name}!</div>;
};
```

---

## 📊 RBAC Context API

### Available Properties
```javascript
const {
  profile,              // Full user profile object
  loading,              // Boolean: is profile loading?
  error,                // Error message if profile fetch failed
  hasRole,              // Function: hasRole(role | role[])
  isAdmin,              // Function: returns true if Super Admin or Admin
  isSuperAdmin,         // Function: returns true if Super Admin
  canCreateContent,     // Function: can user create content?
  canManageUsers,       // Function: can user manage other users?
  canApproveContent,    // Function: can user approve content for nationwide?
  canManageSpecificUser, // Function: canManageSpecificUser(targetProfile)
  getRoleDisplayName,   // Function: getRoleDisplayName(role)
  marketId,             // User's market ID (or null for admins)
  marketName,           // User's market name (or null for admins)
  role,                 // User's role enum value
  displayName,          // User's display name
  isActive,             // Boolean: is account active?
  reloadProfile         // Function: refresh profile from database
} = useRBAC();
```

### Role Constants
```javascript
ROLES.SUPER_ADMIN   // 'super_admin'
ROLES.ADMIN         // 'admin'
ROLES.AOM           // 'aom'
ROLES.SUPERVISOR    // 'supervisor'
ROLES.LEAD_TECH     // 'lead_tech'
ROLES.TECHNICIAN    // 'technician'
```

---

## 🔍 Content Visibility Hook API

```javascript
const {
  canViewContent,              // (content) => boolean
  canEditContent,              // (content) => boolean
  canDeleteContent,            // (content) => boolean
  getNewContentDefaults,       // () => { created_by, market_id, is_nationwide }
  canRequestNationwideApproval, // (content) => boolean
  filterVisibleContent,        // (contentArray) => filteredArray
  getVisibilityBadge,          // (content) => { label, color, icon }
  isOwnContent                 // (content) => boolean
} = useContentVisibility();
```

---

## 🎨 Tailwind Badge Styles

### Nationwide Badge
```jsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
  🌐 Nationwide
</span>
```

### Regional Badge
```jsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
  📍 {marketName}
</span>
```

---

## 🚨 Common Pitfalls

### ❌ Don't Do This
```javascript
// DON'T check role directly from profile
if (profile.role === 'admin') { // Wrong!
  // Use hasRole() instead
}

// DON'T manually filter content in frontend
const filtered = content.filter(item =>
  item.is_nationwide || item.market_id === marketId
); // RLS already does this!

// DON'T hardcode user IDs
created_by: 'some-uuid-here' // Wrong! Use getNewContentDefaults()
```

### ✅ Do This Instead
```javascript
// Use hasRole() helper
if (hasRole(ROLES.ADMIN)) { // Correct!
  // ...
}

// Let RLS handle filtering, just fetch
const { data } = await supabase.from('content').select('*');
// RLS automatically filters based on user's permissions

// Use helper to get defaults
const defaults = getNewContentDefaults();
const newContent = { ...formData, ...defaults };
```

---

## 🔧 Debugging RBAC Issues

### Check if Profile is Loaded
```javascript
console.log('RBAC Profile:', profile);
console.log('Loading:', loading);
console.log('Error:', error);
```

### Check Permissions
```javascript
console.log('Is Admin:', isAdmin());
console.log('Can Create:', canCreateContent());
console.log('Can Manage Users:', canManageUsers());
```

### Check Content Permissions
```javascript
console.log('Can View:', canViewContent(content));
console.log('Can Edit:', canEditContent(content));
console.log('Can Delete:', canDeleteContent(content));
```

### Force Reload Profile
```javascript
const { reloadProfile } = useRBAC();

// After updating user profile
await reloadProfile();
```

---

## 📝 Code Review Checklist

When adding new features with RBAC:

- [ ] Used `useRBAC()` hook for role checks
- [ ] Used `useContentVisibility()` for content permissions
- [ ] Protected routes with `allowedRoles` prop if needed
- [ ] Added ownership fields when creating content
- [ ] Never hardcoded user IDs or roles
- [ ] Used helper functions instead of direct property access
- [ ] Handled loading and error states
- [ ] Tested with multiple role types
- [ ] Verified RLS policies enforce permissions at DB level
- [ ] Added appropriate UI feedback for denied actions

---

**End of Developer Guide**
