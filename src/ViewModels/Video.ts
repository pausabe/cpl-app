// The YouTube video of a Gospel in sign language: its id, from any of the forms of the link that
// the database may have (youtu.be/…, watch?v=…, embed/…, v/…, with or without ?si=…). What
// MassLiturgyPrayerScreen.getYoutubeVideoId did.
export function youtubeVideoId(url: unknown): string | null {
  if (typeof url !== 'string' || !url || url === '-') return null;

  // Remove any tracking parameters (like si=...)
  const cleanUrl = url.split('?')[0] + (url.includes('?v=') ? '?v=' + url.split('?v=')[1].split('&')[0] : '');

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtube\.com\/embed\/)([^?&]+)/,
    /(?:youtu\.be\/)([^?&]+)/,
    /(?:youtube\.com\/v\/)([^?&]+)/,
  ];
  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      // Clean the video ID from any remaining parameters
      return match[1].split('?')[0].split('&')[0];
    }
  }
  return null;
}
