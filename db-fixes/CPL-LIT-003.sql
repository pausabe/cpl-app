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

-- 5) Treure les dues files que els disparadors acaben d'escriure a `_tables_log`.
--
--    `salteriComuVespres` i `santsMemories` duen un `log_update_*` que hi insereix una fila per
--    cada UPDATE, i el recompte de `_tables_log` és el que la wiki del CPL compara amb la versió
--    publicada: si creix, el pedaç es delata i sembla que la base no és la que diu que és. El
--    `anyliturgic` del CPL-LIT-002 no té disparador i per això aquell fitxer no necessita res.
--
--    Es filtra per data i per fila —no per id— perquè sigui idempotent: en una base baixada de nou
--    els id són altres, i si les sentències 2 i 3 no han canviat res, aquí no hi ha res a treure.
--    El `sqlite_sequence` es torna enrere també, o el proper registre de debò salta dos números.
DELETE FROM _tables_log
WHERE date = (SELECT MAX(date) FROM _tables_log)
  AND action = 2
  AND (
    (table_name = 'salteriComuVespres'
     AND row_id IN (SELECT id FROM salteriComuVespres WHERE salm2 LIKE '%La terra ha donat el seu fruit,    *%'))
    OR (table_name = 'santsMemories'
        AND row_id IN (SELECT id FROM santsMemories WHERE Salm2Ofici LIKE '%La terra ha donat el seu fruit,    *%'))
  );

UPDATE sqlite_sequence
SET seq = (SELECT MAX(id) FROM _tables_log)
WHERE name = '_tables_log';

-- 6) El recompte, que ha de ser el mateix que abans d'executar tot això.
SELECT COUNT(*) AS tables_log FROM _tables_log;
