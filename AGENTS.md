# Instructions for agents

Rules from Pau for anyone (person or agent) working on cpl-app.

## Verifying changes

- Verify with Jest (`make tests`, or `make tests-fast` while iterating).
- Do not run the app on a simulator, emulator or phone, and do not run Maestro flows, to verify a change unless Pau explicitly authorizes it for that change. Ask first. Pau tests the app on his iPhone himself.
- This includes building the app for a simulator or emulator only to check something on it.

## Language

- Everything in the code is in English: identifiers, comments, test names, commit messages and branch names.
- Only what users read stays in Catalan: the text of the app, its accessibility labels and the liturgical texts.

## Every change goes into the master ledger

**[REGISTRE-DE-CANVIS.md](REGISTRE-DE-CANVIS.md) is updated always, in the same turn as the fix,
before the work is called done.** Do not wait for Pau to ask: if you have corrected something in
cpl-app, in saints-app, in litcal or in the migration tooling, the entry goes in. The file itself
explains what each card has to carry.

Why: Pau has to be able to **justify** each change to the client and to **reapply** the ones to the
database, which are lost every time `cpl-app.db` is downloaded again. A fix with no ledger entry is
a fix nobody will know the origin of in three months.

## The database is not in git

`src/assets/db/cpl-app.db` is gitignored and comes from the publishing website (`make db`). When an
error is one of data:

- The database is modified directly, but the record of the change is a **committed**
  `db-fixes/CPL-LIT-NNN.sql`, filtering on the wrong state and not on the row `id` (idempotent and
  independent of the version).
- Back it up before touching it: there is no undo.
- In the `.sql` header, the `_tables_log` count and the sha256 before and after. **Never add rows to
  `_tables_log`**: the CPL wiki uses its count to compare against the published version.
- The regression test is the **detector**: it has to fail against a database without the patch.

## The errors of cpl-app are numbered

`CPL-LIT-NNN`, with three pieces in a single commit —fix, regression test and dossier in
`migration-to-saints/cpl-bugs/`— and the block of `Cpl-Bug:` trailers at the end of the message. The
ones in our own tooling go to `migration-to-saints/tooling-bugs/` and are not reported to the client.

## Traps

- **One door into cpl-app's engine: `src/liturgy-export`.** Nothing under `migration-to-saints/`
  reaches into `src/services` or `src/models` by hand any more, and nothing should start again:
  eslint ignores that folder and plain JS is invisible to `make types`, so a renamed field there
  reads `undefined` instead of failing (MIGRA-012). Add to the typed module and come through the
  door.
- **A `CPL-LIT` fix of code is not safe just because it is in git.** The refactor on `master`
  dropped the Ash Wednesday routing of CPL-LIT-001 and nobody noticed for two weeks
  (CPL-LIT-001b). The three detectors —`AshWednesdayLaudesPsalmody`,
  `ImmaculateConceptionTransfer`, `Psalm66PointingMark`— are the only net there is, so a red
  `make tests` is never something to work around.
- **A freshly downloaded database has no data fix in it.** `make db` and `make db-latest` bring
  the published one. Since 29 September 2026 the two `db-fixes/*.sql` stay off the database in
  place until the end of the migration (Pau's call: master's goldens are recorded against the
  published one, and `make proposal` takes its texts from it). The migration runs on a copy with
  both: `make db-fixed`, then `CPL_DB=migration-to-saints/output/cpl-app.fixed.db` for the join,
  the review or the panel. `make checks` and `make tests` run the two data detectors on that copy
  (they build it), and everything else on the database in place. The recipe to put them on for
  good is in
  [REGISTRE-DE-CANVIS.md](REGISTRE-DE-CANVIS.md#el-que-sha-de-reaplicar-sobre-una-base-de-dades-acabada-de-baixar).
