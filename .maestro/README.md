# Tests de punta a punta (Maestro)

Obren l'app compilada en un emulador d'Android o un simulador d'iOS i la fan servir com un
usuari. Són la comprovació que falta als tests de Jest: que els mòduls natius (base de
dades, webviews, gràfics, lletres, pantalla encesa) funcionen dins d'un binari de veritat.

    # una sola vegada
    curl -fsSL "https://get.maestro.mobile.dev" | bash

    # Android: amb un emulador obert (o un mòbil connectat per adb)
    make android-app        # compila la release i la instal·la
    make ui-tests-android

    # iOS: amb un simulador obert (open -a Simulator)
    make ios-app            # compila la release per al simulador i la instal·la
    make ui-tests-ios

    make ui-tests           # totes dues

Els mateixos fluxos serveixen per a totes dues plataformes. On l'app es comporta diferent
hi ha una branca `when: platform:` —tornar enrere i el donatiu (un full a Android / Safari a
iOS). El calendari és el de l'app, igual a totes dues.

Cada flux comença amb `subflows/obrir.yaml`: `clearState`, l'app com acabada d'instal·lar, la
configuració per defecte i el dia d'avui, i tanca els avisos que surten en obrir-la (el de
mitjanit, de 0 a 3 h, i el de novetats, per si de cas: només surt a qui ve de la versió anterior,
i després d'un `clearState` l'app és nova). Les comprovacions són sobre textos
que no depenen del dia (els noms de les hores, els encapçalaments HIMNE, SALMÒDIA, ORACIÓ…),
així que es poden executar qualsevol dia. El que només passa alguns dies (la vida del sant, la
memòria lliure, la missa vespertina) es comprova quan hi és; els casos de cada dia concret els
proven els tests de Jest (`__tests__/Screens/Home.test.js`), amb el rellotge fixat. Les captures
queden a `~/.maestro/tests/<data>/`.

| Flux | Què comprova |
|---|---|
| 01-arrencada | L'inici: el dia en paraules, la setmana del salteri, les set hores i la missa |
| 02-hores | Les set hores s'obren des de l'inici i es llegeixen fins al final |
| 03-missa | L'Evangeli i la primera lectura; «Continua amb el Salm» |
| 04-configuracio | Diòcesi i tema es desen, i es mantenen en tornar a obrir l'app |
| 05-calendari | Canviar de dia amb el calendari, passant per la llista d'anys |
| 06-webs | Missatge i Donatiu, en un full que puja; el de Donatiu (Android) es tanca estirant-lo avall |
| 07-inici | Una hora des de l'inici, el botó Aa i el full de la vida del sant |
| 08-dissabte | Al proper dissabte: Avui / Vespertina i la memòria lliure |

Amb 16 GB de RAM, millor una plataforma cada vegada: l'emulador d'Android i el simulador
d'iOS alhora, amb una compilació al darrere, fan que el Mac enviï memòria al disc i els
fluxos s'arrosseguen fins a fallar per temps.
