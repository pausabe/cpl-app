"""Genera ca/invitatoryPsalms.json a partir del text català autèntic de cpl-app.db.

Els salms invitatoris viuen a la taula `diversos` de cpl-app en text pla amb
salts de línia. saints-app els vol en HTML amb <p> per estrofa i un
<small class="title-color"> entre estrofes indicant que es repeteix l'antífona.
"""

import json
import sqlite3

CPL_DB = "/Users/pau/projects/personal/cpl-app/src/Assets/db/cpl-app.db"
OUT = "/Users/pau/projects/saints/saints-app/src/store/db/generic_texts/ca/invitatoryPsalms.json"

# id a `diversos` -> (id a saints-app, títol català)
# L'ordre és el mateix que a es/invitatoryPsalms.json.
PSALMS = [
    (1, "psalm94", "Salm 94: Invitació a la lloança divina"),
    (35, "psalm99", "Salm 99: Alegria dels qui entren al temple"),
    (37, "psalm23", "Salm 23: Entrada solemne de Déu al seu temple"),
    (36, "psalm66", "Salm 66: Que tots els pobles lloïn el Senyor"),
]

ANTIPHON = '<small class="title-color">Es repeteix l\'antífona</small>'

DOXOLOGY = (
    "<p>Glòria al Pare i al Fill i a l'Esperit Sant.<br/>"
    "Com era al principi, ara i sempre,<br/>"
    "i pels segles dels segles. Amén.</p>"
)


def to_html(raw: str) -> str:
    """Text pla de cpl -> HTML de saints-app.

    Les estrofes van separades per una línia en blanc. Dins d'una estrofa,
    cada salt de línia és un <br/>. cpl té espais sobrants a final de línia.
    """
    stanzas = []
    for block in raw.replace("\r\n", "\n").split("\n\n"):
        lines = [line.strip() for line in block.split("\n") if line.strip()]
        if lines:
            stanzas.append("<p>" + "<br/>".join(lines) + "</p>")

    return ANTIPHON.join(stanzas) + ANTIPHON + DOXOLOGY


def main() -> None:
    conn = sqlite3.connect(CPL_DB)
    try:
        result = []
        for cpl_id, psalm_id, title in PSALMS:
            (raw,) = conn.execute(
                "SELECT oracio FROM diversos WHERE id = ?", (cpl_id,)
            ).fetchone()
            result.append({"id": psalm_id, "title": title, "psalm": to_html(raw)})
    finally:
        conn.close()

    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, indent=2)
        fh.write("\n")

    print(f"✅ {OUT}")
    for entry in result:
        print(f"   {entry['id']:8s} {len(entry['psalm']):5d} chars  {entry['title']}")


if __name__ == "__main__":
    main()
