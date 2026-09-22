import { latePrayerTexts, WHATS_NEW } from '../../src/ViewModels/Notices';

test('l’avís de mitjanit diu els dos dies en paraules', () => {
  expect(latePrayerTexts(new Date(2026, 8, 22, 0, 30), new Date(2026, 8, 21))).toEqual({
    title: 'Ja estem a dimarts, 22 de setembre.',
    question: 'Vols la litúrgia d’ahir, dilluns 21 de setembre?',
    yes: { label: 'Sí, la d’ahir', date: 'Dilluns, 21 de setembre' },
    no: { label: 'No, la d’avui', date: 'Dimarts, 22 de setembre' },
  });
});

test('l’avís de novetats', () => {
  expect(WHATS_NEW.title).toBe('Ara ho tens tot a l’inici');
  expect(WHATS_NEW.button).toBe('D’acord');
});
