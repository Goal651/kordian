export const STORAGE_KEYS = {
  INSTALLATION: "github_app_installation",
  INSTALLATIONS: "github_app_installations",
  USER_TOKEN: "github_user_token",
  CACHE: "github_app_cache"
};

export const CACHE_DURATION = 15 * 60 * 1000;

export const GITHUB_CONFIG = {
  APP_NAME: "kordian",
  CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "",
  REDIRECT_URI: typeof window !== 'undefined'
    ? `${window.location.origin}/api/auth/callback`
    : '',
  SCOPE: "read:org read:user read:project"
};

export const CACHE_KEY = "github_app_cache";
