import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1, 'Display name is required').max(60),
});

export const profileOnboardingSchema = z.object({
  display_name: z.string().min(1).max(60),
  location_name: z.string().optional(),
  timezone: z.string().min(1),
  preferred_temperature_unit: z.enum(['f', 'c']),
});

export const clothingItemFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  description: z.string().optional(),
  category: z.enum(['top', 'bottom', 'one_piece', 'outerwear', 'shoes', 'accessory', 'specialty']),
  subcategory: z.string().min(1),
  primary_color: z.string().min(1),
  secondary_colors: z.array(z.string()).default([]),
  pattern: z.string().optional(),
  material: z.string().optional(),
  brand: z.string().optional(),
  size: z.string().optional(),
  fit: z.string().optional(),
  style_tags: z.array(z.string()).default([]),
  season_tags: z.array(z.string()).default([]),
  occasion_tags: z.array(z.string()).default([]),
  warmth_score: z.number().int().min(1).max(5),
  formality_score: z.number().int().min(1).max(5),
  availability_status: z.string().default('available'),
  favorite: z.boolean().default(false),
  price_paid: z.number().nonnegative().optional().nullable(),
  notes: z.string().optional(),
});

export const outfitFormSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().optional(),
  occasion: z.string().optional(),
  status: z.enum(['draft', 'saved', 'planned', 'worn', 'rejected', 'archived']).default('saved'),
  favorite: z.boolean().default(false),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ClothingItemFormInput = z.infer<typeof clothingItemFormSchema>;
