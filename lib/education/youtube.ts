export function youtubeThumbnail(youtubeId: string, quality: 'hq' | 'max' = 'hq'): string {
  const file = quality === 'max' ? 'maxresdefault.jpg' : 'hqdefault.jpg';
  return `https://img.youtube.com/vi/${youtubeId}/${file}`;
}
