import type { Href } from 'expo-router';

export function learnCategoryHref(slug: string): Href {
  return `/learn/${slug}` as Href;
}

export function learnVideoHref(videoId: string): Href {
  return `/learn/video/${videoId}` as Href;
}

export function learnSavedHref(): Href {
  return '/learn/saved' as Href;
}
