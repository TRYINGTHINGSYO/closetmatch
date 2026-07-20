import type { ClothingCategory, OutfitRole } from '@/types';

export const APP_NAME = 'ClosetMatch';
export const APP_TAGLINE = 'Your clothes. Your style. Better together.';

export const STYLE_OPTIONS = [
  'Casual',
  'Athletic',
  'Streetwear',
  'Formal',
  'Business casual',
  'Minimal',
  'Vintage',
  'Preppy',
  'Outdoors',
  'Workwear',
  'Alternative',
  'Western',
  'Luxury',
  'Relaxed',
  'Mixed',
  'Custom',
] as const;

export const FIT_OPTIONS = [
  'Slim',
  'Regular',
  'Relaxed',
  'Loose',
  'Oversized',
  'Cropped',
  'Tailored',
  'Mixed',
] as const;

export const OCCASION_OPTIONS = [
  'Everyday',
  'School',
  'Work',
  'Interview',
  'Date',
  'Dinner',
  'Party',
  'Formal event',
  'Wedding',
  'Funeral',
  'Exercise',
  'Travel',
  'Church',
  'Court',
  'Presentation',
  'Concert',
  'Outdoor activity',
  'Photos',
  'Relaxing at home',
  'Custom',
] as const;

export const COLOR_OPTIONS = [
  'black',
  'white',
  'gray',
  'navy',
  'blue',
  'light blue',
  'green',
  'olive',
  'brown',
  'beige',
  'cream',
  'red',
  'burgundy',
  'pink',
  'purple',
  'orange',
  'yellow',
  'gold',
  'silver',
  'multicolor',
] as const;

export const CONTRAST_OPTIONS = [
  { value: 'low', label: 'Low contrast' },
  { value: 'medium', label: 'Medium contrast' },
  { value: 'high', label: 'High contrast' },
  { value: 'no_preference', label: 'No preference' },
] as const;

export const RECOMMENDATION_MODE_OPTIONS = [
  { value: 'safe', label: 'Safe combinations' },
  { value: 'familiar', label: 'Mostly familiar' },
  { value: 'balanced', label: 'Balanced variety' },
  { value: 'experimental', label: 'Experimental' },
  { value: 'max_variety', label: 'Maximum variety' },
] as const;

export const CLOTHING_CATEGORIES: Record<
  ClothingCategory,
  { label: string; subcategories: string[] }
> = {
  top: {
    label: 'Tops',
    subcategories: [
      'T-shirt',
      'Graphic T-shirt',
      'Long-sleeve shirt',
      'Polo',
      'Button-up shirt',
      'Dress shirt',
      'Blouse',
      'Tank top',
      'Sweater',
      'Hoodie',
      'Sweatshirt',
      'Cardigan',
      'Vest',
      'Jersey',
      'Crop top',
      'Tunic',
      'Thermal top',
      'Other top',
    ],
  },
  bottom: {
    label: 'Bottoms',
    subcategories: [
      'Jeans',
      'Chinos',
      'Dress pants',
      'Cargo pants',
      'Sweatpants',
      'Joggers',
      'Leggings',
      'Shorts',
      'Athletic shorts',
      'Skirt',
      'Dress skirt',
      'Overalls',
      'Track pants',
      'Other bottoms',
    ],
  },
  one_piece: {
    label: 'One-piece',
    subcategories: [
      'Dress',
      'Jumpsuit',
      'Romper',
      'Suit',
      'Coveralls',
      'Bodysuit',
      'Other one-piece',
    ],
  },
  outerwear: {
    label: 'Outerwear',
    subcategories: [
      'Jacket',
      'Coat',
      'Blazer',
      'Rain jacket',
      'Windbreaker',
      'Denim jacket',
      'Leather jacket',
      'Puffer jacket',
      'Parka',
      'Bomber jacket',
      'Trench coat',
      'Fleece',
      'Other outerwear',
    ],
  },
  shoes: {
    label: 'Shoes',
    subcategories: [
      'Sneakers',
      'Running shoes',
      'Basketball shoes',
      'Boots',
      'Work boots',
      'Dress shoes',
      'Loafers',
      'Sandals',
      'Heels',
      'Flats',
      'Slippers',
      'Cleats',
      'Other shoes',
    ],
  },
  accessory: {
    label: 'Accessories',
    subcategories: [
      'Hat',
      'Baseball cap',
      'Beanie',
      'Belt',
      'Tie',
      'Bow tie',
      'Scarf',
      'Gloves',
      'Watch',
      'Necklace',
      'Bracelet',
      'Earrings',
      'Ring',
      'Sunglasses',
      'Bag',
      'Backpack',
      'Purse',
      'Wallet',
      'Other accessory',
    ],
  },
  specialty: {
    label: 'Specialty',
    subcategories: [
      'Sleepwear',
      'Swimwear',
      'Gym wear',
      'Uniform',
      'Costume',
      'Protective clothing',
      'Formalwear',
      'Maternity clothing',
      'Medical clothing',
      'Other specialty item',
    ],
  },
};

