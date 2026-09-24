# The store listings

What the App Store and Google Play show about the app. The texts live here so that a change to
them is reviewed like any other change, and not typed straight into a console where nobody sees
it again.

**In Catalan, and only in Catalan.** The app is in Catalan: a listing in Spanish would put it in
front of people searching in Spanish, who would install it, find they cannot read it, and say so
in the ratings. Both stores show the listing of the main language wherever there is no other, so
nobody is left without one — they get the Catalan one, which is the plainest possible warning
about what the app is. Apple's review does not ask for English either; if a reviewer ever needs
something explained, that goes in the notes for the reviewer, which are not part of the listing.

| File | App Store | Google Play | Limit |
| --- | --- | --- | --- |
| `name.txt` | Name | Title | 30 |
| `subtitle.txt` | Subtitle | — | 30 |
| `short-description.txt` | — | Short description | 80 |
| `keywords.txt` | Keywords | — | 100 |
| `promotional.txt` | Promotional text | — | 170 |
| `description.txt` | Description | Full description | 4 000 |
| `release-notes.txt` | What's New | What's new | 4 000 |

Apple counts characters, not bytes: `wc -c` on a file with accents reads more than the limit and
still fits.

## The name

The name of the listing and the name under the icon on the phone are not the same field, and the
listing one is the only one that changes:

- **Under the icon: `CPL`.** It is `name` in `app.json`, three letters, and it is not touched.
- **In both stores: `CPL – Litúrgia de les Hores`.** A listing name has to be unique across the
  whole App Store, which is why «CPL» on its own was refused years ago and the app ended up
  called «LitCat CPL»; with the rest of the name behind it, it is unique. The dash is an en
  dash (–).

  The cost of putting the publisher first is that a name is cut short in the search results, and
  what gets cut is the end — the words people actually typed. It is the CPL's name and their
  decision.

## Catalan as the primary language

The App Store listing is set to English: the description was written in Catalan inside an English
listing, so the app is indexed as an English app and finds nobody searching in Catalan. Google
Play is already Catalan.

The primary language is changed in App Store Connect, in App Information, and it can only be
changed while there is a version that has not been released yet — so it goes with the 9.0.0
submission, in this order:

1. Add the Catalan localization with these texts.
2. Change the primary language to Catalan.
3. Remove the English localization once Catalan is the primary one. It says the same as the
   Catalan one to someone who will not be able to read the app anyway.

## The keywords

Apple indexes the name and the subtitle as well, so a word that is already in either of them is
wasted in `keywords.txt`. That is why the list has no «litúrgia», «hores», «laudes», «vespres»
or «lectures»: they are all in the name or the subtitle already.

Google Play has no keyword field. It reads the title, the short description and the full
description, which is why the full description says the ordinary words for the thing («ofici
diví», «breviari») and not only the title of the book.

## The pictures

They are not here: they are 20 MB of PNG that is remade from the app itself. `make captures`
takes them and leaves them in `store/`, which is outside the repository. `.maestro/README.md`
explains it.

The icon is in the repository, because it is also the icon of the app:
`src/assets/icon/cplMark.svg` is the drawing and `scripts/makeIcons.mjs` makes every file from
it. Google Play wants the 512×512 one, which is `icon.png` scaled down.
