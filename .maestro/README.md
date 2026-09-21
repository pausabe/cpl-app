# Tests de punta a punta (Maestro)

Obren l'app compilada en un emulador d'Android o un simulador d'iOS i la fan servir com un
usuari. Són la comprovació que falta als tests de Jest: que els mòduls natius (base de
dades, selectors, webviews, calendari) funcionen dins d'un binari de veritat.

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
hi ha una branca `when: platform:` —tornar enrere, el calendari (diàleg d'Android / calendari
propi a iOS) i el donatiu (webview a Android / Safari a iOS).

Cada flux comença amb `clearState`: l'app com acabada d'instal·lar, la configuració per
defecte i el dia d'avui. Les comprovacions són sobre textos que no depenen del dia (els
encapçalaments HIMNE, SALMÒDIA, ORACIÓ…), així que es poden executar qualsevol dia. Les
captures queden a `~/.maestro/tests/<data>/`.

Amb 16 GB de RAM, millor una plataforma cada vegada: l'emulador d'Android i el simulador
d'iOS alhora, amb una compilació al darrere, fan que el Mac enviï memòria al disc i els
fluxos s'arrosseguen fins a fallar per temps.
