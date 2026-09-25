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

- **Do not use `migration-to-saints/cpl-day.test.js`**: its ferial control for Vespers is still
  broken (see MIGRA-001) and invents divergences on every memorial. To resolve days, use
  `migration-to-saints/review/resolve-cpl-days.test.js`.
