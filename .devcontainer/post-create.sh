#!/bin/bash
# Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
# Author: Jimmy Kurian
set -euo pipefail

# Runs once when the devcontainer is created: tools, dependencies, Chrome and git hooks.

cd "$(dirname "$0")/.."

mise install
# New shells get the tools on PATH.
# shellcheck disable=SC2016 # written to .bashrc unexpanded
grep -q 'mise activate' ~/.bashrc || echo 'eval "$(mise activate bash)"' >> ~/.bashrc
eval "$(mise activate bash --shims)"

# pnpm at the version pinned by packageManager in website/package.json.
corepack enable pnpm
task install
# The e2e tests, the resume PDF and Lighthouse use Google Chrome (amd64 only, as in Codespaces).
pnpm --dir website exec playwright install --with-deps chrome
task hooks:install
