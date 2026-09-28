#!/usr/bin/env bash
# What reached a store stays written in the repository, where the publishing website and whoever
# works on the code look for it:
#
# - the version goes into app.json on master, so the next build (the other store, a second try)
#   comes out with the same one without typing it again in the form;
# - the code that was built gets a tag, v9.0.1, like the versions published by hand before.
#
# When the form said a version that app.json did not, the tag goes on a commit on top of the one
# that was built with just that change, so the tag is exactly what the store has. master gets that
# same commit if it has not moved while building, or the same change on top of where it is.
#
# Run by the Publish workflow once at least one store has taken the build, from a checkout of the
# commit that was built. It needs VERSION, BUILD, ANDROID and IOS (the results of the two jobs);
# RUN, the address of the run, is optional.

set -euo pipefail

: "${VERSION:?}" "${BUILD:?}" "${ANDROID:?}" "${IOS:?}"

if [ "$ANDROID" = success ] && [ "$IOS" = success ]; then
  STORES='Android and iOS'
elif [ "$ANDROID" = success ]; then
  STORES=Android
elif [ "$IOS" = success ]; then
  STORES=iOS
else
  echo "No store took build $BUILD: there is nothing to keep." >&2
  exit 1
fi

app_version() {
  node -p "require('./app.json').expo.version"
}

# The same change, on whatever is checked out
write_version() {
  node -e '
    const fs = require("fs");
    const configuration = JSON.parse(fs.readFileSync("app.json", "utf8"));
    configuration.expo.version = process.argv[1];
    fs.writeFileSync("app.json", `${JSON.stringify(configuration, null, 2)}\n`);
  ' "$VERSION"
  git add app.json
  git commit -q -m "chore(release): $VERSION" \
    -m "Built as $BUILD and taken by $STORES.${RUN:+ Written by the Publish workflow: $RUN}"
}

git fetch -q --tags origin

BUILT=$(git rev-parse HEAD)
BEFORE=$(app_version)
if [ "$BEFORE" != "$VERSION" ]; then
  write_version
fi
RELEASE=$(git rev-parse HEAD)

TAG="v$VERSION"
if git rev-parse -q --verify "refs/tags/$TAG" > /dev/null; then
  # A tag that is out there is not moved: whoever has already fetched it would keep the old one
  if [ "$(git rev-parse "$TAG^{tree}")" = "$(git rev-parse "$RELEASE^{tree}")" ]; then
    TAGGED="l'etiqueta $TAG ja hi era"
  else
    TAGGED="⚠️ l'etiqueta $TAG ja hi era, amb un altre codi: aquest build duu el mateix número i no és igual"
  fi
else
  git tag -a "$TAG" -m "CPL $VERSION ($BUILD): $STORES" "$RELEASE"
  git push -q origin "refs/tags/$TAG"
  TAGGED="etiqueta $TAG"
fi

# master may have moved while this was building. The version is written there unless it already
# says it, or somebody has put another one in the meantime: that one was decided later.
MASTER=""
for attempt in 1 2 3; do
  git fetch -q origin master
  git checkout -q --detach origin/master
  NOW=$(app_version)
  if [ "$NOW" = "$VERSION" ]; then
    MASTER="master diu $VERSION"
    break
  fi
  if [ "$NOW" != "$BEFORE" ]; then
    MASTER="⚠️ master no s'ha tocat: mentrestant hi han posat la $NOW"
    break
  fi
  if [ "$(git rev-parse HEAD)" = "$BUILT" ]; then
    git checkout -q "$RELEASE"
  else
    write_version
  fi
  if git push -q origin HEAD:master; then
    MASTER="master diu $VERSION"
    break
  fi
  echo "master moved while pushing (attempt $attempt): again, from where it is now."
done
if [ -z "$MASTER" ]; then
  echo "Could not write $VERSION into app.json on master." >&2
  exit 1
fi

SAID="$TAGGED · $MASTER"
echo "$SAID"
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "said=$SAID" >> "$GITHUB_OUTPUT"
fi
