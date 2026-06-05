# Security Documentation

## ⚠️ Current Security Limitations

The admin panel currently uses **localStorage-based sessions with the Supabase anon key**. This approach has significant security vulnerabilities:

### Critical Issues

1. **No Server-Side Authentication**: All authentication checks happen in the browser and can be bypassed
2. **Forged Sessions**: Anyone can create a fake session in localStorage with admin privileges
3. **Exposed Anon Key**: The anon key allows anyone to call the database directly
4. **RLS Bypass**: Current RLS policies allow unrestricted anon access to admin tables

### What This Means

- **Internal Use Only**: This admin panel should ONLY be used on trusted networks
- **Not Production-Ready**: Do not expose this to the public internet
- **No Real Security**: Authentication is cosmetic only

---

## ✅ Production-Ready Solution: Supabase Auth

To make this production-secure, implement proper Supabase Authentication:

### Step 1: Create Supabase Auth Users

For each admin in the `admins` table, create a corresponding user in Supabase Auth:

```typescript
// Run this migration script once
import { supabase } from './lib/supabase';

async function migrateAdminsToAuth() {
  const { data: admins } = await supabase.from('admins').select('*');

  for (const admin of admins) {
    // Create auth user
    const { data: authUser, error } = await supabase.auth.admin.createUser({
      email: admin.email,
      password: 'TEMP_PASSWORD', // User must reset
      email_confirm: true,
      user_metadata: {
        name: admin.name,
        username: admin.username,
      },
      app_metadata: {
        user_role: admin.role, // Store role in app_metadata
        admin_id: admin.id,
      },
    });

    if (error) {
      console.error(`Failed to create user for ${admin.email}:`, error);
    }
  }
}
```

### Step 2: Update Login Flow

Replace the current localStorage auth with Supabase Auth:

```typescript
// src/lib/adminAuth.ts
export async function loginAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Check if user has admin access
  const role = data.user?.app_metadata?.user_role;
  if (!role) {
    await supabase.auth.signOut();
    return { success: false, error: 'No admin access' };
  }

  return { success: true };
}

export function getAdminSession() {
  const { data } = supabase.auth.getSession();
  if (!data.session) return null;

  return {
    id: data.session.user.app_metadata.admin_id,
    username: data.session.user.user_metadata.username,
    name: data.session.user.user_metadata.name,
    role: data.session.user.app_metadata.user_role,
    email: data.session.user.email,
  };
}
```

### Step 3: Update RLS Policies

Remove all anon policies and use authenticated policies with JWT claims:

```sql
-- Remove all anon write policies
DROP POLICY "Anon can manage admins (INSECURE)" ON admins;
DROP POLICY "Anon can manage clients (INSECURE)" ON clients;
-- ... etc

-- Use JWT claims for role-based access
CREATE POLICY "Authenticated admin can manage clients"
  ON clients FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('admin', 'editor')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('admin', 'editor')
  );
```

### Step 4: Update Frontend Auth Hook

```typescript
// src/hooks/useAdminAuth.ts
export function useAdminAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const role = session?.user?.app_metadata?.user_role ?? 'viewer';

  return {
    session,
    role,
    isLoggedIn: !!session,
    isLoading: loading,
    can: (permission) => hasPermission(role, permission),
    logout: () => supabase.auth.signOut(),
  };
}
```

---

## Alternative Solutions

### Option 1: Edge Functions with Service Role

Move all admin operations to Edge Functions that use the service_role key:

```typescript
// supabase/functions/admin-api/index.ts
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);

Deno.serve(async (req) => {
  // Validate session token from request
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token || !isValidSession(token)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Perform operation with service_role permissions
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('*');

  return new Response(JSON.stringify(data));
});
```

### Option 2: IP Whitelist

Add IP-based access control in RLS policies:

```sql
CREATE POLICY "Admin IPs can manage clients"
  ON clients FOR ALL TO anon
  USING (
    current_setting('request.headers')::json->>'x-forwarded-for'
    = ANY(ARRAY['YOUR_OFFICE_IP', 'YOUR_VPN_IP'])
  );
```

---

## Current State Summary

✅ **What Works:**
- Role-based access control in the UI
- Permission checks prevent unauthorized UI access
- Viewers cannot see edit/delete buttons

❌ **What Doesn't Work:**
- Anyone with browser dev tools can bypass all security
- Database is fully accessible via anon key
- No real authentication enforcement

**Recommendation:** Implement Supabase Auth migration before production deployment.
