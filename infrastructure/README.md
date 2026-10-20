# Infrastructure

OpenTofu modules for the Azure resources that host
[jimmykurian.me](https://www.jimmykurian.me), with their tests. The modules
aren't deployed from here yet: the live resources were created in the portal,
and nothing in this folder plans or applies them. The repo's architecture and
principles are in the [root README](../README.md), and the rules for coding
agents in [AGENTS.md](AGENTS.md).

| Resource | Live name | Module |
| --- | --- | --- |
| Resource group | `rg-personal-site` (East US 2) | `modules/azure/resource-group` |
| Static Web App | `jimmykurian-me` (Free plan) | `modules/azure/static-web-app` |
| Custom domains | `www.jimmykurian.me` (CNAME), `jimmykurian.me` (TXT) | `modules/azure/static-web-app` |

Everything lives in the personal Azure subscription ("Azure subscription 1").

The provider is `azurerm` from the OpenTofu registry
(`registry.opentofu.org/hashicorp/azurerm`). OpenTofu builds and signs it, and
recommends that name over `opentofu/azurerm`, which serves the same binaries.
Every module pins `~> 5.8.0` and commits its `.terraform.lock.hcl`.

## Layout

```text
infrastructure/
├── modules/
│   └── azure/
│       ├── resource-group/   # a resource group (name must start with rg-)
│       └── static-web-app/   # a Static Web App and its custom domains
├── tests/
│   ├── acceptance/azure/     # one test file per module
│   └── integration/          # checks across a module: secrets, the site's domains
├── scripts/                  # run tests, check provider pins
├── .checkov.yaml             # Checkov static scan of modules/
├── .tflint.hcl               # TFLint rules and plugins
├── .gitignore
├── AGENTS.md                 # rules for coding agents working here
└── README.md
```

The modules are generic: they take names, region, plan and domains as inputs
and know nothing about this site.

## Tools

OpenTofu, TFLint and Checkov are pinned in the root `.mise.toml`; `mise install`
installs them. From the repo root, `task infra:check` runs the checks below and
`task infra:test` the tests, as the Infrastructure job in `.github/workflows/ci.yml` does on
every change here.

## Tests

Test files live in `tests/`, not in the modules. `scripts/run-module-tests.sh`
copies each one into its module, runs `tofu test` there, and removes the copy
(`modules/**/*.tftest.hcl` is git-ignored in case a run is interrupted):

```sh
./scripts/run-module-tests.sh               # everything
./scripts/run-module-tests.sh acceptance
./scripts/run-module-tests.sh integration
```

- **Acceptance** (`tests/acceptance/<group>/<module_name>.tftest.hcl`): the
  file's path names its module, so `acceptance/azure/static_web_app` tests
  `modules/azure/static-web-app`. One file per module covers its resources,
  input validation and outputs.
- **Integration** (`tests/integration/<topic>/*.tftest.hcl`): checks that cut
  across a module, such as tokens never printing, no secrets stored on the app,
  and the site's own domains (`www` by CNAME, the apex by TXT). The first line
  names the module: `# module: azure/static-web-app`.

Tests use a mocked `azurerm` provider, so they need no Azure login and change
nothing. Write each run as Arrange, Act, Assert, with the steps marked in
comments, like the website's tests.

## Checks

```sh
tofu fmt -recursive -check
tofu -chdir=modules/azure/<module> init -backend=false   # then, for each module:
tofu -chdir=modules/azure/<module> validate
tflint --init && tflint --recursive --config "$PWD/.tflint.hcl"
checkov --config-file .checkov.yaml
./scripts/check-provider-pins.sh            # every module pins the same provider version
```

Checkov has no policies for Static Web Apps or resource groups yet, so it
reports nothing today; it covers any resource types added later. Accepted
findings are skipped on the resource with `#checkov:skip=<ID>:<reason>`.

## How the live resources were created

Until these modules deploy, this is the record of the portal setup:

1. Create a **Static Web App** on the **Free** plan. For the deployment source choose **Other**: the repo's workflow does the build.
2. Copy the app's **deployment token** (Overview, "Manage deployment token") into the GitHub repo secret `AZURE_STATIC_WEB_APPS_API_TOKEN`. The workflow builds `website/` and uploads `website/dist/` with it (`skip_app_build: true`), and pull requests get their own preview environment.
3. Under **Custom domains**, add `www.jimmykurian.me` and complete the CNAME validation. Then add `jimmykurian.me` as the apex, with TXT validation and an ALIAS record.
4. Set `www.jimmykurian.me` as the default domain so the apex redirects to it. `site` in `website/astro.config.mjs` must match the canonical host.

## Not managed here

- **DNS:** records live at Namecheap (BasicDNS). `www` is a CNAME to the app's
  `default_host_name`, and the apex is an ALIAS to the same host.
- **The default domain:** making `www` the default (so the apex redirects to
  it) is set in the portal; the provider has no setting for it.
- **The build and deploy:** GitHub Actions builds `website/` and uploads it with
  the deploy token. The module ignores the repository link those deploys set.
