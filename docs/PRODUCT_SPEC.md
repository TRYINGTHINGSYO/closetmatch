# ClosetMatch Product Spec

## Vision

ClosetMatch turns a photographed wardrobe into a personal style system. It recommends outfits based on the user’s real behavior — not only textbook color theory.

## User problems

- “I don’t know what to wear.”
- “I forget what combinations I already like.”
- “Half my clothes never get worn.”
- “Generic fashion apps don’t match my taste.”
- “I want private feedback on how an outfit looks together.”

## Target users

People who own a physical wardrobe and want smarter daily decisions: students, professionals, anyone building a reusable personal style history. MVP is a single normal user account.

## Core workflows

1. Photograph / upload clothing → AI suggest details → user corrects → save  
2. Manually save outfits they already wear  
3. Mark outfits worn → laundry updates → pairing history grows  
4. Ask “What should I wear today?” with weather + occasion context  
5. Replace one item in a recommendation → learn preferences surgically  
6. Optional Mirror Check → clothing-focused feedback → user agrees/disagrees  
7. Plan outfits on a calendar; review analytics privately  

## MVP scope

Auth, onboarding, closet, capture + AI (mocked or live), outfits, wear/laundry, recommendations, weather, Mirror Check privacy, calendar, analytics, migrations, RLS, tests, docs.

## Out of MVP

Virtual try-on, social, shopping/resale, custom model training, perfect brand/material recognition.

## Assumptions

- Demo local store powers the vertical slice when Supabase is unset.  
- Open-Meteo is the default weather source (no key).  
- AI providers are interchangeable behind interfaces; mock providers ship by default.  
