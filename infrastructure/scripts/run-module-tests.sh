#!/bin/bash
# Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
# Author: Jimmy Kurian
set -eo pipefail

# Runs the OpenTofu tests in tests/ against their modules. Each test file is
# copied into its module, run there with `tofu test`, then removed.
#
#   tests/acceptance/<group>/<module_name>.tftest.hcl -> modules/<group>/<module-name>
#   tests/integration/**/*.tftest.hcl                 -> the "# module: <group>/<module-name>" first line
#
# Usage: ./scripts/run-module-tests.sh [all|acceptance|integration]

cd "$(dirname "$0")/.."

TEST_TYPE="${1:-all}"
PASSED=0
FAILED=0
COPIED=""

cleanup() {
  # An if, not &&: a false test here would become the script's exit status.
  if [[ -n "$COPIED" ]]; then rm -f "$COPIED"; fi
}
trap cleanup EXIT

module_for() {
  local test_file="$1"
  case "$test_file" in
    tests/acceptance/*)
      local group name
      group="$(basename "$(dirname "$test_file")")"
      name="$(basename "$test_file" .tftest.hcl)"
      echo "modules/$group/${name//_/-}"
      ;;
    tests/integration/*)
      local target
      target="$(sed -nE '1s/^# module: ([a-z0-9/-]+)$/\1/p' "$test_file")"
      [[ -n "$target" ]] && echo "modules/$target"
      ;;
  esac
}

run_test() {
  local test_file="$1"
  local module_dir
  module_dir="$(module_for "$test_file")"

  echo ""
  echo "=== ${test_file#tests/}"

  if [[ -z "$module_dir" || ! -d "$module_dir" ]]; then
    echo "    No module found (expected ${module_dir:-a \"# module:\" first line})"
    FAILED=$((FAILED + 1))
    return
  fi
  echo "    Module: $module_dir"

  local test_name
  test_name="$(basename "$test_file")"
  if [[ -e "$module_dir/$test_name" ]]; then
    echo "    $module_dir/$test_name already exists; remove it first"
    FAILED=$((FAILED + 1))
    return
  fi

  cp "$test_file" "$module_dir/$test_name"
  COPIED="$module_dir/$test_name"

  if (cd "$module_dir" && tofu init -backend=false -input=false > /dev/null && tofu test -filter="$test_name"); then
    PASSED=$((PASSED + 1))
  else
    FAILED=$((FAILED + 1))
  fi

  rm -f "$COPIED"
  COPIED=""
}

case "$TEST_TYPE" in
  all) dirs=(tests/acceptance tests/integration) ;;
  acceptance | integration) dirs=("tests/$TEST_TYPE") ;;
  *)
    echo "Usage: $0 [all|acceptance|integration]"
    exit 2
    ;;
esac

while IFS= read -r test_file; do
  run_test "$test_file"
done < <(find "${dirs[@]}" -name '*.tftest.hcl' | sort)

echo ""
echo "=== $PASSED passed, $FAILED failed"
[[ "$FAILED" -eq 0 && "$PASSED" -gt 0 ]]
