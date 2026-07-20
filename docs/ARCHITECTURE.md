# Architecture

## Client

- Expo Router file-based navigation: `(auth)`, `(onboarding)`, `(tabs)`, feature stacks  
- Zustand persisted store for demo/offline vertical slice  
- TanStack Query ready for Supabase-backed queries  
- Zod validation for forms and AI JSON  
- Theme: Fraunces + DM Sans, sage/ink palette, light & dark  

## Server

- Supabase Auth + Postgres + Storage  
- Edge Functions for clothing analysis, Mirror Check, weather proxy, cleanup, export  
- Service-role secrets never shipped to the client  

## Data flow

1. Capture image → private bucket path `/{user_id}/{resource_id}/file`  
2. Edge function analyzes → Zod-validate → user corrects → `clothing_items`  
3. Outfits / wears update `item_pairings` via sorted UUID pairs  
4. Recommendation engine scores candidates client-side (server optional)  
5. Mirror Check uploads privately → analysis → retention policy may delete photo  

## AI abstractions

| Interface | Mock | Live |
| --- | --- | --- |
| Clothing analysis | `MockClothingAnalysisProvider` | Edge `analyze-clothing` |
| Mirror Check | `MockMirrorAnalysisProvider` | Edge `analyze-mirror-check` |
| Background removal | Pass-through mock | Future provider |
| Weather | Mock / Open-Meteo | Edge proxy |
| Virtual try-on | Stub interfaces only | Future |

## Offline

Cached closet/outfits via Zustand+AsyncStorage; draft outfits and status queues; sync when Supabase is configured.

## Security

RLS on all owned tables; private buckets; signed URLs; no service keys in app; safe logging (no personal image URLs).
