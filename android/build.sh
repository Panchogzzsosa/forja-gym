#!/usr/bin/env bash
set -euo pipefail

# Android SDK platform 35 and build-tools 35.0.0.
project="$(cd "$(dirname "$0")/.." && pwd)"
platform="${FORJA_PLATFORM_JAR:-${ANDROID_HOME:-}/platforms/android-35/android.jar}"
tools="${FORJA_BUILD_TOOLS:-${ANDROID_HOME:-}/build-tools/35.0.0}"
key="${FORJA_KEYSTORE:?Set FORJA_KEYSTORE to the signing keystore path}"
signing_options=()
if [[ -n "${FORJA_KEY_PASSWORD_FILE:-}" ]]; then
  signing_options=(--ks-pass "file:$FORJA_KEY_PASSWORD_FILE")
fi
output="${1:-$project/Forja.apk}"
build="$(mktemp -d)"
trap 'rm -rf "$build"' EXIT

mkdir "$build/classes" "$build/dex"
"$tools/aapt2" compile --dir "$project/android/res" -o "$build/res.zip"
"$tools/aapt2" link --manifest "$project/android/AndroidManifest.xml" -I "$platform" \
  -A "$project/app" -o "$build/assets.apk" "$build/res.zip"
javac -encoding UTF-8 -source 8 -target 8 -classpath "$platform" -d "$build/classes" \
  "$project/android/src/mx/forja/app/MainActivity.java"
jar cf "$build/classes.jar" -C "$build/classes" .
"$tools/d8" --lib "$platform" --min-api 30 --output "$build/dex" "$build/classes.jar"
(cd "$build/dex" && zip -q "$build/assets.apk" classes.dex)
"$tools/zipalign" -f 4 "$build/assets.apk" "$build/aligned.apk"
"$tools/apksigner" sign --v4-signing-enabled false --ks "$key" ${signing_options[@]+"${signing_options[@]}"} --out "$output" "$build/aligned.apk"
"$tools/apksigner" verify "$output"
