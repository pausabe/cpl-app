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

# The token a workflow runs with cannot push a tag with git: GitHub counts a new tag as bringing
# in every file, `.github/workflows/publish.yml` among them, and refuses it. Through the API it is
# not a push and `contents: write` is enough, but then the commit has to be on the server already.
# That is why master goes first and the tag is put on what ended up there.
tag_release() {
  if [ -z "${GITHUB_REPOSITORY:-}" ]; then
    git tag -a "$TAG" -m "CPL $VERSION ($BUILD): $STORES" "$RELEASE"
    git push -q origin "refs/tags/$TAG"
    return
  fi
  local object
  object=$(gh api "repos/$GITHUB_REPOSITORY/git/tags" \
    -f tag="$TAG" -f message="CPL $VERSION ($BUILD): $STORES" \
    -f object="$RELEASE" -f type=commit --jq .sha)
  gh api "repos/$GITHUB_REPOSITORY/git/refs" -f ref="refs/tags/$TAG" -f sha="$object" --silent
}

git fetch -q --tags origin

BEFORE=$(app_version)

# master may have moved while this was building. The version is written there unless it already
# says it, or somebody has put another one in the meantime: that one was decided later.
MASTER=""
RELEASE=""
for attempt in 1 2 3; do
  git fetch -q origin master
  git checkout -q --detach origin/master
  NOW=$(app_version)
  if [ "$NOW" = "$VERSION" ]; then
    MASTER="master diu $VERSION"
    RELEASE=$(git rev-parse HEAD)
    break
  fi
  if [ "$NOW" != "$BEFORE" ]; then
    MASTER="⚠️ master no s'ha tocat: mentrestant hi han posat la $NOW"
    break
  fi
  write_version
  if git push -q origin HEAD:master; then
    MASTER="master diu $VERSION"
    RELEASE=$(git rev-parse HEAD)
    break
  fi
  echo "master moved while pushing (attempt $attempt): again, from where it is now."
done
if [ -z "$MASTER" ]; then
  echo "Could not write $VERSION into app.json on master." >&2
  exit 1
fi

TAG="v$VERSION"
if git rev-parse -q --verify "refs/tags/$TAG" > /dev/null; then
  # A tag that is out there is not moved: whoever has already fetched it would keep the old one
  if [ -n "$RELEASE" ] && [ "$(git rev-parse "$TAG^{tree}")" = "$(git rev-parse "$RELEASE^{tree}")" ]; then
    TAGGED="l'etiqueta $TAG ja hi era"
  else
    TAGGED="⚠️ l'etiqueta $TAG ja hi era, amb un altre codi: aquest build duu el mateix número i no és igual"
  fi
elif [ -n "$RELEASE" ]; then
  tag_release
  TAGGED="etiqueta $TAG"
else
  TAGGED="⚠️ sense etiqueta $TAG: la versió no ha arribat a master i no hi ha res a etiquetar"
fi

SAID="$TAGGED · $MASTER"
echo "$SAID"
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "said=$SAID" >> "$GITHUB_OUTPUT"
fi
