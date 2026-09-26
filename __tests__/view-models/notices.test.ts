import { dioceseOfferTexts, latePrayerTexts, LOCATION_NOTICES, WHATS_NEW } from '../../src/view-models/notices';

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

test('the offer of the diocese asks a newcomer and tells somebody who already had one', () => {
  expect(dioceseOfferTexts('Barcelona', false).title).toBe('De quina diòcesi ets?');
  expect(dioceseOfferTexts('Barcelona', true).title).toBe('Estàs resant amb la diòcesi de Barcelona');
  expect(dioceseOfferTexts('Vic', true).title).toBe('Estàs resant amb la diòcesi de Vic');
  expect(dioceseOfferTexts('Vic', true).find).toBe('Fes servir la meva ubicació');
  expect(dioceseOfferTexts('Vic', true).choose).toBe('La trio jo');
  // What depends on the diocese is its own celebrations, not the whole calendar nor only saints
  expect(dioceseOfferTexts('Vic', false).body).toMatch(/^Cada diòcesi té les seves celebracions pròpies\./);
  expect(dioceseOfferTexts('Vic', true).body).toMatch(/Les celebracions pròpies en depenen\.$/);
});

test('nothing is said when the diocese has just been found, and the reason is when it has not', () => {
  expect(LOCATION_NOTICES.idle).toBeNull();
  expect(LOCATION_NOTICES.locating).toBeNull();
  expect(LOCATION_NOTICES.denied).toMatch(/permís d’ubicació/);
  expect(LOCATION_NOTICES.nowhere).toMatch(/Tria-la tu mateix/);
  expect(LOCATION_NOTICES.failed).toMatch(/Torna-ho a provar/);
});
