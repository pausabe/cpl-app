"""Munta ca/prayers.json.

Tres orígens per al cos de cada oració, per ordre de fiabilitat:
  1. CPL_BODIES  -> text català oficial extret de cpl-app.db (taula `diversos`)
  2. INLINE_BODIES -> text litúrgic català canònic (Glòria, Credos, Ave Maria)
  3. cap dels dos -> es queda el cos castellà i surt a l'informe de pendents

Títols i `info` es tradueixen tots: són el que es veu a l'índex del devocionari
i el que indexa el cercador, així que han d'estar en català encara que el cos no ho estigui.
"""

import json
import os
import sqlite3

BASE = "/Users/pau/projects/saints/saints-app/src/store/db/generic_texts"
SCRATCH = os.path.dirname(os.path.abspath(__file__))
CPL_DB = "/Users/pau/projects/personal/cpl-app/src/Assets/db/cpl-app.db"

# id a prayers.json -> id a la taula `diversos` de cpl-app
CPL_BODIES = {
    1: 5,     # Parenostre
    10: 4,    # Benedictus / Càntic de Zacaries
    11: 6,    # Magnificat / Càntic de Maria
    12: 23,   # Nunc Dimittis / Càntic de Simeó
    20: 3,    # Te Deum ("Oh Déu, us lloem")
    502: 29,  # Salve Regina
    503: 25,  # Alma Redemptoris Mater
    504: 27,  # Ave Regina Caelorum
    505: 31,  # Sub tuum praesidium
    508: 33,  # Regina Caeli
}

TITLES = {
    1: "Parenostre", 3: "Glòria a Déu", 5: "Credo dels Apòstols",
    6: "Credo nicenoconstantinopolità", 10: "Benedictus", 11: "Magníficat",
    12: "Nunc Dimittis", 20: "Te Deum", 22: "Xemà Israel",
    23: "Oració Universal", 25: "De profundis", 205: "Ànima de Crist",
    210: "Cor de Jesús", 220: "Lletanies de la humilitat",
    225: "Davant Crist crucificat", 240: "15 minuts amb Jesús",
    301: "Pange Lingua", 305: "Adoro te devote", 310: "Comunió espiritual",
    312: "Als vostres peus", 330: "Oració d'Abandó", 335: "Adoració Eucarística",
    402: "Veni Creator", 404: "Seqüència de Pentecosta", 406: "Del Papa Lleó XIV",
    408: "Del Cardenal Verdier", 420: "És pacient", 501: "Ave Maria",
    502: "La Salve", 503: "Mare del Redemptor", 504: "Salve Reina",
    505: "Sota la vostra protecció", 506: "Recordeu-vos - Memorare",
    508: "Regina Coeli", 510: "Stabat Mater", 520: "La vostra puresa",
    530: "Mare Santíssima", 540: "M'ofereixo", 560: "Theotokos - Mare de Déu",
    601: "Examen de consciència", 605: "Abans de la confessió",
    610: "Després de la confessió", 615: "Abans de la Santa Missa",
    620: "Després de la Santa Missa", 710: "A sant Josep",
    712: "Set diumenges de sant Josep", 740: "A sant Miquel Arcàngel",
    741: "A sant Rafael Arcàngel", 745: "A sant Joan Bosco",
    750: "Sant Joan de la Creu", 755: "Sant Francesc d'Assís",
    760: "Santa Teresa de Jesús", 765: "Sant Agustí d'Hipona",
    770: "Sant Ignasi de Loiola", 795: "Santa Brígida", 802: "Per la pau",
    804: "Per un fill", 806: "Per les famílies", 808: "Pel jovent",
    810: "Pels malalts", 812: "Per un difunt", 815: "Pels preveres",
    816: "Per les vocacions", 817: "Pels esposos", 818: "Pels promesos",
    820: "Oferiment del dia", 825: "Benedicció de la taula",
    828: "Àngel de la Guarda", 850: "En una peregrinació",
    855: "Per als estudiants", 901: "Abans de confessar",
    902: "Després de confessar", 903: "Abans de la santa Missa",
    904: "Després de la santa Missa", 920: "Beneïdor abreujat", 930: "Malalts",
}

