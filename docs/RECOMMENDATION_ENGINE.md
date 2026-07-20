# Recommendation Engine

## Approach

No custom ML model in MVP. Structured metadata + pairing history + weighted scoring + feedback + diversity.

## Candidate generation

Outfit templates (top+bottom+shoes, dress+shoes, layered, athletic, formal, …) × available items, truncated per role, excluding dirty/unavailable by default.

## Scoring weights

Default: personal pairing 20%, ratings 15%, saved similarity 10%, style 10%, color 8%, weather 10%, occasion 10%, Mirror Check 7%, fit 5%, comfort 3%, variety 2%.

New users lean on color/style/weather/onboarding. Experienced users lean on personal history, ratings, replacements, Mirror Check confirmations.

## Pair history

Sorted item UUID pairs. Events: worn, saved, accepted, rejected, replaced, mirror positive/negative.

## Replacement learning

Replacing boots with sneakers increases sneakers↔kept items and decreases boots↔kept items — without rejecting the whole outfit.

## Diversity

Greedy selection with Jaccard similarity threshold so results are not near-duplicates.

## Explanations

Non-absolute language only (“Based on your history…”, “You may prefer…”). Never claim objective best / must wear / everyone will like.

## Personal override

High personal pairing scores can soften weak generic color clash penalties for experienced users.
