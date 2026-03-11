# Care Logging Feature - Testing Guide

## Overview

The care logging feature allows users to track care events (watering, fertilizing, pruning, repotting) for each plant on its detail page.

## Files Created/Modified

### Created Files

1. **[supabase/migrations/002_create_plant_events_table.sql](../supabase/migrations/002_create_plant_events_table.sql)**
   - SQL migration to create the `plant_events` table
   - Includes indexes, RLS policies, and foreign key constraints
   - Event types: watered, fertilized, pruned, repotted

2. **[src/app/actions/plant-events.ts](../src/app/actions/plant-events.ts)**
   - `addPlantEvent()`: Server action to insert care events
   - `getPlantEvents()`: Server action to fetch events for a plant

3. **[src/components/care-events/add-care-event-form.tsx](../src/components/care-events/add-care-event-form.tsx)**
   - Client component form for logging care events
   - Dropdown for event type selection
   - Optional notes textarea
   - Success/error feedback

4. **[src/components/care-events/care-event-list.tsx](../src/components/care-events/care-event-list.tsx)**
   - Server component to display care event history
   - Shows event type with emoji icons
   - Displays notes and timestamp
   - Empty state when no events exist

### Modified Files

1. **[src/types/database.ts](../src/types/database.ts)**
   - Added `CareEventType` type export
   - Added `plant_events` table type definitions
   - Foreign key relationship to plants table

2. **[src/app/plants/[id]/page.tsx](../src/app/plants/[id]/page.tsx)**
   - Integrated care event form below plant details
   - Added care history section
   - Error handling for failed event queries

## SQL Migration

**Run this in Supabase Dashboard SQL Editor:**

```sql
-- Create plant_events table for care logging
CREATE TABLE IF NOT EXISTS public.plant_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id uuid NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('watered', 'fertilized', 'pruned', 'repotted')),
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS plant_events_plant_id_idx ON public.plant_events(plant_id);
CREATE INDEX IF NOT EXISTS plant_events_created_at_idx ON public.plant_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.plant_events ENABLE ROW LEVEL SECURITY;

-- Allow public access
GRANT SELECT, INSERT ON TABLE public.plant_events TO anon;

-- RLS policies
CREATE POLICY "plant_events_public_select"
ON public.plant_events FOR SELECT TO anon USING (true);

CREATE POLICY "plant_events_public_insert"
ON public.plant_events FOR INSERT TO anon WITH CHECK (true);
```

## How to Test Locally

### Step 1: Run the Database Migration

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your GrowKeeper project
3. Click **SQL Editor** in the sidebar
4. Click **New Query**
5. Copy the SQL from `supabase/migrations/002_create_plant_events_table.sql`
6. Paste and click **Run**
7. Verify the table was created:
   - Go to **Table Editor**
   - You should see `plant_events` table

### Step 2: Start the Development Server

```bash
npm run dev
```

### Step 3: Navigate to a Plant Detail Page

1. Open [http://localhost:3000](http://localhost:3000)
2. If you don't have any plants yet, add one using the form:
   - Nickname: "Monstera"
   - Species: "Monstera Deliciosa"
   - Notes: "Test plant"
3. Click on the plant card to go to `/plants/[id]`

### Step 4: Test Care Event Logging

On the plant detail page, you'll see three sections:

#### Section 1: Plant Details
- Shows nickname, species, notes, and creation date

#### Section 2: Log Care Event Form
- **Test watering:**
  - Select "Watered" from dropdown
  - Add notes: "First watering of the month"
  - Click "Log Care Event"
  - You should see: "Care event logged successfully!" message
  
- **Test without notes:**
  - Select "Fertilized"
  - Leave notes blank
  - Click "Log Care Event"
  - Should succeed without notes

#### Section 3: Care History
- Events appear immediately after logging
- Most recent event shows first
- Each event displays:
  - Event type with emoji (💧 Watered, 🌱 Fertilized, ✂️ Pruned, 🪴 Repotted)
  - Notes (if provided)
  - Timestamp

### Step 5: Test Error States

#### Test "No Events Yet" State
- Navigate to a plant that has no care events
- You should see: "No care events logged yet. Add your first event above!"

#### Test Insert Failure
- To simulate: temporarily break your Supabase connection
- Change `NEXT_PUBLIC_SUPABASE_ANON_KEY` to invalid value in `.env.local`
- Restart dev server
- Try to log an event
- You should see: "Failed to add care event" error message
- Restore correct key and restart

#### Test Query Failure
- Same as above, but check that Care History section shows:
  - "Failed to load care events: [error message]"

## Visual Test Cases

### Empty State
```
┌─────────────────────────────────────────┐
│  No care events logged yet.             │
│  Add your first event above!            │
└─────────────────────────────────────────┘
```

### With Events
```
┌─────────────────────────────────────────┐
│ 💧 Watered              Mar 10, 2026    │
│ First watering of the month             │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 🌱 Fertilized           Mar 9, 2026     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ ✂️ Pruned               Mar 8, 2026     │
│ Removed dead leaves                     │
└─────────────────────────────────────────┘
```

### Insert Error
```
┌─────────────────────────────────────────┐
│ ❌ Failed to add care event             │
└─────────────────────────────────────────┘
```

### Query Error
```
┌─────────────────────────────────────────┐
│ Failed to load care events:             │
│ [error message]                         │
└─────────────────────────────────────────┘
```

## Verification Checklist

- [ ] Migration creates `plant_events` table successfully
- [ ] Can select event type from dropdown (4 options)
- [ ] Can add optional notes
- [ ] Form submits and shows success message
- [ ] New event appears immediately in care history
- [ ] Events are ordered newest first
- [ ] Event types show correct emoji icons
- [ ] Notes display correctly with line breaks
- [ ] Timestamp formats correctly
- [ ] Empty state shows when no events exist
- [ ] Insert errors display user-friendly message
- [ ] Query errors display user-friendly message
- [ ] Form clears after successful submission
- [ ] Success message auto-dismisses after 3 seconds
- [ ] Multiple events can be logged for same plant
- [ ] Back link returns to homepage

## Database Verification

Check data in Supabase Table Editor:

```sql
-- View all events
SELECT * FROM public.plant_events ORDER BY created_at DESC;

-- View events for specific plant
SELECT * FROM public.plant_events 
WHERE plant_id = 'your-plant-id'
ORDER BY created_at DESC;

-- Count events by type
SELECT event_type, COUNT(*) 
FROM public.plant_events 
GROUP BY event_type;
```

## Next Steps

After testing, consider adding:
- Delete care event functionality
- Edit care event functionality
- Filter events by type
- Event statistics (e.g., "Last watered 3 days ago")
- Calendar view of care events
- Reminder system based on care patterns
