# Database

Migrations live in `supabase/migrations/`.

## Tables

profiles, user_preferences, closet_locations, clothing_items, clothing_images, outfits, outfit_items, wear_history, wear_history_items, outfit_feedback, item_pairings, recommendations, recommendation_items, recommendation_actions, mirror_checks, clothing_analysis_jobs, mirror_analysis_jobs, planned_outfits, user_style_insights, laundry_defaults

## Relationships

- `profiles.id` → `auth.users.id`  
- Child tables reference parents; outfit_items / wear_history_items / recommendation_items secured via ownership helpers  

## Indexes

User + category/availability/status/date indexes on hot paths; unique sorted `(user_id, item_a_id, item_b_id)` on pairings.

## RLS

`auth.uid() = user_id` for direct ownership; `owns_outfit`, `owns_wear_history`, `owns_recommendation`, `owns_mirror_check` for children.

## Storage layout

Private buckets:

- clothing-originals / clothing-processed  
- mirror-check-originals / mirror-check-processed  
- receipts / exports / virtual-try-on  

Path: `/{user_id}/{resource_id}/{filename}`

## Functions

- `handle_new_user` — profile + preferences + laundry defaults  
- `upsert_item_pairing` / `calculate_pairing_score`  
- `mark_outfit_worn` — wear counts, laundry, pairings  
