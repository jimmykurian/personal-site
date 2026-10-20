# infrastructure/

OpenTofu modules for the site's Azure resources, with their tests. Nothing here deploys yet: the live resources were made in the portal. The repo-wide rules are in [../AGENTS.md](../AGENTS.md); this file covers working inside `infrastructure/`. Paths here are relative to `infrastructure/`.

## Map

- `modules/azure/resource-group` and `modules/azure/static-web-app`: the modules. They stay generic; the site's own values belong to whatever deploys them later.
- `tests/acceptance/<group>/<module_name>.tftest.hcl`: one test file per module.
- `tests/integration/<topic>/`: tests across modules. Each file's first line is `# module: <group>/<module>`.
- `scripts/run-module-tests.sh` runs the tests, and `scripts/check-provider-pins.sh` keeps the provider pins equal.
- No Terragrunt, environments or generated docs yet. Don't add them unless asked.

## Working here

- Use `tofu`, never `terraform`. Use `azurerm` from the OpenTofu registry (`registry.opentofu.org/hashicorp/azurerm`), pinned `~> 5.8.0` in every module, with the lock files committed.
- Every module change updates its matching test. Tests use a mocked provider and are written as Arrange, Act, Assert. Nothing here plans or applies against Azure.
- Verify with `task infra:check` (fmt, validate, TFLint, Checkov, the pin check) and `task infra:test`. CI runs both when `infrastructure/` changes.
- DNS stays at Namecheap, outside these modules.
- [README.md](README.md) covers the resources, the layout, the tools, the tests and the checks.
