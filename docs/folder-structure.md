# GrowKeeper Folder Structure

## Root Level Folders

### `/supabase`
Database configuration and version control:
- `migrations/` - SQL migration files for schema changes
- `seed/` - Seed data for development and testing
- Config files for Supabase CLI

### `/docs`
Project documentation:
- Architecture decisions
- API documentation
- Development guides
- User guides

## `/src` Folders

### `/src/components`
Reusable React components:
- `layout/` - Page layouts and shells
- `ui/` - Generic UI components (buttons, cards, inputs, etc.)

### `/src/lib`
Utility functions and client configurations:
- `supabase.ts` - Supabase client instance
- `date.ts` - Date formatting utilities
- Additional helper functions

### `/src/types`
TypeScript type definitions:
- `plant.ts` - Plant, CareEvent, Reminder types
- Additional domain types

### `/src/features`
Feature-based modules:
- `plants/` - Plant-specific components and logic
- `care-events/` - Care event tracking
- `reminders/` - Reminder system

### `/src/hooks`
Custom React hooks for shared logic

### `/src/config`
Application configuration:
- `site.ts` - Site metadata and constants