INFO = {
    1: "Mt 6, 9–13  ;  Lc 11, 2–4",
    10: "Càntic de Zacaries. Lc 1, 68–79",
    11: "Lc 1, 46–55",
    12: "Lc 2, 29–32",
    22: "Dt 6, 4-9; Mt 22, 37–40; Mc 12, 29–31; Lc 10, 27",
    23: "Atribuïda al Papa Climent XI",
    25: "Salm 129. Salm penitencial.",
    205: "Del Papa Joan XXII (no confirmat)",
    220: "Del Cardenal Merry del Val",
    240: "Aquesta devoció està pensada per a qui només té una estona lliure i vol obrir el seu cor al Santíssim Sagrament, vivint un moment d'intimitat amb Crist. Basada en la tradició de l'adoració eucarística de l'Església, t'invita a reconèixer la presència real de Jesús entre els homes, a donar gràcies per la salvació que ens porta i a deixar que el seu amor transformi el dia a dia. Només cal un espai tranquil i el desig d'estar amb Ell.",
    305: "De sant Tomàs d'Aquino (s. XIII)",
    310: "De sant Alfons Maria de Liguori (s. XVIII)",
    312: "Del Cardenal Rafael Merry del Val (s. XX)",
    330: "De Charles de Foucauld (s. XX)",
    406: "De la carta apostòlica \"In unitate fidei\", 2025",
    420: "Kiko Argüello, 2018.",
    506: "De sant Bernat de Claravall (s. XII)",
    740: "Del Papa Lleó XIII, 1884, inspirada en una visió sobre la batalla entre el bé i el mal",
    745: "Patró del jovent",
    750: "Poeta místic (s. XVI)",
    795: "Les quinze oracions",
    808: "De sant Joan Pau II (1985)",
    810: "Del Pare Emiliano Tardif (1980)",
    815: "De sant Joan Maria Vianney, rector d'Ars",
    818: "Oració dels promesos a la Verge Maria",
    850: "En començar una etapa d'una peregrinació",
    855: "A sant Josep de Cupertino per ajudar en exàmens i estudis",
    901: "Font: www.clerus.org",
    902: "Font: www.penitenzieria.va",
    903: "Font: Missale Romanum, 2008",
    904: "Font: Missale Romanum, 2008",
    920: "Ritual de les principals benediccions",
    930: "Litúrgies amb malalts per a preveres i diaques",
}

INLINE_BODIES = {
    3: (
        "Glòria a Déu a dalt del cel,<br>i a la terra pau als homes que estima el Senyor.<br><br>"
        "Us lloem,<br>us beneïm,<br>us adorem,<br>us glorifiquem,<br>us donem gràcies<br>"
        "per la vostra immensa glòria,<br>Senyor Déu, Rei celestial,<br>Déu Pare omnipotent.<br><br>"
        "Senyor, Fill unigènit, Jesucrist,<br>Senyor Déu, Anyell de Déu, Fill del Pare,<br>"
        "vós que lleveu el pecat del món,<br>tingueu pietat de nosaltres;<br>"
        "vós que lleveu el pecat del món,<br>acolliu la nostra súplica;<br>"
        "vós que seieu a la dreta del Pare,<br>tingueu pietat de nosaltres.<br><br>"
        "Perquè vós sou l'únic Sant,<br>vós l'únic Senyor,<br>vós l'únic Altíssim, Jesucrist,<br>"
        "amb l'Esperit Sant,<br>en la glòria de Déu Pare. Amén."
    ),
    5: (
        "Crec en un Déu,<br>Pare totpoderós,<br>creador del cel i de la terra.<br><br>"
        "I en Jesucrist, únic Fill seu i Senyor nostre;<br>"
        "el qual fou concebut per obra de l'Esperit Sant,<br>nasqué de Maria Verge;<br>"
        "patí sota el poder de Ponç Pilat,<br>fou crucificat, mort i sepultat;<br>"
        "davallà als inferns,<br>ressuscità el tercer dia d'entre els morts;<br>"
        "se'n pujà al cel,<br>seu a la dreta de Déu Pare totpoderós;<br>"
        "i d'allí ha de venir a judicar els vius i els morts.<br><br>"
        "Crec en l'Esperit Sant;<br>la santa Mare Església catòlica;<br>"
        "la comunió dels sants;<br>la remissió dels pecats;<br>"
        "la resurrecció de la carn;<br>la vida perdurable. Amén."
    ),
    6: (
        "Crec en un sol Déu,<br>Pare totpoderós,<br>creador del cel i de la terra,<br>"
        "de totes les coses visibles i invisibles.<br><br>"
        "I en un sol Senyor, Jesucrist,<br>Fill Unigènit de Déu,<br>"
        "nascut del Pare abans de tots els segles.<br>Déu nat de Déu,<br>"
        "Llum resplendor de la Llum,<br>Déu veritable nascut del Déu veritable,<br>"
        "engendrat, no pas creat,<br>de la mateixa naturalesa del Pare:<br>"
        "per ell tota cosa fou creada.<br>El qual per nosaltres, els homes,<br>"
        "i per la nostra salvació<br>davallà del cel.<br>"
        "I, per obra de l'Esperit Sant,<br>s'encarnà de la Verge Maria<br>i es féu home.<br>"
        "Crucificat després per nosaltres<br>sota el poder de Ponç Pilat;<br>"
        "patí i fou sepultat,<br>i ressuscità el tercer dia,<br>"
        "com deien ja les Escriptures,<br>i se'n pujà al cel,<br>"
        "on seu a la dreta del Pare.<br>I tornarà gloriós<br>"
        "a judicar els vius i els morts,<br>i el seu regnat no tindrà fi.<br><br>"
        "Crec en l'Esperit Sant,<br>que és Senyor i infon la vida,<br>"
        "que procedeix del Pare i del Fill.<br>I juntament amb el Pare i el Fill<br>"
        "és adorat i glorificat;<br>que parlà per boca dels profetes.<br><br>"
        "I en una sola Església,<br>santa, catòlica i apostòlica.<br>"
        "Professo que hi ha un sol baptisme<br>per perdonar el pecat.<br>"
        "I espero la resurrecció dels morts,<br>i la vida de la glòria. Amén."
    ),
    501: (
        "Déu vos salve, Maria, plena de gràcia,<br>el Senyor és amb vós.<br>"
        "Beneïda sou vós entre totes les dones<br>"
        "i beneït és el fruit del vostre ventre, Jesús.<br><br>"
        "Santa Maria, Mare de Déu,<br>pregueu per nosaltres, pecadors,<br>"
        "ara i en l'hora de la nostra mort. Amén."
    ),
}


