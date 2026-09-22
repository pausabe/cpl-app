import {youtubeVideoId} from '../../src/ViewModels/Video';

test('l’id del vídeo, de qualsevol forma de l’enllaç', () => {
  // The one of the database
  expect(youtubeVideoId('https://youtu.be/futmD6C8ryw?si=HgMRIkriOm1jzMTS')).toBe('futmD6C8ryw');
  expect(youtubeVideoId('https://www.youtube.com/watch?v=abc123&t=10')).toBe('abc123');
  expect(youtubeVideoId('https://www.youtube.com/embed/xyz789?rel=0')).toBe('xyz789');
  expect(youtubeVideoId('https://www.youtube.com/v/qwe456')).toBe('qwe456');
});

test('sense vídeo: res', () => {
  for (const empty of ['', '-', undefined, null, 'https://vimeo.com/123']) {
    expect(youtubeVideoId(empty)).toBeNull();
  }
});
