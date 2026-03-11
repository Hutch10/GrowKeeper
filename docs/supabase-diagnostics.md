# Supabase Connection Diagnostics

GrowKeeper includes automated Supabase connection diagnostics that verify environment configuration and database connectivity. The system runs automatically on page load and displays clear, actionable error messages when issues are detected.

## What Gets Checked

The diagnostic system performs three checks in sequence:

1. **Environment Variables** - Verifies `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` exist and are not placeholder values
2. **Supabase Connection** - Attempts to connect to your Supabase instance
3. **Table Access** - Tests querying the `plants` table to ensure the schema is deployed

## Error Messages by Scenario

### Scenario 1: Missing Environment Variables

**When this happens:**
- `.env.local` file doesn't exist
- Environment variables are not set
- Variables still have placeholder values (`your-project-ref`, `your-anon-key`)

**What you'll see:**

```
⚠️ Supabase Configuration Required

Missing environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
Please configure these in your .env.local file

Quick Fix:
1. Copy .env.example to .env.local
2. Get your Supabase URL and anon key from Supabase Dashboard
3. Update the values in .env.local
4. Restart the dev server
```

**UI State:**
- Warning banner with yellow/amber background
- Quick fix instructions displayed
- Main content (add form and plant list) hidden
- Message: "Please configure Supabase to start tracking your plants."

---

### Scenario 2: Invalid Supabase Credentials

**When this happens:**
- Environment variables are set but incorrect
- Invalid API key
- Wrong project URL

**What you'll see:**

```
❌ Supabase Configuration Required

Database connection failed: Invalid API key
Invalid Supabase credentials. Check your NEXT_PUBLIC_SUPABASE_ANON_KEY.
```

**UI State:**
- Error banner with red background
- Connection failure message
- Suggestion to verify credentials
- Main content hidden

---

### Scenario 3: Database Table Not Created

**When this happens:**
- Environment variables are correct
- Connection to Supabase successful
- `plants` table doesn't exist (migration not run)

**What you'll see:**

```
❌ Supabase Configuration Required

Database connection failed: relation "public.plants" does not exist
The plants table doesn't exist. Run the migration in Supabase Dashboard.

Database Setup Required:
1. Go to Supabase Dashboard
2. Click SQL Editor in the sidebar
3. Copy the SQL from supabase/migrations/001_create_plants_table.sql
4. Paste and click Run
5. Refresh this page
```

**UI State:**
- Error banner with red background
- Clear migration instructions
- Link to Supabase Dashboard
- Main content hidden

---

### Scenario 4: Empty Plants Table (Success)

**When this happens:**
- Environment variables correct
- Connection successful
- Table exists but has no records

**What you'll see:**

```
[No error banner - everything is working]

Add New Plant
[Add plant form displayed]

Your Plants
[Empty state message: "No plants yet. Add your first plant above!"]
```

**UI State:**
- ✅ No diagnostic warnings (connection is healthy)
- Add plant form fully functional
- Empty state in plant list
- Clean, normal appearance

---

### Scenario 5: Everything Working with Data

**When this happens:**
- All checks pass
- Plants exist in database

**What you'll see:**

```
[No error banner]

Add New Plant
[Add plant form displayed]

Your Plants
[Grid of plant cards displayed]
```

**UI State:**
- ✅ No diagnostic messages at all
- Full functionality enabled
- Plants displayed in responsive grid
- Normal homepage experience

---

## Technical Implementation

### Files Created

1. **[src/lib/diagnostics.ts](../src/lib/diagnostics.ts)**
   - `checkEnvVars()`: Validates environment variable configuration
   - `testSupabaseConnection()`: Performs connection and table access tests
   - `getStatusBadge()`: Returns UI styling based on diagnostic status

2. **[src/components/diagnostics/connection-status.tsx](../src/components/diagnostics/connection-status.tsx)**
   - React component that renders diagnostic messages
   - Shows context-specific quick fix instructions
   - Only renders when there are issues (hidden on success)

3. **[src/app/page.tsx](../src/app/page.tsx)** (updated)
   - Runs diagnostics before attempting to fetch plants
   - Conditionally renders content based on diagnostic results
   - Preserves existing AddPlantForm and PlantList functionality

### Behavior

- **Non-Breaking**: Existing functionality works normally when connection is healthy
- **Progressive**: Shows more detailed errors as checks progress
- **Actionable**: Every error includes specific steps to resolve
- **Silent on Success**: No diagnostic UI shown when everything works

### Development vs Production

The diagnostic system works in both environments:

- **Development** (`npm run dev`): Live diagnostics on every request
- **Production** (`npm run build` + `npm start`): Diagnostics run server-side before rendering

## Testing the Diagnostics

To test different error scenarios:

1. **Missing env vars**: Rename `.env.local` temporarily
2. **Invalid credentials**: Change `NEXT_PUBLIC_SUPABASE_ANON_KEY` to a fake value
3. **Missing table**: Don't run the migration, or drop the table in Supabase
4. **Empty table**: Run migration but don't add any plants
5. **Working state**: Proper config + migration + add plants

## Benefits

✅ **New Developer Onboarding**: Clear setup instructions when first cloning the repo
✅ **Runtime Validation**: Catches configuration issues before they cause cryptic errors
✅ **Self-Service**: Users can fix issues without digging through logs
✅ **Production Safety**: Graceful degradation instead of crashes
✅ **Maintenance**: Easy to diagnose issues in deployed environments
