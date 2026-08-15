-- CPL-LIT-002 — La Immaculada no es trasllada quan el 8 de desembre cau en diumenge d'Advent
-- Dossier: migration-to-saints/cpl-bugs/CPL-LIT-002.md
--
-- Base de dades sobre la qual s'ha aplicat:
--   src/Assets/db/cpl-app.db
--   _tables_log = 12528 registres (últim: 2025-10-29 09:04:47)
--   sha256 abans = 6eed8fe86eb5ae8f7029e6b864625a2b092feef7237e63993ec6c2b65a9f2870
--
-- Files afectades en aquesta base (anyliturgic.id):
--   1072 = 2019-12-08    1073 = 2019-12-09
--   2899 = 2024-12-08    2900 = 2024-12-09
--
-- Els WHERE no fan servir els id sinó l'estat incorrecte, per dues raons: els id poden
-- canviar en una base baixada de nou, i així les sentències són idempotents — un cop
-- aplicades ja no tornen a coincidir amb res. Si te'n baixes una de nova, executa aquest
-- fitxer tal qual: corregirà els anys que calgui (inclòs el 2030, quan hi sigui) i no farà
-- res si CPL ja ho ha arreglat a origen.
--
-- L'ORDRE IMPORTA: la segona sentència es guarda mirant que el dia 8 encara sigui el
-- diumenge sense corregir, així que ha d'anar abans que la tercera.

-- 1) Comprovació: quins anys estan malament. Hauria de tornar 2019 i 2024.
SELECT any AS 'anys a corregir'
FROM anyliturgic
WHERE mes = '12' AND dia = '8'
  AND DiadelaSetmana = 'Dg' AND tempsespecific = 'Advent'
  AND BaD = 'S';

-- 2) El dia 9 rep la solemnitat, marcada com a moguda des del 08-dic.
--    Abans: Color='M', rangs='L' (St Joan Dídac, memòria lliure), Mogut/diaMogut/diocesiMogut='-'
--    Després: Color='B', rangs='S', diaMogut='08-dic' amb diocesiMogut='*' (totes les diòcesis).
--    Els textos propis no es toquen: ja viuen sota la clau '08-dic' a santsSolemnitats, i
--    DatabaseDataHelper.GetDateShortDatabaseCode() els va a buscar per diaMogut.
--    Menorca (MeD/MeV/MeC) es queda a '-': ja ho estava els dos dies.
UPDATE anyliturgic
SET Color = 'B',
    Mogut = '08-dic', diaMogut = '08-dic', diocesiMogut = '*',
    BaD = 'S', BaV = 'S', BaC = 'S',
    GiD = 'S', GiV = 'S', GiC = 'S',
    LlD = 'S', LlV = 'S', LlC = 'S',
    SFD = 'S', SFV = 'S', SFC = 'S',
    SoD = 'S', SoV = 'S', SoC = 'S',
    TaD = 'S', TaV = 'S', TaC = 'S',
    TeD = 'S', TeV = 'S', TeC = 'S',
    ToD = 'S', ToV = 'S', ToC = 'S',
    UrD = 'S', UrV = 'S', UrC = 'S',
    ViD = 'S', ViV = 'S', ViC = 'S',
    Andorra = 'S',
    MaD = 'S', MaV = 'S', MaC = 'S'
WHERE mes = '12' AND dia = '9'
  AND diaMogut = '-'
  AND any IN (SELECT any FROM anyliturgic
              WHERE mes = '12' AND dia = '8'
                AND DiadelaSetmana = 'Dg' AND tempsespecific = 'Advent'
                AND BaD = 'S');

-- 3) El dia 8 deixa de ser solemnitat: hi queda el diumenge II d'Advent, que té precedència.
--    Abans: Color='B', rangs='S'. Després: Color='M' (morat d'Advent), rangs='-'.
--    Queda igual que qualsevol altre diumenge II d'Advent (p. ex. 2023-12-10, id 2540).
UPDATE anyliturgic
SET Color = 'M',
    BaD = '-', BaV = '-', BaC = '-',
    GiD = '-', GiV = '-', GiC = '-',
    LlD = '-', LlV = '-', LlC = '-',
    SFD = '-', SFV = '-', SFC = '-',
    SoD = '-', SoV = '-', SoC = '-',
    TaD = '-', TaV = '-', TaC = '-',
    TeD = '-', TeV = '-', TeC = '-',
    ToD = '-', ToV = '-', ToC = '-',
    UrD = '-', UrV = '-', UrC = '-',
    ViD = '-', ViV = '-', ViC = '-',
    Andorra = '-',
    MaD = '-', MaV = '-', MaC = '-'
WHERE mes = '12' AND dia = '8'
  AND DiadelaSetmana = 'Dg' AND tempsespecific = 'Advent'
  AND BaD = 'S';

-- 4) Verificació. Hauria de tornar, per al 2019 i el 2024:
--      08 Dg  Color=M  rang=-  diaMogut=-
--      09 Dl  Color=B  rang=S  diaMogut=08-dic
SELECT any, dia, DiadelaSetmana, Color, BaD, diaMogut, diocesiMogut
FROM anyliturgic
WHERE mes = '12' AND dia IN ('8', '9') AND any IN ('2019', '2024')
ORDER BY any, CAST(dia AS INTEGER);
