import { latePrayerTexts, WHATS_NEW } from '../../src/view-models/notices';

test('the midnight notice says both days in words', () => {
  expect(latePrayerTexts(new Date(2026, 8, 22, 0, 30), new Date(2026, 8, 21))).toEqual({
    title: 'Ja estem a dimarts, 22 de setembre.',
    question: 'Vols la litúrgia d’ahir, dilluns 21 de setembre?',
    yes: { label: 'Sí, la d’ahir', date: 'Dilluns, 21 de setembre' },
    no: { label: 'No, la d’avui', date: 'Dimarts, 22 de setembre' },
  });
});

test('the what’s new notice', () => {
  expect(WHATS_NEW.title).toBe('Ara ho tens tot a l’inici');
  expect(WHATS_NEW.button).toBe('D’acord');
});
