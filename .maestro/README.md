# Tests de punta a punta (Maestro)

Obren l'app de debò en un emulador o un mòbil i la fan servir com un usuari. Són la
comprovació que falta als tests de Jest: que els mòduls natius (base de dades, selectors,
webviews, calendari) funcionen dins d'un binari compilat.

    # una sola vegada
    curl -fsSL "https://get.maestro.mobile.dev" | bash

    # amb l'emulador obert i l'app instal·lada (appId cpl.cpl)
    maestro test .maestro/

Cada flux comença amb `clearState`: l'app com acabada d'instal·lar, la configuració per
defecte i el dia d'avui. Les comprovacions són sobre textos que no depenen del dia (els
encapçalaments HIMNE, SALMÒDIA, ORACIÓ…), així que es poden executar qualsevol dia. Les
captures queden a `~/.maestro/tests/<data>/`.
