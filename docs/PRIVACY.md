# Privacy

## What we store

Profile basics, preferences, clothing metadata, outfit/wear/feedback/pairing history, optional Mirror Check analysis results, planned outfits, style insights.

## Images

Clothing and Mirror Check images are private. Paths are user-scoped. Access via signed URLs when using Supabase Storage.

## Mirror Check retention

Configurable; default deletes originals after analysis. Users can delete history anytime.

## Deletion & export

Account deletion clears owned data. Export returns metadata JSON; photo binaries follow retention and are omitted from client export by default.

## Analytics policy

Optional anonymous product events only (e.g. onboarding completed, recommendation accepted). Never: photo contents, full photo URLs, personal notes, exact wardrobe dumps to third-party analytics.

## Training

`never_use_images_for_training` defaults to true and is non-negotiable in product policy.
