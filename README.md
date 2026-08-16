# ClosetMatch

**Your clothes. Your style. Better together.**

ClosetMatch is an AI-powered personal closet, outfit recommendation, wardrobe history, laundry tracking, outfit planning, and private Mirror Check application.

It learns from what you actually own, save, wear, rate, replace, and confirm — not from generic fashion rules alone.

## Features (MVP)

- Email/password-ready auth architecture (demo local auth works offline)
- Guided onboarding (style, colors, fit, privacy, permissions)
- Clothing photo capture + AI-assisted classification (mock or edge function)
- Digital closet with search, filters, and availability
- Outfit builder + wear history + laundry tracking
- Weighted recommendation engine with pairing history & replacement learning
- Weather-aware “What Should I Wear Today?”
- Private Mirror Check (clothing-focused, never body criticism)
- Outfit calendar / planning
- Basic wardrobe analytics & cost-per-wear
- Supabase migrations, RLS, private storage buckets
- Automated unit tests for recommendations, schemas, and pairing scores

## Screenshots

_Add Expo Go / simulator screenshots here after first run._

## Stack

- React Native · Expo · TypeScript · Expo Router
- Supabase (Auth, Postgres, Storage, Edge Functions, RLS)
- TanStack Query · Zustand · React Hook Form · Zod
- Expo Camera / Image Picker / File System / Notifications / Location / Secure Store

## Quick start

```bash
cd closetmatch
cp .env.example .env
npm install
npm start
```

Optional: load the **sample wardrobe** at the end of onboarding to explore recommendations immediately (no API keys required).

### Demo mode

Without Supabase credentials the app runs a full vertical slice in local demo mode:

1. Sign up → onboarding  
2. Import sample wardrobe (or capture clothing)  
3. Build / wear outfits  
4. Generate recommendations  
5. Run Mirror Check  

### Supabase setup

1. Create a Supabase project  
2. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`  
3. Apply migrations in `supabase/migrations/`  
4. Deploy edge functions in `supabase/functions/`  
5. Set server secrets (`OPENAI_API_KEY`, etc.) — never in the mobile app  

```bash
supabase db push
supabase functions deploy analyze-clothing
supabase functions deploy analyze-mirror-check
```

## Environment variables

See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (RLS-protected) |
| `EXPO_PUBLIC_AI_PROVIDER` | `mock` or `openai` (via edge functions) |
| `EXPO_PUBLIC_WEATHER_PROVIDER` | `open-meteo` or `mock` |

## Build and deploy

ClosetMatch is a universal Expo app: the same codebase targets web, Android, and iOS.

```bash
# browser development
npm run web

# production web export
npm run web:export

# connect to an Expo/EAS project once
npx eas-cli@latest init

# deploy web production
npm run deploy:web

# native production binaries
npm run build:all
```

See [Production readiness](docs/PRODUCTION.md) for the remaining cloud/auth/AI/release work.

## Testing

```bash
npm test
```

## Documentation

- [Product spec](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE.md)
- [Recommendation engine](docs/RECOMMENDATION_ENGINE.md)
- [Mirror Check](docs/MIRROR_CHECK.md)
- [Privacy](docs/PRIVACY.md)
- [Roadmap](docs/ROADMAP.md)
- [Production readiness](docs/PRODUCTION.md)

## Privacy notes

- Mirror Check photos are private by default
- Row Level Security on every user-owned table
- Private storage buckets + signed URLs
- No personal images in analytics
- Never use personal images for model training
- Users can delete photos, export data, and delete accounts

## License

Private / unlicensed unless otherwise specified.
