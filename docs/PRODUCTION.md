# Production readiness

ClosetMatch is a universal Expo application. The same project can target web, iOS, and Android. The repository already contains a complete local/demo vertical slice, recommendation logic, Supabase schema/RLS, storage helpers, and Edge Function boundaries.

## What works without cloud credentials

- Demo sign-up/sign-in and onboarding
- Add clothing from camera/photo library
- Mock clothing analysis and review
- Closet search, filtering, favorites, availability, and laundry state
- Outfit builder, saved outfits, wear history, pairing learning, and recommendations
- Weather-aware suggestions with Open-Meteo
- Mirror Check mock analysis and feedback learning
- Planned outfits, wardrobe analytics, and JSON data export
- Web, Android, and iOS targets from one Expo project

## What must be completed for a real multi-device product

1. **Supabase data repositories** — replace the persisted demo store as the source of truth for profiles, preferences, clothing, outfits, wears, pairings, Mirror Checks, and plans. Keep the local store as an offline cache/queue.
2. **Production auth** — wire Supabase email/password plus optional magic link, Google, and Apple. Restore sessions on launch and handle email verification/password reset deep links.
3. **Private image pipeline** — upload clothing/Mirror photos to private Supabase Storage paths, pass short-lived signed URLs or bytes to analysis functions, and enforce retention/deletion server-side.
4. **Real vision adapter** — the Edge Functions currently return deterministic mock data when no key exists and intentionally return `provider_not_wired` when a live key is present. Add the chosen model/provider, JSON schema validation, rate limits, timeouts, and retry/fallback behavior.
5. **Notifications** — settings exist, but actual Expo notification permissions, push-token storage, local reminders, and server-triggered pushes still need implementation.
6. **Account deletion/export** — make deletion server-authoritative and verify cascading database/storage cleanup. Cloud export should be generated server-side.
7. **Observability** — add crash/error reporting, privacy-safe product analytics, Edge Function logs/alerts, and health checks.
8. **Release hardening** — accessibility pass, tablet/desktop responsive pass, image compression limits, offline conflict handling, end-to-end tests, privacy policy/terms, store screenshots/metadata, and beta testing.

## Web release

```bash
npm install
npm run web
npm run web:export
npx eas-cli@latest login
npx eas-cli@latest deploy
# production alias
npx eas-cli@latest deploy --prod
```

`expo.web.output` is already `static`. `public/manifest.webmanifest` provides install metadata; a service worker is intentionally not included because aggressive caching can make updates difficult. Native builds are the preferred offline-installed experience.

## Native release

Connect the project to your Expo account first:

```bash
npx eas-cli@latest login
npx eas-cli@latest init
```

Then create internal or production builds:

```bash
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform ios --profile preview
npm run build:all
```

After store accounts and signing are configured, submit production builds with EAS Submit.

## Suggested implementation order

1. Data repository + Supabase auth/session bootstrapping
2. Private photo upload + real clothing analysis
3. Cloud outfit/wear/recommendation persistence
4. Mirror Check cloud pipeline + deletion guarantees
5. Notifications and planned-outfit reminders
6. Desktop/tablet polish and beta release
7. Optional virtual try-on, shopping/packing, resale, stylist/social features
