"""Munta ca/literals.json a partir d'es/literals.json + les traduccions catalanes.

Estratègia: cap clau pot faltar, perquè textsRepository no té fallback d'idioma i
una clau absent es veu com a "no trobat". Les claus encara sense traduir es queden
amb el valor castellà i surten llistades a l'informe de pendents.
"""

import glob
import json
import os
import sqlite3

# SAINTS_APP apunta a una altra còpia de saints-app (un worktree, per exemple)
SAINTS_APP = os.environ.get("SAINTS_APP", "/Users/pau/projects/saints/saints-app")
BASE = f"{SAINTS_APP}/src/store/db/generic_texts"
SCRATCH = os.path.dirname(os.path.abspath(__file__))
CPL_DB = "/Users/pau/projects/personal/cpl-app/src/Assets/db/cpl-app.db"

# Els calendaris catalans (Catalunya, les diòcesis i Andorra, i les seves ciutats i catedrals)
# no existeixen a es/: són de l'edició catalana. Són les claus `calendar_*` de ca-literals.json que
# no hi ha a es/, i s'insereixen, en el mateix ordre, just després de calendar_venezuela per mantenir
# agrupats els calendaris.
NEW_AFTER = "calendar_venezuela"


def catalan_our_father() -> str:
    """El Parenostre per a TTS surt del text oficial català de cpl-app, no traduït."""
    conn = sqlite3.connect(CPL_DB)
    try:
        (raw,) = conn.execute("SELECT oracio FROM diversos WHERE id = 5").fetchone()
    finally:
        conn.close()
    return " ".join(line.strip() for line in raw.split("\n") if line.strip())


def main() -> None:
    with open(f"{BASE}/es/literals.json", encoding="utf-8") as fh:
        es = json.load(fh)
    with open(f"{SCRATCH}/ca-literals.json", encoding="utf-8") as fh:
        ca = json.load(fh)

    # Blocs niuats, expressats amb ruta amb punts (`bloc.subbloc.clau`). Cada
    # `ca-literals-ui*.json` és un lot de traducció independent; es mergen tots.
    ca_ui: dict[str, str] = {}
    for path in sorted(glob.glob(f"{SCRATCH}/ca-literals-ui*.json")):
        with open(path, encoding="utf-8") as fh:
            ca_ui.update(json.load(fh))

    ca["ttsFullOurFather"] = catalan_our_father()

    pending: list[str] = []
    out: dict[str, object] = {}

    def resolve(key: str, es_val, ca_val):
        """Retorna el valor final i apunta els pendents (ruta completa de la clau)."""
        if isinstance(es_val, dict):
            merged = {}
            for sub_key, sub_es in es_val.items():
                sub_ca = ca_val.get(sub_key) if isinstance(ca_val, dict) else None
                merged[sub_key] = resolve(f"{key}.{sub_key}", sub_es, sub_ca)
            return merged

        if ca_val is None:
            ca_val = ca_ui.get(key)
        if ca_val is None:
            pending.append(key)
            return es_val
        return ca_val

    new_calendar_keys = [key for key in ca if key.startswith("calendar_") and key not in es]

    for key, es_val in es.items():
        out[key] = resolve(key, es_val, ca.get(key))
        if key == NEW_AFTER:
            for new_key in new_calendar_keys:
                out[new_key] = ca[new_key]

    # Qualsevol clau catalana que no existeixi a es/ (per si se n'afegeix alguna més).
    for key, value in ca.items():
        if key not in out:
            out[key] = value

    with open(f"{BASE}/ca/literals.json", "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=2)
        fh.write("\n")

    with open(f"{SCRATCH}/pending-literals.json", "w", encoding="utf-8") as fh:
        json.dump(pending, fh, ensure_ascii=False, indent=2)

    def count_leaves(d) -> int:
        return sum(
            count_leaves(v) if isinstance(v, dict) else 1 for v in d.values()
        )

    total = count_leaves(out)
    print(f"✅ ca/literals.json  ({len(out)} claus de primer nivell, {total} fulles)")
    print(f"   traduïdes:          {total - len(pending)}")
    print(f"   en castellà encara: {len(pending)}")

    blocks: dict[str, int] = {}
    for key in pending:
        blocks[key.split(".")[0]] = blocks.get(key.split(".")[0], 0) + 1
    for block, count in sorted(blocks.items(), key=lambda kv: -kv[1]):
        print(f"     · {block:28s} {count:4d} fulles")


if __name__ == "__main__":
    main()