export const OUTFIT_ROLES: { value: OutfitRole; label: string; required?: boolean }[] = [
  { value: 'head_accessory', label: 'Head accessory' },
  { value: 'top', label: 'Top' },
  { value: 'undershirt', label: 'Undershirt' },
  { value: 'mid_layer', label: 'Mid-layer' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'one_piece', label: 'One-piece' },
  { value: 'socks', label: 'Socks' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'belt', label: 'Belt' },
  { value: 'watch', label: 'Watch' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'bag', label: 'Bag' },
  { value: 'other_accessory', label: 'Other accessory' },
];

export const AVAILABILITY_LABELS: Record<string, string> = {
  available: 'Available',
  dirty: 'Dirty',
  in_laundry: 'In laundry',
  drying: 'Drying',
  packed: 'Packed',
  borrowed: 'Borrowed',
  being_repaired: 'Being repaired',
  missing: 'Missing',
  donated: 'Donated',
  sold: 'Sold',
  archived: 'Archived',
  damaged: 'Damaged',
};

export const STARTER_OUTFIT_CATEGORIES = [
  'Everyday',
  'School',
  'Work',
  'Date',
  'Formal',
  'Comfortable',
  'Cold weather',
  'Hot weather',
  'Rainy weather',
  'Athletic',
] as const;

export const WEAR_TODAY_MODES = [
  { id: 'safe', label: 'Safe choice' },
  { id: 'surprise', label: 'Surprise me' },
  { id: 'something_new', label: 'Something new' },
  { id: 'most_comfortable', label: 'Most comfortable' },
  { id: 'best_rated', label: 'Best rated' },
  { id: 'least_recent', label: 'Least recently worn' },
  { id: 'work', label: 'Work' },
  { id: 'school', label: 'School' },
  { id: 'date', label: 'Date' },
  { id: 'formal', label: 'Formal' },
  { id: 'casual', label: 'Casual' },
  { id: 'athletic', label: 'Athletic' },
  { id: 'rainy', label: 'Rainy day' },
  { id: 'cold', label: 'Cold weather' },
  { id: 'hot', label: 'Hot weather' },
] as const;

/** Initial recommendation weight distribution (sums to 1.0 excluding penalties) */
export const DEFAULT_SCORE_WEIGHTS = {
  personal_pairing: 0.2,
  user_ratings: 0.15,
  saved_similarity: 0.1,
  style_compatibility: 0.1,
  color_compatibility: 0.08,
  weather_suitability: 0.1,
  occasion_suitability: 0.1,
  mirror_check_history: 0.07,
  fit_proportion: 0.05,
  comfort_history: 0.03,
  variety_recent_wear: 0.02,
} as const;

export const NEW_USER_SCORE_WEIGHTS = {
  personal_pairing: 0.08,
  user_ratings: 0.05,
  saved_similarity: 0.05,
  style_compatibility: 0.18,
  color_compatibility: 0.15,
  weather_suitability: 0.15,
  occasion_suitability: 0.12,
  mirror_check_history: 0.02,
  fit_proportion: 0.08,
  comfort_history: 0.02,
  variety_recent_wear: 0.1,
} as const;

export const EXPERIENCED_USER_SCORE_WEIGHTS = {
  personal_pairing: 0.28,
  user_ratings: 0.18,
  saved_similarity: 0.1,
  style_compatibility: 0.06,
  color_compatibility: 0.05,
  weather_suitability: 0.08,
  occasion_suitability: 0.08,
  mirror_check_history: 0.1,
  fit_proportion: 0.03,
  comfort_history: 0.06,
  variety_recent_wear: 0.02,
} as const;

export const RECENTLY_WORN_DAYS = 3;
export const UNDERUSED_DAYS = 21;
export const MAX_RECOMMENDATIONS = 5;

export const STORAGE_BUCKETS = {
  clothingOriginals: 'clothing-originals',
  clothingProcessed: 'clothing-processed',
  mirrorOriginals: 'mirror-check-originals',
  mirrorProcessed: 'mirror-check-processed',
  receipts: 'receipts',
  exports: 'exports',
  virtualTryOn: 'virtual-try-on',
} as const;

export const CATEGORY_TO_DEFAULT_ROLE: Record<ClothingCategory, OutfitRole> = {
  top: 'top',
  bottom: 'bottom',
  one_piece: 'one_piece',
  outerwear: 'outerwear',
  shoes: 'shoes',
  accessory: 'other_accessory',
  specialty: 'other_accessory',
};
