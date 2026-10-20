#!/bin/bash
# Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
# Author: Jimmy Kurian
set -eo pipefail

# Fails unless every module pins each provider to the same source and version,
# so the modules always test and deploy together on one provider release.
#
# Usage: ./scripts/check-provider-pins.sh

cd "$(dirname "$0")/.."

# Prints "source<TAB>version" for every source/version pair in a file.
pins() {
  awk '
    /source[[:space:]]*=/ && /\// { gsub(/.*=[[:space:]]*"|".*/, ""); src = $0 }
    /version[[:space:]]*=/ && src != "" { gsub(/.*=[[:space:]]*"|".*/, ""); print src "\t" $0; src = "" }
  ' "$1"
}

ALL_PINS="$(for file in modules/*/*/versions.tf; do pins "$file" | sed "s|^|$file\t|"; done)"
FAILED=0

while read -r source; do
  versions="$(awk -F '\t' -v s="$source" '$2 == s { print $3 }' <<< "$ALL_PINS" | sort -u)"
  if [[ "$(wc -l <<< "$versions")" -gt 1 ]]; then
    echo "$source is pinned differently across modules:"
    awk -F '\t' -v s="$source" '$2 == s { print "  " $1 ": " $3 }' <<< "$ALL_PINS"
    FAILED=1
  fi
done < <(awk -F '\t' '{ print $2 }' <<< "$ALL_PINS" | sort -u)

if [[ "$FAILED" -eq 0 ]]; then
  echo "Provider pins match across modules"
fi
exit "$FAILED"
