# Database Migrations

This folder contains SQL migration files for the GrowKeeper database.

## Running Migrations

### Option 1: Using Supabase Dashboard (Recommended for Quick Setup)

1. Log in to your Supabase project at [https://app.supabase.com](https://app.supabase.com)
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of each migration file (in order) and paste into the editor
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Migration Files

- `001_create_plants_table.sql` - Creates the plants table with nickname, species_name, and notes fields
- `002_create_plant_events_table.sql` - Creates care history events per plant
- `003_create_tasks_table.sql` - Creates task tracking per plant
- `004_auth_user_ownership.sql` - Adds auth profiles and user-owned RLS policies
- `005_auth_hardening_indexes_constraints.sql` - Adds production ownership constraints and query indexes

## Migration Order

Always run migrations in numerical order:
1. `001_create_plants_table.sql`
2. `002_create_plant_events_table.sql`
3. `003_create_tasks_table.sql`
4. `004_auth_user_ownership.sql`
5. `005_auth_hardening_indexes_constraints.sql`

## Next Steps

After running migrations, verify the tables were created:
- Go to **Table Editor** in Supabase Dashboard
- You should see `plants`, `plant_events`, and `tasks` tables
- You should also see a `profiles` table
