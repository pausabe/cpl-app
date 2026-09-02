-- CPL-LIT-003 — Al Salm 66 li falta l'asterisc de mediació a l'últim vers, fora de Laudes
-- Dossier: migration-to-saints/cpl-bugs/CPL-LIT-003.md
--
-- Base de dades sobre la qual s'ha aplicat:
--   src/Assets/db/cpl-app.db
--   _tables_log = 12528 registres (últim: 2025-10-29 09:04:47)
--   sha256 abans = fda347356f6d5384cd84883b7e719f0104bc962bedcba094bb195a4a28332c13
--   sha256 despres = 38842ab0ef9333496e71302627990d04c42a7d9610f06e07cedfcbed850ef410
--   (aquest sha256 ja porta CPL-LIT-002.sql aplicat; el de CPL amb el _tables_log
--    intacte era 6eed8fe8…, vegeu la capçalera de CPL-LIT-002.sql)
--
-- Files afectades en aquesta base:
--   salteriComuVespres.id = 12   columna salm2       (2n salm de Vespres, dimecres setmana II)
--   santsMemories.id      = 377  columna Salm2Ofici  (Témpores d'acció de gràcies, 05-oct,
--                                                     2n salm de l'Ofici de lectura)
--
-- El vers és el mateix a totes dues: "La terra ha donat el seu fruit," ha de dur la marca
-- de mediació abans de "el Senyor, el nostre Déu, ens beneeix." La còpia de Laudes
-- (salteriComuLaudes.id = 17, columna salm3) sí que la duu, amb quatre espais al davant.
--
-- NO es toquen les còpies SENSE puntuació — LDdiumenges/102 i /482, LDSantoral/45 i
-- diversos/36 — que no tenen cap `*` enlloc perquè són el salm responsorial de la missa
-- (amb "R.") i no la salmòdia de l'ofici. Per això les sentències van per taula i columna,
-- no per un LIKE global.
--
-- Els WHERE no fan servir els id sinó l'estat incorrecte: els id poden canviar en una base
-- baixada de nou, i així les sentències són idempotents — un cop la marca hi és, el patró
-- "fruit," + salt de línia ja no coincideix amb res. Si te'n baixes una de nova, executa
-- aquest fitxer tal qual: no farà res si CPL ja ho ha arreglat a origen.

-- 1) Comprovació prèvia: quines còpies puntuades del Salm 66 tenen el vers sense marca.
--    Hauria de tornar dues files, salteriComuVespres/12 i santsMemories/377.
SELECT 'salteriComuVespres' AS taula, id, 'salm2' AS columna
FROM salteriComuVespres
WHERE salm2 LIKE '%' || char(10) || 'La terra ha donat el seu fruit,' || char(10) || '%'
  AND salm2 LIKE '%*%'
UNION ALL
SELECT 'santsMemories', id, 'Salm2Ofici'
FROM santsMemories
WHERE Salm2Ofici LIKE '%' || char(10) || 'La terra ha donat el seu fruit,' || char(10) || '%'
  AND Salm2Ofici LIKE '%*%';

-- 2) Vespres del dimecres de la setmana II del salteri. És la còpia que resa l'app 63 dies
--    del manifest 2017-2026, i la que partia en dos la casella salmos_textos/144 d'eprex.
UPDATE salteriComuVespres
SET salm2 = replace(
      salm2,
      char(10) || 'La terra ha donat el seu fruit,' || char(10),
      char(10) || 'La terra ha donat el seu fruit,    *' || char(10))
WHERE salm2 LIKE '%' || char(10) || 'La terra ha donat el seu fruit,' || char(10) || '%'
  AND salm2 LIKE '%*%';

-- 3) La mateixa falta a l'Ofici de lectura de les Témpores d'acció de gràcies (05-oct).
UPDATE santsMemories
SET Salm2Ofici = replace(
      Salm2Ofici,
      char(10) || 'La terra ha donat el seu fruit,' || char(10),
      char(10) || 'La terra ha donat el seu fruit,    *' || char(10))
WHERE Salm2Ofici LIKE '%' || char(10) || 'La terra ha donat el seu fruit,' || char(10) || '%'
  AND Salm2Ofici LIKE '%*%';

-- 4) Verificació. La consulta 1 ha de tornar zero files, i aquesta ha de tornar 3:
--      salteriComuLaudes/17, salteriComuVespres/12 i santsMemories/377,
--    les tres còpies puntuades, totes amb la marca.
SELECT 'salteriComuLaudes' AS taula, id, 'salm3' AS columna
FROM salteriComuLaudes
WHERE salm3 LIKE '%La terra ha donat el seu fruit,    *%'
UNION ALL
SELECT 'salteriComuVespres', id, 'salm2'
FROM salteriComuVespres
WHERE salm2 LIKE '%La terra ha donat el seu fruit,    *%'
UNION ALL
SELECT 'santsMemories', id, 'Salm2Ofici'
FROM santsMemories
WHERE Salm2Ofici LIKE '%La terra ha donat el seu fruit,    *%';
