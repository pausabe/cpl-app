# Instructions for agents

Rules from Pau for anyone (person or agent) working on cpl-app.

## Verifying changes

- Verify with Jest (`make tests`, or `make tests-fast` while iterating).
- Do not run the app on a simulator, emulator or phone, and do not run Maestro flows, to verify a change unless Pau explicitly authorizes it for that change. Ask first. Pau tests the app on his iPhone himself.
- This includes building the app for a simulator or emulator only to check something on it.

## Language

- Everything in the code is in English: identifiers, comments, test names, commit messages and branch names.
- Only what users read stays in Catalan: the text of the app, its accessibility labels and the liturgical texts.
