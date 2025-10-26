# Supabase Integration Guide

## Overview

This document provides comprehensive guidance on maintaining a stable and secure Supabase integration in the Retail Bandhu application.

## Environment Variables

### Required Variables

All of these must be configured in your Vercel project:

- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL (public, safe for client)
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase anonymous key (public, safe for client)
- **SUPABASE_URL**: Server-side Supabase URL (private)
- **SUPABASE_ANON_KEY**: Server-side anonymous key (private)
- **SUPABASE_SERVICE_ROLE_KEY**: Admin key for privileged operations (private, never expose)

### Verification

To verify all environment variables are correctly set:

\`\`\`bash
npm run test:supabase
\`\`\`

Or visit: `http://localhost:3000/api/health/supabase`

## Client Usage Patterns

### Server Components

\`\`\`typescript
import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function MyComponent() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from("profiles").select("*")
  return <div>{/* render data */}</div>
}
\`\`\`

### Client Components

\`\`\`typescript
"use client"
import { createClientSupabaseClient } from "@/lib/supabase-client"
import { useEffect, useState } from "react"

export default function MyComponent() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const supabase = createClientSupabaseClient()
    supabase.from("profiles").select("*").then(({ data }) => setData(data))
  }, [])

  return <div>{/* render data */}</div>
}
\`\`\`

### With Retry Logic

\`\`\`typescript
import { withRetryAndLogging } from "@/lib/supabase-retry"
import { createServiceClient } from "@/lib/supabase-server"

const supabase = createServiceClient()
const data = await withRetryAndLogging(
  () => supabase.from("profiles").select("*"),
  "Fetch profiles",
  { maxAttempts: 3 }
)
\`\`\`

## Error Handling

### Using Error Handler

\`\`\`typescript
import { handleSupabaseError, isRetryableError } from "@/lib/supabase-error-handler"

try {
  const { data, error } = await supabase.from("profiles").select("*")
  if (error) throw error
} catch (error) {
  const supabaseError = handleSupabaseError(error, "Fetch profiles")
  
  if (isRetryableError(supabaseError)) {
    // Retry the operation
  } else {
    // Handle permanent error
    console.error(supabaseError.message)
  }
}
\`\`\`

## Best Practices

### 1. Use Singleton Pattern

Always use the singleton clients to prevent multiple instances:

\`\`\`typescript
import { getServiceClient } from "@/lib/supabase-client-singleton"

const supabase = getServiceClient()
\`\`\`

### 2. Implement Row-Level Security (RLS)

All tables should have RLS policies:

\`\`\`sql
-- Example RLS policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
\`\`\`

### 3. Use Connection Pooling

For better performance with many concurrent connections, enable connection pooling in Supabase settings.

### 4. Cache Server-Side Queries

Use React's `cache()` function to deduplicate requests:

\`\`\`typescript
import { cache } from "react"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export const getProfile = cache(async (userId: string) => {
  const supabase = createServerSupabaseClient()
  return supabase.from("profiles").select("*").eq("id", userId).single()
})
\`\`\`

### 5. Monitor Query Performance

Add logging for slow queries:

\`\`\`typescript
const startTime = Date.now()
const { data, error } = await supabase.from("profiles").select("*")
const duration = Date.now() - startTime

if (duration > 1000) {
  console.warn(`Slow query detected: ${duration}ms`)
}
\`\`\`

## Troubleshooting

### Connection Issues

1. Verify all environment variables are set: `npm run test:supabase`
2. Check Supabase project status in dashboard
3. Verify network connectivity
4. Check for rate limiting (429 errors)

### Authentication Issues

1. Verify SUPABASE_SERVICE_ROLE_KEY is correct
2. Check RLS policies are not blocking operations
3. Verify user has appropriate permissions

### Performance Issues

1. Add database indexes for frequently queried columns
2. Enable connection pooling
3. Use pagination for large result sets
4. Cache frequently accessed data

## Maintenance

### Regular Checks

- Monitor error logs for connection failures
- Review slow query logs
- Check database size and optimize if needed
- Verify RLS policies are working correctly

### Updates

- Keep Supabase client library updated
- Review Supabase release notes for breaking changes
- Test updates in development before production

## Support

For issues or questions:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review error logs in Supabase dashboard
3. Test connection with health endpoint
4. Contact Vercel support if needed
