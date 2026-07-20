export class AppError extends Error {
  code: string;
  recoverable: boolean;

  constructor(message: string, code = 'unknown', recoverable = true) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.recoverable = recoverable;
  }
}

export function toUserMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) {
    if (error.message.includes('Network')) {
      return 'Network unavailable. Your changes are saved as drafts when possible.';
    }
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export const ErrorCodes = {
  CAMERA_DENIED: 'camera_denied',
  PHOTO_DENIED: 'photo_denied',
  LOCATION_DENIED: 'location_denied',
  UPLOAD_FAILED: 'upload_failed',
  AI_FAILED: 'ai_failed',
  AI_INVALID_JSON: 'ai_invalid_json',
  WEATHER_UNAVAILABLE: 'weather_unavailable',
  RECOMMENDATION_FAILED: 'recommendation_failed',
  NO_CLEAN_CLOTHES: 'no_clean_clothes',
  NETWORK: 'network',
  IMAGE_TOO_LARGE: 'image_too_large',
  UNSUPPORTED_IMAGE: 'unsupported_image',
  MIRROR_UNUSABLE: 'mirror_unusable',
  SESSION_EXPIRED: 'session_expired',
  STORAGE_QUOTA: 'storage_quota',
} as const;