def load_batch_bodies() -> dict[int, str]:
    """Cossos traduïts en lots (`ca-prayers-bodies*.json`, id (string) -> HTML)."""
    import glob

    merged: dict[int, str] = {}
    for path in sorted(glob.glob(f"{SCRATCH}/ca-prayers-bodies*.json")):
        with open(path, encoding="utf-8") as fh:
            batch = json.load(fh)
        merged.update({int(k): v for k, v in batch.items()})
    return merged


def cpl_to_html(raw: str) -> str:
    """Text pla de cpl -> el mateix HTML que fan servir els cossos d'es/prayers.json."""
    blocks = []
    for block in raw.replace("\r\n", "\n").split("\n\n"):
        lines = [line.strip() for line in block.split("\n") if line.strip()]
        if lines:
            blocks.append("<br>".join(lines))
    return "<br><br>".join(blocks)


def main() -> None:
    with open(f"{BASE}/es/prayers.json", encoding="utf-8") as fh:
        es = json.load(fh)

    conn = sqlite3.connect(CPL_DB)
    try:
        cpl = {
            prayer_id: conn.execute(
                "SELECT oracio FROM diversos WHERE id = ?", (cpl_id,)
            ).fetchone()[0]
            for prayer_id, cpl_id in CPL_BODIES.items()
        }
    finally:
        conn.close()

    batch_bodies = load_batch_bodies()

    out = []
    pending = []
    from_cpl = []
    from_inline = []
    from_batch = []

    for entry in es:
        prayer_id = entry["id"]
        new = dict(entry)

        new["title"] = TITLES.get(prayer_id, entry["title"])
        if "info" in entry:
            new["info"] = INFO.get(prayer_id, entry["info"]) if entry["info"] else entry["info"]

        if prayer_id in cpl:
            new["val"] = cpl_to_html(cpl[prayer_id])
            from_cpl.append(prayer_id)
        elif prayer_id in INLINE_BODIES:
            new["val"] = INLINE_BODIES[prayer_id]
            from_inline.append(prayer_id)
        elif prayer_id in batch_bodies:
            new["val"] = batch_bodies[prayer_id]
            from_batch.append(prayer_id)
        else:
            pending.append(f"{prayer_id} — {new['title']}")

        out.append(new)

    with open(f"{BASE}/ca/prayers.json", "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=2)
        fh.write("\n")

    with open(f"{SCRATCH}/pending-prayers.json", "w", encoding="utf-8") as fh:
        json.dump(pending, fh, ensure_ascii=False, indent=2)

    print(f"✅ ca/prayers.json  ({len(out)} oracions)")
    print(f"   títols en català:       {len(out)}/{len(out)}")
    print(f"   cos oficial de cpl-app: {len(from_cpl)}  -> {from_cpl}")
    print(f"   cos català canònic:     {len(from_inline)}  -> {from_inline}")
    print(f"   cos traduït en lots:    {len(from_batch)}")
    print(f"   cos encara en castellà: {len(pending)}")


if __name__ == "__main__":
    main()
